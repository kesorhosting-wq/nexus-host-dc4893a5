export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      branding_settings: {
        Row: {
          accent_color: string | null
          created_at: string
          dark_theme_accent: string | null
          dark_theme_name: string | null
          dark_theme_primary: string | null
          favicon_url: string | null
          footer_description: string | null
          hero_background_url: string | null
          hero_stats: Json | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          light_theme_accent: string | null
          light_theme_name: string | null
          light_theme_primary: string | null
          logo_url: string | null
          og_image_url: string | null
          primary_color: string | null
          site_name: string
          social_facebook: string | null
          social_telegram: string | null
          social_tiktok: string | null
          social_youtube: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          dark_theme_accent?: string | null
          dark_theme_name?: string | null
          dark_theme_primary?: string | null
          favicon_url?: string | null
          footer_description?: string | null
          hero_background_url?: string | null
          hero_stats?: Json | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          light_theme_accent?: string | null
          light_theme_name?: string | null
          light_theme_primary?: string | null
          logo_url?: string | null
          og_image_url?: string | null
          primary_color?: string | null
          site_name?: string
          social_facebook?: string | null
          social_telegram?: string | null
          social_tiktok?: string | null
          social_youtube?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          dark_theme_accent?: string | null
          dark_theme_name?: string | null
          dark_theme_primary?: string | null
          favicon_url?: string | null
          footer_description?: string | null
          hero_background_url?: string | null
          hero_stats?: Json | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          light_theme_accent?: string | null
          light_theme_name?: string | null
          light_theme_primary?: string | null
          logo_url?: string | null
          og_image_url?: string | null
          primary_color?: string | null
          site_name?: string
          social_facebook?: string | null
          social_telegram?: string | null
          social_tiktok?: string | null
          social_youtube?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      game_plans: {
        Row: {
          cpu: string | null
          created_at: string
          game_id: string
          id: string
          name: string
          order_link: string | null
          plan_id: string
          price: number | null
          pterodactyl_docker_image: string | null
          pterodactyl_egg_id: number | null
          pterodactyl_environment: Json | null
          pterodactyl_feature_limits: Json | null
          pterodactyl_limits: Json | null
          pterodactyl_nest_id: number | null
          pterodactyl_node_id: number | null
          pterodactyl_startup: string | null
          ram: string | null
          slots: string | null
          sort_order: number | null
          storage: string | null
        }
        Insert: {
          cpu?: string | null
          created_at?: string
          game_id: string
          id?: string
          name: string
          order_link?: string | null
          plan_id: string
          price?: number | null
          pterodactyl_docker_image?: string | null
          pterodactyl_egg_id?: number | null
          pterodactyl_environment?: Json | null
          pterodactyl_feature_limits?: Json | null
          pterodactyl_limits?: Json | null
          pterodactyl_nest_id?: number | null
          pterodactyl_node_id?: number | null
          pterodactyl_startup?: string | null
          ram?: string | null
          slots?: string | null
          sort_order?: number | null
          storage?: string | null
        }
        Update: {
          cpu?: string | null
          created_at?: string
          game_id?: string
          id?: string
          name?: string
          order_link?: string | null
          plan_id?: string
          price?: number | null
          pterodactyl_docker_image?: string | null
          pterodactyl_egg_id?: number | null
          pterodactyl_environment?: Json | null
          pterodactyl_feature_limits?: Json | null
          pterodactyl_limits?: Json | null
          pterodactyl_nest_id?: number | null
          pterodactyl_node_id?: number | null
          pterodactyl_startup?: string | null
          ram?: string | null
          slots?: string | null
          sort_order?: number | null
          storage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_plans_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["game_id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean | null
          game_id: string
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          game_id: string
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          game_id?: string
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      hardware: {
        Row: {
          created_at: string
          description: string | null
          hardware_id: string
          id: string
          name: string
          sort_order: number | null
          specs: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          hardware_id: string
          id?: string
          name: string
          sort_order?: number | null
          specs?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          hardware_id?: string
          id?: string
          name?: string
          sort_order?: number | null
          specs?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          discount: number | null
          due_date: string
          id: string
          invoice_number: string
          notes: string | null
          order_id: string | null
          paid_at: string | null
          payment_method: string | null
          status: string
          subtotal: number
          tax: number | null
          total: number
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discount?: number | null
          due_date: string
          id?: string
          invoice_number: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discount?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          country: string | null
          created_at: string
          enabled: boolean | null
          flag: string | null
          id: string
          location_id: string
          name: string
          ping: string | null
          sort_order: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          enabled?: boolean | null
          flag?: string | null
          id?: string
          location_id: string
          name: string
          ping?: string | null
          sort_order?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string
          enabled?: boolean | null
          flag?: string | null
          id?: string
          location_id?: string
          name?: string
          ping?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          billing_cycle: string
          created_at: string
          id: string
          next_due_date: string | null
          notes: string | null
          price: number
          product_id: string | null
          server_details: Json | null
          server_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          price: number
          product_id?: string | null
          server_details?: Json | null
          server_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          price?: number
          product_id?: string | null
          server_details?: Json | null
          server_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          enabled: boolean | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          gateway_id: string | null
          gateway_response: Json | null
          id: string
          invoice_id: string | null
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          gateway_id?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          gateway_id?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_gateway_id_fkey"
            columns: ["gateway_id"]
            isOneToOne: false
            referencedRelation: "payment_gateways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          billing_cycle: string | null
          category_id: string | null
          created_at: string
          description: string | null
          enabled: boolean | null
          features: Json | null
          id: string
          name: string
          price: number
          server_config: Json | null
          setup_fee: number | null
          slug: string
          sort_order: number | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          features?: Json | null
          id?: string
          name: string
          price?: number
          server_config?: Json | null
          setup_fee?: number | null
          slug: string
          sort_order?: number | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          features?: Json | null
          id?: string
          name?: string
          price?: number
          server_config?: Json | null
          setup_fee?: number | null
          slug?: string
          sort_order?: number | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      seasonal_themes: {
        Row: {
          created_at: string
          decorations: string[] | null
          enabled: boolean | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          theme_id: string
        }
        Insert: {
          created_at?: string
          decorations?: string[] | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          theme_id: string
        }
        Update: {
          created_at?: string
          decorations?: string[] | null
          enabled?: boolean | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          theme_id?: string
        }
        Relationships: []
      }
      server_integrations: {
        Row: {
          api_key: string
          api_url: string
          created_at: string
          enabled: boolean | null
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          api_key: string
          api_url: string
          created_at?: string
          enabled?: boolean | null
          id?: string
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          api_url?: string
          created_at?: string
          enabled?: boolean | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          created_at: string
          id: string
          is_staff: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_staff?: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_staff?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          department: string | null
          id: string
          order_id: string | null
          priority: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          order_id?: string | null
          priority?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          order_id?: string | null
          priority?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
