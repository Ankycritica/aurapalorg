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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_creatives: {
        Row: {
          active: boolean
          advertiser: string | null
          body: string | null
          click_url: string
          cpm_cents: number
          created_at: string
          cta_label: string | null
          format: string
          headline: string
          id: string
          image_url: string | null
          name: string
          network: string
          target_tools: string[]
          updated_at: string
          weight: number
        }
        Insert: {
          active?: boolean
          advertiser?: string | null
          body?: string | null
          click_url: string
          cpm_cents?: number
          created_at?: string
          cta_label?: string | null
          format?: string
          headline: string
          id?: string
          image_url?: string | null
          name: string
          network?: string
          target_tools?: string[]
          updated_at?: string
          weight?: number
        }
        Update: {
          active?: boolean
          advertiser?: string | null
          body?: string | null
          click_url?: string
          cpm_cents?: number
          created_at?: string
          cta_label?: string | null
          format?: string
          headline?: string
          id?: string
          image_url?: string | null
          name?: string
          network?: string
          target_tools?: string[]
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      ad_earnings: {
        Row: {
          amount_cents: number
          created_at: string
          description: string | null
          entry_type: string
          id: string
          reference_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          description?: string | null
          entry_type?: string
          id?: string
          reference_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          description?: string | null
          entry_type?: string
          id?: string
          reference_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      ad_impressions: {
        Row: {
          clicked: boolean
          country: string | null
          created_at: string
          creative_id: string | null
          device: string | null
          duration_ms: number | null
          format: string
          id: string
          network: string
          revenue_cents: number
          slot_id: string
          tool_name: string | null
          user_id: string | null
          user_share_cents: number
        }
        Insert: {
          clicked?: boolean
          country?: string | null
          created_at?: string
          creative_id?: string | null
          device?: string | null
          duration_ms?: number | null
          format?: string
          id?: string
          network?: string
          revenue_cents?: number
          slot_id: string
          tool_name?: string | null
          user_id?: string | null
          user_share_cents?: number
        }
        Update: {
          clicked?: boolean
          country?: string | null
          created_at?: string
          creative_id?: string | null
          device?: string | null
          duration_ms?: number | null
          format?: string
          id?: string
          network?: string
          revenue_cents?: number
          slot_id?: string
          tool_name?: string | null
          user_id?: string | null
          user_share_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "ad_creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          device: string | null
          event_name: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          event_name: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          event_name?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          seed_plan: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          seed_plan?: Json | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          seed_plan?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generations: {
        Row: {
          created_at: string
          id: string
          input_data: Json | null
          output_text: string
          tool_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_data?: Json | null
          output_text: string
          tool_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input_data?: Json | null
          output_text?: string
          tool_name?: string
          user_id?: string
        }
        Relationships: []
      }
      hr_email_cache: {
        Row: {
          company_domain: string
          created_at: string
          id: string
          payload: Json
          user_id: string
        }
        Insert: {
          company_domain: string
          created_at?: string
          id?: string
          payload?: Json
          user_id: string
        }
        Update: {
          company_domain?: string
          created_at?: string
          id?: string
          payload?: Json
          user_id?: string
        }
        Relationships: []
      }
      job_alert_sent: {
        Row: {
          alert_id: string
          external_id: string
          id: string
          sent_at: string
        }
        Insert: {
          alert_id: string
          external_id: string
          id?: string
          sent_at?: string
        }
        Update: {
          alert_id?: string
          external_id?: string
          id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_alert_sent_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "job_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      job_alerts: {
        Row: {
          active: boolean
          created_at: string
          filters: Json
          frequency: string
          id: string
          last_sent_at: string | null
          name: string
          query: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          filters?: Json
          frequency?: string
          id?: string
          last_sent_at?: string | null
          name: string
          query?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          filters?: Json
          frequency?: string
          id?: string
          last_sent_at?: string | null
          name?: string
          query?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ad_earnings_total_cents: number
          ad_payout_balance_cents: number
          ads_opt_out: boolean
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          grace_until: string | null
          id: string
          lifetime_credits_used: number
          plan: Database["public"]["Enums"]["app_plan"]
          promo_pro_until: string | null
          referral_code: string | null
          referral_credits_earned: number
          share_credits_earned: number
          stripe_connect_account_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_earnings_total_cents?: number
          ad_payout_balance_cents?: number
          ads_opt_out?: boolean
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          grace_until?: string | null
          id?: string
          lifetime_credits_used?: number
          plan?: Database["public"]["Enums"]["app_plan"]
          promo_pro_until?: string | null
          referral_code?: string | null
          referral_credits_earned?: number
          share_credits_earned?: number
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_earnings_total_cents?: number
          ad_payout_balance_cents?: number
          ads_opt_out?: boolean
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          grace_until?: string | null
          id?: string
          lifetime_credits_used?: number
          plan?: Database["public"]["Enums"]["app_plan"]
          promo_pro_until?: string | null
          referral_code?: string | null
          referral_credits_earned?: number
          share_credits_earned?: number
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          apply_url: string | null
          company: string | null
          company_domain: string | null
          created_at: string
          external_id: string | null
          id: string
          jd_text: string | null
          location: string | null
          next_action_at: string | null
          notes: string | null
          posted_at: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          source: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          apply_url?: string | null
          company?: string | null
          company_domain?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          jd_text?: string | null
          location?: string | null
          next_action_at?: string | null
          notes?: string | null
          posted_at?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          apply_url?: string | null
          company?: string | null
          company_domain?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          jd_text?: string | null
          location?: string | null
          next_action_at?: string | null
          notes?: string | null
          posted_at?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          created_at: string
          id: string
          tool_name: string
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tool_name: string
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tool_name?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_ad_earnings_summary: {
        Args: { p_user_id: string }
        Returns: {
          clicks: number
          impressions: number
          pending_cents: number
          total_cents: number
        }[]
      }
      get_daily_usage: { Args: { p_user_id: string }; Returns: number }
      get_free_limit: { Args: { p_user_id: string }; Returns: number }
      get_lifetime_usage: { Args: { p_user_id: string }; Returns: number }
      get_today_share_count: { Args: { p_user_id: string }; Returns: number }
      get_user_plan: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["app_plan"]
      }
    }
    Enums: {
      app_plan: "free" | "pro" | "premium" | "trialing"
      job_status: "saved" | "applied" | "interview" | "offer" | "rejected"
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
      app_plan: ["free", "pro", "premium", "trialing"],
      job_status: ["saved", "applied", "interview", "offer", "rejected"],
    },
  },
} as const
