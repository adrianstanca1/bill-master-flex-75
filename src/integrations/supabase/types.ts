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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_interactions: {
        Row: {
          agent_type: string
          company_id: string
          content: Json | null
          created_at: string
          id: string
          interaction_type: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_type: string
          company_id: string
          content?: Json | null
          created_at?: string
          id?: string
          interaction_type: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_type?: string
          company_id?: string
          content?: Json | null
          created_at?: string
          id?: string
          interaction_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      asset_tracking: {
        Row: {
          asset_name: string
          asset_type: string
          company_id: string
          condition: string | null
          created_at: string
          current_location: string | null
          id: string
          purchase_cost: number | null
          purchase_date: string | null
          serial_number: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          asset_name: string
          asset_type: string
          company_id: string
          condition?: string | null
          created_at?: string
          current_location?: string | null
          id?: string
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          asset_name?: string
          asset_type?: string
          company_id?: string
          condition?: string | null
          created_at?: string
          current_location?: string | null
          id?: string
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dayworks: {
        Row: {
          company_id: string
          created_at: string
          date: string
          hourly_rate: number | null
          hours_worked: number | null
          id: string
          project_id: string | null
          total_cost: number | null
          updated_at: string
          work_description: string
        }
        Insert: {
          company_id: string
          created_at?: string
          date: string
          hourly_rate?: number | null
          hours_worked?: number | null
          id?: string
          project_id?: string | null
          total_cost?: number | null
          updated_at?: string
          work_description: string
        }
        Update: {
          company_id?: string
          created_at?: string
          date?: string
          hourly_rate?: number | null
          hours_worked?: number | null
          id?: string
          project_id?: string | null
          total_cost?: number | null
          updated_at?: string
          work_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "dayworks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_id: string
          created_at: string
          department: string | null
          email: string | null
          hire_date: string | null
          id: string
          name: string
          phone: string | null
          position: string | null
          salary: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name: string
          phone?: string | null
          position?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          phone?: string | null
          position?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          company_id: string
          created_at: string
          description: string | null
          id: string
          receipt_url: string | null
          status: string | null
          supplier: string | null
          txn_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          receipt_url?: string | null
          status?: string | null
          supplier?: string | null
          txn_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          receipt_url?: string | null
          status?: string | null
          supplier?: string | null
          txn_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client: string
          company_id: string
          created_at: string
          due_date: string
          id: string
          items: Json | null
          meta: Json | null
          number: string
          status: string | null
          total: number
          updated_at: string
        }
        Insert: {
          client: string
          company_id: string
          created_at?: string
          due_date: string
          id?: string
          items?: Json | null
          meta?: Json | null
          number: string
          status?: string | null
          total: number
          updated_at?: string
        }
        Update: {
          client?: string
          company_id?: string
          created_at?: string
          due_date?: string
          id?: string
          items?: Json | null
          meta?: Json | null
          number?: string
          status?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          meta: Json | null
          name: string
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          meta?: Json | null
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          meta?: Json | null
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          client_email: string | null
          client_name: string | null
          company_id: string
          created_at: string
          id: string
          items: Json | null
          status: string | null
          title: string
          total: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          company_id: string
          created_at?: string
          id?: string
          items?: Json | null
          status?: string | null
          title: string
          total: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          company_id?: string
          created_at?: string
          id?: string
          items?: Json | null
          status?: string | null
          title?: string
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          company_id: string
          completed: boolean
          created_at: string
          description: string | null
          due_date: string
          id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_photos: {
        Row: {
          caption: string | null
          company_id: string
          created_at: string
          id: string
          project_id: string
          updated_at: string
          url: string
        }
        Insert: {
          caption?: string | null
          company_id: string
          created_at?: string
          id?: string
          project_id: string
          updated_at?: string
          url: string
        }
        Update: {
          caption?: string | null
          company_id?: string
          created_at?: string
          id?: string
          project_id?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      timesheets: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          end_time: string | null
          hours_worked: number | null
          id: string
          project_id: string | null
          start_time: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          hours_worked?: number | null
          id?: string
          project_id?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          hours_worked?: number | null
          id?: string
          project_id?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      enhanced_brute_force_check: {
        Args: { check_ip?: unknown; check_user_id?: string }
        Returns: Json
      }
      secure_retrieve_data: {
        Args: { store_key: string }
        Returns: Json
      }
      secure_store_data: {
        Args: { store_key: string; store_value: Json }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
