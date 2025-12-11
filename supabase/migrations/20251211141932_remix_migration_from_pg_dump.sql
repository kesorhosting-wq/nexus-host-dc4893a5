CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: branding_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branding_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_name text DEFAULT 'NexusHost'::text NOT NULL,
    tagline text DEFAULT 'Premium Game Server Hosting'::text,
    logo_url text,
    hero_background_url text,
    favicon_url text,
    og_image_url text,
    primary_color text DEFAULT '258 100% 60%'::text,
    accent_color text DEFAULT '280 100% 65%'::text,
    hero_title text DEFAULT 'Premium Game Server Hosting'::text,
    hero_subtitle text DEFAULT 'Experience lightning-fast performance with our enterprise-grade servers.'::text,
    hero_stats jsonb DEFAULT '[{"label": "Uptime", "value": "99.9%"}, {"label": "Support", "value": "24/7"}, {"label": "Locations", "value": "50+"}]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    light_theme_name text DEFAULT 'Premium Silver'::text,
    light_theme_primary text DEFAULT '220 15% 45%'::text,
    light_theme_accent text DEFAULT '220 20% 60%'::text,
    dark_theme_name text DEFAULT 'Premium Gold'::text,
    dark_theme_primary text DEFAULT '45 80% 50%'::text,
    dark_theme_accent text DEFAULT '35 70% 45%'::text,
    social_facebook text DEFAULT ''::text,
    social_tiktok text DEFAULT ''::text,
    social_telegram text DEFAULT ''::text,
    social_youtube text DEFAULT ''::text,
    footer_description text DEFAULT 'Premium game server hosting with enterprise-grade infrastructure.'::text
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    slug text NOT NULL,
    icon text DEFAULT '📦'::text,
    sort_order integer DEFAULT 0,
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: game_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    game_id text NOT NULL,
    plan_id text NOT NULL,
    name text NOT NULL,
    ram text,
    cpu text,
    storage text,
    slots text,
    price numeric(10,2) DEFAULT 0,
    order_link text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    pterodactyl_egg_id integer,
    pterodactyl_nest_id integer,
    pterodactyl_node_id integer,
    pterodactyl_docker_image text,
    pterodactyl_startup text,
    pterodactyl_environment jsonb DEFAULT '{}'::jsonb,
    pterodactyl_limits jsonb DEFAULT '{"io": 500, "cpu": 100, "disk": 10240, "swap": 0, "memory": 1024}'::jsonb,
    pterodactyl_feature_limits jsonb DEFAULT '{"backups": 2, "databases": 1, "allocations": 1}'::jsonb
);


