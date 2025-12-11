import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

async function getPterodactylConfig(supabase: any) {
  const { data, error } = await supabase
    .from("server_integrations")
    .select("*")
    .eq("type", "pterodactyl")
    .eq("enabled", true)
    .single();
  
  if (error || !data) {
    throw new Error("Pterodactyl panel not configured");
  }
  
  return { apiUrl: data.api_url, apiKey: data.api_key };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  try {
    const body = await req.json();
    const { action, orderId, serverDetails, serverId, apiUrl: testApiUrl, apiKey: testApiKey } = body;

    console.log(`Pterodactyl action: ${action}`);

    // For test action, use provided credentials
    if (action === "test") {
      return await handleTestConnection(testApiUrl, testApiKey, corsHeaders);
    }

    // For get-panel-data, fetch nests/nodes/eggs
    if (action === "get-panel-data") {
      const config = await getPterodactylConfig(supabase);
      return await handleGetPanelData(config.apiUrl, config.apiKey, corsHeaders);
    }

    // Get config from database for all other actions
    const config = await getPterodactylConfig(supabase);
    const apiHeaders = {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    switch (action) {
      case "create": {
        const result = await createServer(config.apiUrl, apiHeaders, orderId, serverDetails, supabase);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "suspend": {
        const result = await suspendServer(config.apiUrl, apiHeaders, serverId);
        await supabase.from("orders").update({ status: "suspended" }).eq("server_id", serverId);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "unsuspend": {
        const result = await unsuspendServer(config.apiUrl, apiHeaders, serverId);
        await supabase.from("orders").update({ status: "active" }).eq("server_id", serverId);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "terminate": {
        const result = await terminateServer(config.apiUrl, apiHeaders, serverId);
        await supabase.from("orders").update({ status: "terminated", server_id: null }).eq("server_id", serverId);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "status": {
        const result = await getServerStatus(config.apiUrl, apiHeaders, serverId);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error("Pterodactyl API error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleTestConnection(apiUrl: string, apiKey: string, corsHeaders: any) {
  try {
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    const [nodesRes, serversRes] = await Promise.all([
      fetch(`${apiUrl}/api/application/nodes`, { headers }),
      fetch(`${apiUrl}/api/application/servers`, { headers }),
    ]);

    if (!nodesRes.ok || !serversRes.ok) {
      throw new Error("Failed to connect to panel");
    }

    const nodesData = await nodesRes.json();
    const serversData = await serversRes.json();

    return new Response(JSON.stringify({
      success: true,
      nodes: nodesData.meta?.pagination?.total || nodesData.data?.length || 0,
      servers: serversData.meta?.pagination?.total || serversData.data?.length || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function handleGetPanelData(apiUrl: string, apiKey: string, corsHeaders: any) {
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  try {
    // Fetch nests with eggs
    const nestsRes = await fetch(`${apiUrl}/api/application/nests?include=eggs`, { headers });
    const nodesRes = await fetch(`${apiUrl}/api/application/nodes`, { headers });

    if (!nestsRes.ok || !nodesRes.ok) {
      throw new Error("Failed to fetch panel data");
    }

    const nestsData = await nestsRes.json();
    const nodesData = await nodesRes.json();

    const nests = nestsData.data?.map((nest: any) => ({
      id: nest.attributes.id,
      name: nest.attributes.name,
      eggs: nest.attributes.relationships?.eggs?.data?.map((egg: any) => ({
        id: egg.attributes.id,
        name: egg.attributes.name,
        docker_image: egg.attributes.docker_image,
        startup: egg.attributes.startup,
      })) || [],
    })) || [];

    const nodes = nodesData.data?.map((node: any) => ({
      id: node.attributes.id,
      name: node.attributes.name,
      memory: node.attributes.memory,
      disk: node.attributes.disk,
    })) || [];

    return new Response(JSON.stringify({ nests, nodes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function createServer(
  apiUrl: string,
  headers: Record<string, string>,
  orderId: string,
  serverDetails: any,
  supabase: any
) {
  console.log("Creating server for order:", orderId, serverDetails);

  // Get order details
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, profiles:user_id(email)")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new Error("Order not found");
  }

  // Get plan config with Pterodactyl settings
  const { data: planConfig } = await supabase
    .from("game_plans")
    .select("*")
    .eq("plan_id", serverDetails.plan_id)
    .single();

  // Get or create Pterodactyl user
  const userEmail = order.profiles?.email || `user-${order.user_id}@gamehost.com`;
  const pterodactylUser = await getOrCreateUser(apiUrl, headers, userEmail);

  // Use plan config or defaults
  const eggId = planConfig?.pterodactyl_egg_id || 1;
  const nestId = planConfig?.pterodactyl_nest_id || 1;
  const limits = planConfig?.pterodactyl_limits || { memory: 1024, swap: 0, disk: 10240, io: 500, cpu: 100 };
  const featureLimits = planConfig?.pterodactyl_feature_limits || { databases: 1, backups: 2, allocations: 1 };
  const dockerImage = planConfig?.pterodactyl_docker_image || "ghcr.io/pterodactyl/yolks:java_17";
  const startup = planConfig?.pterodactyl_startup || "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}";
  const environment = planConfig?.pterodactyl_environment || {};

  // Find available allocation
  const allocation = await findAvailableAllocation(apiUrl, headers, planConfig?.pterodactyl_node_id);

  const serverPayload = {
    name: serverDetails.name || `Server-${orderId.slice(0, 8)}`,
    user: pterodactylUser.id,
    egg: eggId,
    docker_image: dockerImage,
    startup: startup,
    environment: {
      SERVER_JARFILE: "server.jar",
      VANILLA_VERSION: "latest",
      ...environment,
    },
    limits: limits,
    feature_limits: featureLimits,
    allocation: {
      default: allocation.id,
    },
  };

  console.log("Creating server with payload:", JSON.stringify(serverPayload));

  const response = await fetch(`${apiUrl}/api/application/servers`, {
    method: "POST",
    headers,
    body: JSON.stringify(serverPayload),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Pterodactyl API error:", errorData);
    throw new Error(`Failed to create server: ${response.statusText}`);
  }

  const serverData = await response.json();
  const serverId = serverData.attributes.identifier;

  console.log("Server created successfully:", serverId);

  // Update order with server ID
  await supabase
    .from("orders")
    .update({
      server_id: serverId,
      status: "active",
      server_details: {
        ...serverDetails,
        pterodactyl_id: serverData.attributes.id,
        pterodactyl_uuid: serverData.attributes.uuid,
        pterodactyl_identifier: serverId,
        ip: allocation.ip,
        port: allocation.port,
      },
    })
    .eq("id", orderId);

  return {
    success: true,
    serverId: serverId,
    serverDetails: {
      id: serverData.attributes.id,
      uuid: serverData.attributes.uuid,
      identifier: serverId,
      name: serverData.attributes.name,
      ip: allocation.ip,
      port: allocation.port,
    },
  };
}

async function getOrCreateUser(apiUrl: string, headers: Record<string, string>, email: string) {
  // Search for existing user
  const searchResponse = await fetch(
    `${apiUrl}/api/application/users?filter[email]=${encodeURIComponent(email)}`,
    { headers }
  );

  if (searchResponse.ok) {
    const searchData = await searchResponse.json();
    if (searchData.data && searchData.data.length > 0) {
      console.log("Found existing Pterodactyl user:", searchData.data[0].attributes.id);
      return { id: searchData.data[0].attributes.id };
    }
  }

  // Create new user
  const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").substring(0, 20);
  const password = generatePassword();

  const createResponse = await fetch(`${apiUrl}/api/application/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: email,
      username: username,
      first_name: username,
      last_name: "User",
      password: password,
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("Failed to create user:", errorText);
    throw new Error("Failed to create Pterodactyl user");
  }

  const userData = await createResponse.json();
  console.log("Created new Pterodactyl user:", userData.attributes.id);

  return { id: userData.attributes.id, password };
}

async function findAvailableAllocation(apiUrl: string, headers: Record<string, string>, nodeId?: number) {
  // Get nodes
  const nodesResponse = await fetch(`${apiUrl}/api/application/nodes`, { headers });
  const nodesData = await nodesResponse.json();

  if (!nodesData.data || nodesData.data.length === 0) {
    throw new Error("No nodes available");
  }

  // Use specified node or first available
  const selectedNodeId = nodeId || nodesData.data[0].attributes.id;
  
  const allocationsResponse = await fetch(
    `${apiUrl}/api/application/nodes/${selectedNodeId}/allocations`,
    { headers }
  );
  const allocationsData = await allocationsResponse.json();

  // Find unassigned allocation
  const availableAllocation = allocationsData.data?.find(
    (a: any) => !a.attributes.assigned
  );

  if (!availableAllocation) {
    throw new Error("No available allocations");
  }

  return {
    id: availableAllocation.attributes.id,
    ip: availableAllocation.attributes.ip,
    port: availableAllocation.attributes.port,
  };
}

async function suspendServer(apiUrl: string, headers: Record<string, string>, serverId: string) {
  const serverResponse = await fetch(
    `${apiUrl}/api/application/servers/external/${serverId}`,
    { headers }
  );

  if (!serverResponse.ok) {
    throw new Error("Server not found");
  }

  const serverData = await serverResponse.json();
  const internalId = serverData.attributes.id;

  const response = await fetch(
    `${apiUrl}/api/application/servers/${internalId}/suspend`,
    { method: "POST", headers }
  );

  if (!response.ok) {
    throw new Error("Failed to suspend server");
  }

  console.log("Server suspended:", serverId);
  return { success: true, message: "Server suspended" };
}

async function unsuspendServer(apiUrl: string, headers: Record<string, string>, serverId: string) {
  const serverResponse = await fetch(
    `${apiUrl}/api/application/servers/external/${serverId}`,
    { headers }
  );

  if (!serverResponse.ok) {
    throw new Error("Server not found");
  }

  const serverData = await serverResponse.json();
  const internalId = serverData.attributes.id;

  const response = await fetch(
    `${apiUrl}/api/application/servers/${internalId}/unsuspend`,
    { method: "POST", headers }
  );

  if (!response.ok) {
    throw new Error("Failed to unsuspend server");
  }

  console.log("Server unsuspended:", serverId);
  return { success: true, message: "Server unsuspended" };
}

async function terminateServer(apiUrl: string, headers: Record<string, string>, serverId: string) {
  const serverResponse = await fetch(
    `${apiUrl}/api/application/servers/external/${serverId}`,
    { headers }
  );

  if (!serverResponse.ok) {
    throw new Error("Server not found");
  }

  const serverData = await serverResponse.json();
  const internalId = serverData.attributes.id;

  const response = await fetch(
    `${apiUrl}/api/application/servers/${internalId}`,
    { method: "DELETE", headers }
  );

  if (!response.ok) {
    throw new Error("Failed to terminate server");
  }

  console.log("Server terminated:", serverId);
  return { success: true, message: "Server terminated" };
}

async function getServerStatus(apiUrl: string, headers: Record<string, string>, serverId: string) {
  const response = await fetch(
    `${apiUrl}/api/application/servers/external/${serverId}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error("Server not found");
  }

  const serverData = await response.json();

  return {
    success: true,
    server: {
      id: serverData.attributes.identifier,
      name: serverData.attributes.name,
      status: serverData.attributes.status,
      suspended: serverData.attributes.suspended,
      limits: serverData.attributes.limits,
    },
  };
}

function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
