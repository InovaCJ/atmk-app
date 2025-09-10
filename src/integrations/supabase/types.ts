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
      ai_generations: {
        Row: {
          ai_model: Database["public"]["Enums"]["ai_model"]
          company_id: string
          cost_estimate: number | null
          created_at: string
          generated_content: string
          generation_time_ms: number | null
          id: string
          prompt: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          ai_model: Database["public"]["Enums"]["ai_model"]
          company_id: string
          cost_estimate?: number | null
          created_at?: string
          generated_content: string
          generation_time_ms?: number | null
          id?: string
          prompt: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          ai_model?: Database["public"]["Enums"]["ai_model"]
          company_id?: string
          cost_estimate?: number | null
          created_at?: string
          generated_content?: string
          generation_time_ms?: number | null
          id?: string
          prompt?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      api_integrations: {
        Row: {
          api_key_encrypted: string | null
          company_id: string
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          provider: string
          updated_at: string
        }
        Insert: {
          api_key_encrypted?: string | null
          company_id: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          provider: string
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string | null
          company_id?: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          provider?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          brand_voice: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          owner_id: string
          plan_expires_at: string | null
          plan_type: Database["public"]["Enums"]["plan_type"]
          target_audience: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          brand_voice?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          plan_expires_at?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          target_audience?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          brand_voice?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          plan_expires_at?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          target_audience?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      content_calendar: {
        Row: {
          ai_model: Database["public"]["Enums"]["ai_model"] | null
          company_id: string
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          engagement_data: Json | null
          hashtags: string[] | null
          id: string
          media_urls: string[] | null
          platform: string[] | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          ai_model?: Database["public"]["Enums"]["ai_model"] | null
          company_id: string
          content: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          engagement_data?: Json | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          platform?: string[] | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          ai_model?: Database["public"]["Enums"]["ai_model"] | null
          company_id?: string
          content?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          engagement_data?: Json | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          platform?: string[] | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_calendar_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          company_id: string
          content: string
          content_type: string | null
          created_at: string
          id: string
          metadata: Json | null
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          content: string
          content_type?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          content?: string
          content_type?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          company_id: string
          content: string | null
          created_at: string
          description: string | null
          engagement_metrics: Json | null
          id: string
          keywords: string[] | null
          relevance_score: number | null
          scraped_at: string
          sentiment_score: number | null
          source_platform: string
          title: string
          url: string | null
        }
        Insert: {
          company_id: string
          content?: string | null
          created_at?: string
          description?: string | null
          engagement_metrics?: Json | null
          id?: string
          keywords?: string[] | null
          relevance_score?: number | null
          scraped_at?: string
          sentiment_score?: number | null
          source_platform: string
          title: string
          url?: string | null
        }
        Update: {
          company_id?: string
          content?: string | null
          created_at?: string
          description?: string | null
          engagement_metrics?: Json | null
          id?: string
          keywords?: string[] | null
          relevance_score?: number | null
          scraped_at?: string
          sentiment_score?: number | null
          source_platform?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trends_data: {
        Row: {
          company_id: string
          created_at: string
          fetched_at: string
          id: string
          keyword: string
          opportunity_score: number | null
          region: string | null
          related_keywords: string[] | null
          search_volume: number | null
          timeframe: string | null
          trend_score: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          fetched_at?: string
          id?: string
          keyword: string
          opportunity_score?: number | null
          region?: string | null
          related_keywords?: string[] | null
          search_volume?: number | null
          timeframe?: string | null
          trend_score?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          fetched_at?: string
          id?: string
          keyword?: string
          opportunity_score?: number | null
          region?: string | null
          related_keywords?: string[] | null
          search_volume?: number | null
          timeframe?: string | null
          trend_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trends_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ai_model:
        | "openai_gpt4"
        | "openai_gpt35"
        | "google_gemini"
        | "perplexity"
        | "deepseek"
        | "claude"
        | "grok"
      content_status: "draft" | "scheduled" | "published" | "failed"
      content_type: "post" | "story" | "reel" | "article" | "newsletter"
      plan_type: "free" | "pro" | "business"
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
      ai_model: [
        "openai_gpt4",
        "openai_gpt35",
        "google_gemini",
        "perplexity",
        "deepseek",
        "claude",
        "grok",
      ],
      content_status: ["draft", "scheduled", "published", "failed"],
      content_type: ["post", "story", "reel", "article", "newsletter"],
      plan_type: ["free", "pro", "business"],
    },
  },
} as const