--
-- Name: games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.games (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    game_id text NOT NULL,
    name text NOT NULL,
    description text,
    icon text DEFAULT '🎮'::text,
    enabled boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hardware; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hardware (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hardware_id text NOT NULL,
    name text NOT NULL,
    description text,
    specs text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    description text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid,
    invoice_number text NOT NULL,
    status text DEFAULT 'unpaid'::text NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    tax numeric(10,2) DEFAULT 0,
    discount numeric(10,2) DEFAULT 0,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    due_date timestamp with time zone NOT NULL,
    paid_at timestamp with time zone,
    payment_method text,
    transaction_id text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    location_id text NOT NULL,
    name text NOT NULL,
    country text,
    flag text,
    ping text,
    enabled boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid,
    status text DEFAULT 'pending'::text NOT NULL,
    price numeric(10,2) NOT NULL,
    billing_cycle text DEFAULT 'monthly'::text NOT NULL,
    next_due_date timestamp with time zone,
    server_id text,
    server_details jsonb DEFAULT '{}'::jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_gateways; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_gateways (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    enabled boolean DEFAULT false,
    config jsonb DEFAULT '{}'::jsonb,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    invoice_id uuid,
    gateway_id uuid,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text,
    status text DEFAULT 'pending'::text NOT NULL,
    transaction_id text,
    gateway_response jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid,
    name text NOT NULL,
    description text,
    slug text NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    setup_fee numeric(10,2) DEFAULT 0,
    billing_cycle text DEFAULT 'monthly'::text,
    stock integer DEFAULT '-1'::integer,
    sort_order integer DEFAULT 0,
    enabled boolean DEFAULT true,
    features jsonb DEFAULT '[]'::jsonb,
    server_config jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: seasonal_themes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seasonal_themes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    theme_id text NOT NULL,
    name text NOT NULL,
    icon text,
    enabled boolean DEFAULT false,
    decorations text[] DEFAULT '{}'::text[],
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: server_integrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.server_integrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'pterodactyl'::text NOT NULL,
    api_url text NOT NULL,
    api_key text NOT NULL,
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ticket_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_replies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    user_id uuid NOT NULL,
    message text NOT NULL,
    is_staff boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid,
    subject text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text,
    department text DEFAULT 'general'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: branding_settings branding_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branding_settings
    ADD CONSTRAINT branding_settings_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: game_plans game_plans_game_id_plan_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_plans
    ADD CONSTRAINT game_plans_game_id_plan_id_key UNIQUE (game_id, plan_id);


--
-- Name: game_plans game_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_plans
    ADD CONSTRAINT game_plans_pkey PRIMARY KEY (id);


--
-- Name: games games_game_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_game_id_key UNIQUE (game_id);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: hardware hardware_hardware_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hardware
    ADD CONSTRAINT hardware_hardware_id_key UNIQUE (hardware_id);


--
-- Name: hardware hardware_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hardware
    ADD CONSTRAINT hardware_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: locations locations_location_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_location_id_key UNIQUE (location_id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_gateways payment_gateways_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateways
    ADD CONSTRAINT payment_gateways_pkey PRIMARY KEY (id);


--
-- Name: payment_gateways payment_gateways_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateways
    ADD CONSTRAINT payment_gateways_slug_key UNIQUE (slug);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: seasonal_themes seasonal_themes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasonal_themes
    ADD CONSTRAINT seasonal_themes_pkey PRIMARY KEY (id);


--
-- Name: seasonal_themes seasonal_themes_theme_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasonal_themes
    ADD CONSTRAINT seasonal_themes_theme_id_key UNIQUE (theme_id);


--
-- Name: server_integrations server_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.server_integrations
    ADD CONSTRAINT server_integrations_pkey PRIMARY KEY (id);


--
-- Name: ticket_replies ticket_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_replies
    ADD CONSTRAINT ticket_replies_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: branding_settings update_branding_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_branding_settings_updated_at BEFORE UPDATE ON public.branding_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: categories update_categories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: games update_games_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payment_gateways update_payment_gateways_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payment_gateways_updated_at BEFORE UPDATE ON public.payment_gateways FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: server_integrations update_server_integrations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_server_integrations_updated_at BEFORE UPDATE ON public.server_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tickets update_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: game_plans game_plans_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_plans
    ADD CONSTRAINT game_plans_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: orders orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: payments payments_gateway_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_gateway_id_fkey FOREIGN KEY (gateway_id) REFERENCES public.payment_gateways(id) ON DELETE SET NULL;


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ticket_replies ticket_replies_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_replies
    ADD CONSTRAINT ticket_replies_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: tickets tickets_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: game_plans Admins can delete game_plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete game_plans" ON public.game_plans FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: games Admins can delete games; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete games" ON public.games FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: hardware Admins can delete hardware; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete hardware" ON public.hardware FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: locations Admins can delete locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete locations" ON public.locations FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: seasonal_themes Admins can delete seasonal_themes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete seasonal_themes" ON public.seasonal_themes FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: branding_settings Admins can insert branding; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert branding" ON public.branding_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: game_plans Admins can insert game_plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert game_plans" ON public.game_plans FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: games Admins can insert games; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert games" ON public.games FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: hardware Admins can insert hardware; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert hardware" ON public.hardware FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: locations Admins can insert locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert locations" ON public.locations FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: seasonal_themes Admins can insert seasonal_themes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert seasonal_themes" ON public.seasonal_themes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoice_items Admins can manage all invoice items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all invoice items" ON public.invoice_items USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoices Admins can manage all invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all invoices" ON public.invoices USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: orders Admins can manage all orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all orders" ON public.orders USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: payments Admins can manage all payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all payments" ON public.payments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ticket_replies Admins can manage all ticket replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all ticket replies" ON public.ticket_replies USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tickets Admins can manage all tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all tickets" ON public.tickets USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: categories Admins can manage categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage categories" ON public.categories USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: payment_gateways Admins can manage payment gateways; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage payment gateways" ON public.payment_gateways USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: products Admins can manage products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage products" ON public.products USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: server_integrations Admins can manage server integrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage server integrations" ON public.server_integrations USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: branding_settings Admins can update branding; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update branding" ON public.branding_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: game_plans Admins can update game_plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update game_plans" ON public.game_plans FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: games Admins can update games; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update games" ON public.games FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: hardware Admins can update hardware; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update hardware" ON public.hardware FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: locations Admins can update locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update locations" ON public.locations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: seasonal_themes Admins can update seasonal_themes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update seasonal_themes" ON public.seasonal_themes FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: branding_settings Anyone can view branding; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view branding" ON public.branding_settings FOR SELECT USING (true);


--
-- Name: categories Anyone can view categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);


--
-- Name: payment_gateways Anyone can view enabled payment gateways; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view enabled payment gateways" ON public.payment_gateways FOR SELECT USING ((enabled = true));


--
-- Name: game_plans Anyone can view game_plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view game_plans" ON public.game_plans FOR SELECT USING (true);


--
-- Name: games Anyone can view games; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view games" ON public.games FOR SELECT USING (true);


--
-- Name: hardware Anyone can view hardware; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view hardware" ON public.hardware FOR SELECT USING (true);


--
-- Name: locations Anyone can view locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view locations" ON public.locations FOR SELECT USING (true);


--
-- Name: products Anyone can view products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);


--
-- Name: seasonal_themes Anyone can view seasonal_themes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view seasonal_themes" ON public.seasonal_themes FOR SELECT USING (true);


--
-- Name: orders Users can create own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: tickets Users can create own tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own tickets" ON public.tickets FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ticket_replies Users can create replies to own tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create replies to own tickets" ON public.ticket_replies FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.tickets
  WHERE ((tickets.id = ticket_replies.ticket_id) AND (tickets.user_id = auth.uid())))));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: tickets Users can update own tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own tickets" ON public.tickets FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: invoice_items Users can view own invoice items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own invoice items" ON public.invoice_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.invoices
  WHERE ((invoices.id = invoice_items.invoice_id) AND (invoices.user_id = auth.uid())))));


--
-- Name: invoices Users can view own invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: orders Users can view own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: payments Users can view own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ticket_replies Users can view own ticket replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own ticket replies" ON public.ticket_replies FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.tickets
  WHERE ((tickets.id = ticket_replies.ticket_id) AND (tickets.user_id = auth.uid())))));


--
-- Name: tickets Users can view own tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: branding_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: game_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.game_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: games; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

--
-- Name: hardware; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hardware ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: locations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_gateways; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: seasonal_themes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seasonal_themes ENABLE ROW LEVEL SECURITY;

--
-- Name: server_integrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.server_integrations ENABLE ROW LEVEL SECURITY;

--
-- Name: ticket_replies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

--
-- Name: tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


