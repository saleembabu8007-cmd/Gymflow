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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          gym_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          gym_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          gym_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          duration_months: number
          email: string | null
          gym_id: string
          id: string
          monthly_fee: number
          name: string
          next_payment_date: string
          notes: string | null
          phone: string
          plan_name: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          duration_months?: number
          email?: string | null
          gym_id: string
          id?: string
          monthly_fee: number
          name: string
          next_payment_date: string
          notes?: string | null
          phone: string
          plan_name: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          duration_months?: number
          email?: string | null
          gym_id?: string
          id?: string
          monthly_fee?: number
          name?: string
          next_payment_date?: string
          notes?: string | null
          phone?: string
          plan_name?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_members_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_settings: {
        Row: {
          currency_code: string
          currency_symbol: string
          default_membership_duration: string
          default_monthly_fee: number
          gym_id: string
          id: string
          reminder_days_before_due: number
          timezone: string
          updated_at: string
          whatsapp_template: string
        }
        Insert: {
          currency_code?: string
          currency_symbol?: string
          default_membership_duration?: string
          default_monthly_fee?: number
          gym_id: string
          id?: string
          reminder_days_before_due?: number
          timezone?: string
          updated_at?: string
          whatsapp_template?: string
        }
        Update: {
          currency_code?: string
          currency_symbol?: string
          default_membership_duration?: string
          default_monthly_fee?: number
          gym_id?: string
          id?: string
          reminder_days_before_due?: number
          timezone?: string
          updated_at?: string
          whatsapp_template?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_settings_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: true
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          currency: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          owner_user_id: string | null
          phone: string
          state: string | null
          status: string | null
          timezone: string
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          owner_user_id?: string | null
          phone: string
          state?: string | null
          status?: string | null
          timezone?: string
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          owner_user_id?: string | null
          phone?: string
          state?: string | null
          status?: string | null
          timezone?: string
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_gyms_owner"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gyms_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          gym_id: string
          id: string
          notes: string | null
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          gym_id: string
          id?: string
          notes?: string | null
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          gym_id?: string
          id?: string
          notes?: string | null
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          active: boolean
          amount: number | null
          created_at: string
          default_fee: number | null
          description: string | null
          duration_days: number
          duration_months: number
          gym_id: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          amount?: number | null
          created_at?: string
          default_fee?: number | null
          description?: string | null
          duration_days?: number
          duration_months?: number
          gym_id: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          amount?: number | null
          created_at?: string
          default_fee?: number | null
          description?: string | null
          duration_days?: number
          duration_months?: number
          gym_id?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          duration_months: number
          end_date: string
          fee_amount: number
          gym_id: string
          id: string
          member_id: string
          next_payment_date: string | null
          plan_id: string | null
          plan_name: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_months?: number
          end_date: string
          fee_amount: number
          gym_id: string
          id?: string
          member_id: string
          next_payment_date?: string | null
          plan_id?: string | null
          plan_name: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_months?: number
          end_date?: string
          fee_amount?: number
          gym_id?: string
          id?: string
          member_id?: string
          next_payment_date?: string | null
          plan_id?: string | null
          plan_name?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "gym_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          gym_id: string
          id: string
          member_id: string
          member_name: string
          member_phone: string
          membership_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          period_covered: string | null
          recorded_by: string | null
          reference_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          gym_id: string
          id?: string
          member_id: string
          member_name: string
          member_phone: string
          membership_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          period_covered?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          gym_id?: string
          id?: string
          member_id?: string
          member_name?: string
          member_phone?: string
          membership_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          period_covered?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "gym_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          gym_id: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          gym_id?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          gym_id?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_gym"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          amount: number
          channel: string
          created_at: string
          due_date: string
          gym_id: string
          id: string
          member_id: string
          member_name: string
          member_phone: string
          message: string
          payment_id: string | null
          sent_at: string
          status: string
        }
        Insert: {
          amount: number
          channel?: string
          created_at?: string
          due_date: string
          gym_id: string
          id?: string
          member_id: string
          member_name: string
          member_phone: string
          message: string
          payment_id?: string | null
          sent_at?: string
          status?: string
        }
        Update: {
          amount?: number
          channel?: string
          created_at?: string
          due_date?: string
          gym_id?: string
          id?: string
          member_id?: string
          member_name?: string
          member_phone?: string
          message?: string
          payment_id?: string | null
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "gym_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          active: boolean
          amount: number | null
          code: string
          created_at: string
          currency: string
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price_monthly: number | null
        }
        Insert: {
          active?: boolean
          amount?: number | null
          code: string
          created_at?: string
          currency?: string
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price_monthly?: number | null
        }
        Update: {
          active?: boolean
          amount?: number | null
          code?: string
          created_at?: string
          currency?: string
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          gym_id: string
          id: string
          plan_id: string
          provider: string | null
          provider_customer_id: string | null
          provider_subscription_id: string | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          gym_id: string
          id?: string
          plan_id: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          gym_id?: string
          id?: string
          plan_id?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_attention_members: {
        Args: { p_gym_id?: string; p_limit?: number }
        Returns: {
          avatar_url: string | null
          created_at: string
          duration_months: number
          email: string | null
          gym_id: string
          id: string
          monthly_fee: number
          name: string
          next_payment_date: string
          notes: string | null
          phone: string
          plan_name: string
          start_date: string
          status: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "gym_members"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_auth_gym_id: { Args: never; Returns: string }
      get_dashboard_summary: {
        Args: { p_gym_id?: string }
        Returns: {
          active_members_count: number
          collected_this_month: number
          due_soon_count: number
          pending_count: number
        }[]
      }
      is_gym_active: { Args: { p_gym_id: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      record_member_payment_tx: {
        Args: {
          p_amount: number
          p_duration_months?: number
          p_member_id: string
          p_notes?: string
          p_payment_date?: string
          p_payment_method?: string
          p_recorded_by?: string
        }
        Returns: Json
      }
      register_gym_owner: {
        Args: {
          p_gym_name: string
          p_owner_name: string
          p_phone: string
          p_upi_id?: string
        }
        Returns: Json
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

export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbGym = Database['public']['Tables']['gyms']['Row'];
export type DbSubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
export type DbSubscription = Database['public']['Tables']['subscriptions']['Row'];
export type DbMembershipPlan = Database['public']['Tables']['membership_plans']['Row'];
export type DbMember = Database['public']['Tables']['members']['Row'];
export type DbMembership = Database['public']['Tables']['memberships']['Row'];
export type DbPayment = Database['public']['Tables']['payments']['Row'];
export type DbReminder = Database['public']['Tables']['reminders']['Row'];
export type DbGymSettings = Database['public']['Tables']['gym_settings']['Row'];
export type DbAuditLog = Database['public']['Tables']['audit_logs']['Row'];

