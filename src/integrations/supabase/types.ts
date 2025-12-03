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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      agent_output: {
        Row: {
          agent_name: string
          client_id: string | null
          created_at: string | null
          id: string
          input: string
          instruction: string
          is_current: boolean
          model: string
          output: string
          parent_id: string | null
          updated_at: string | null
          usage: Json | null
          user_id: string | null
        }
        Insert: {
          agent_name: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          input: string
          instruction: string
          is_current?: boolean
          model: string
          output: string
          parent_id?: string | null
          updated_at?: string | null
          usage?: Json | null
          user_id?: string | null
        }
        Update: {
          agent_name?: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          input?: string
          instruction?: string
          is_current?: boolean
          model?: string
          output?: string
          parent_id?: string | null
          updated_at?: string | null
          usage?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_output_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_output_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "agent_output"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_profiles: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          name: string
          rate_limits: Json | null
          system_prompt: string
          tools: string[] | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          name: string
          rate_limits?: Json | null
          system_prompt: string
          tools?: string[] | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          name?: string
          rate_limits?: Json | null
          system_prompt?: string
          tools?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_name: string
          created_at: string | null
          id: string
          instruction: string
          model: string | null
          schema_output: Json | null
          tools: Json | null
          updated_at: string | null
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          id?: string
          instruction: string
          model?: string | null
          schema_output?: Json | null
          tools?: Json | null
          updated_at?: string | null
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          id?: string
          instruction?: string
          model?: string | null
          schema_output?: Json | null
          tools?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      agents_history: {
        Row: {
          agent_name: string | null
          created_at: string | null
          id: string | null
          instruction: string | null
          model: string | null
          operation_timestamp: string
          operation_type: string
          schema_output: Json | null
          updated_at: string | null
        }
        Insert: {
          agent_name?: string | null
          created_at?: string | null
          id?: string | null
          instruction?: string | null
          model?: string | null
          operation_timestamp?: string
          operation_type: string
          schema_output?: Json | null
          updated_at?: string | null
        }
        Update: {
          agent_name?: string | null
          created_at?: string | null
          id?: string | null
          instruction?: string | null
          model?: string | null
          operation_timestamp?: string
          operation_type?: string
          schema_output?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      allowed_emails: {
        Row: {
          email: string
          id: string
        }
        Insert: {
          email: string
          id?: string
        }
        Update: {
          email?: string
          id?: string
        }
        Relationships: []
      }
      automation_queue: {
        Row: {
          automation_id: string
          automation_run_id: string
          created_at: string | null
          error_message: string | null
          generated_content_id: string | null
          id: string
          retry_count: number
          status: string
          updated_at: string | null
          url: string
        }
        Insert: {
          automation_id: string
          automation_run_id: string
          created_at?: string | null
          error_message?: string | null
          generated_content_id?: string | null
          id?: string
          retry_count?: number
          status?: string
          updated_at?: string | null
          url: string
        }
        Update: {
          automation_id?: string
          automation_run_id?: string
          created_at?: string | null
          error_message?: string | null
          generated_content_id?: string | null
          id?: string
          retry_count?: number
          status?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_queue_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_queue_automation_run_id_fkey"
            columns: ["automation_run_id"]
            isOneToOne: false
            referencedRelation: "automation_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_queue_generated_content_id_fkey"
            columns: ["generated_content_id"]
            isOneToOne: false
            referencedRelation: "generated_content"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_runs: {
        Row: {
          automation_id: string
          client_id: string
          created_at: string | null
          created_by: string
          error_message: string | null
          finished_at: string | null
          id: string
          items_generated: number | null
          started_at: string
          status: string
        }
        Insert: {
          automation_id: string
          client_id: string
          created_at?: string | null
          created_by: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_generated?: number | null
          started_at?: string
          status?: string
        }
        Update: {
          automation_id?: string
          client_id?: string
          created_at?: string | null
          created_by?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_generated?: number | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          category: string
          client_id: string
          created_at: string | null
          created_by: string
          end_after_runs: number | null
          frequency: string
          generations_per_run: number
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string | null
          objective: string | null
          status: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          client_id: string
          created_at?: string | null
          created_by: string
          end_after_runs?: number | null
          frequency: string
          generations_per_run?: number
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          objective?: string | null
          status?: string
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          client_id?: string
          created_at?: string | null
          created_by?: string
          end_after_runs?: number | null
          frequency?: string
          generations_per_run?: number
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          objective?: string | null
          status?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_inputs: {
        Row: {
          client_id: string
          content_text: string | null
          created_at: string | null
          created_by: string
          file_ref: string | null
          id: string
          metadata: Json | null
          title: string | null
          type: Database["public"]["Enums"]["input_type"]
          updated_at: string | null
          url: string | null
        }
        Insert: {
          client_id: string
          content_text?: string | null
          created_at?: string | null
          created_by: string
          file_ref?: string | null
          id?: string
          metadata?: Json | null
          title?: string | null
          type: Database["public"]["Enums"]["input_type"]
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          client_id?: string
          content_text?: string | null
          created_at?: string | null
          created_by?: string
          file_ref?: string | null
          id?: string
          metadata?: Json | null
          title?: string | null
          type?: Database["public"]["Enums"]["input_type"]
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_inputs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_invites: {
        Row: {
          accepted_at: string | null
          client_id: string
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["client_role"]
          status: Database["public"]["Enums"]["invite_status"] | null
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_id: string
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["client_role"]
          status?: Database["public"]["Enums"]["invite_status"] | null
          token?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["client_role"]
          status?: Database["public"]["Enums"]["invite_status"] | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_invites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_members: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["client_role"]
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["client_role"]
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["client_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_members_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_settings: {
        Row: {
          client_id: string
          created_at: string | null
          duplication_of: string | null
          id: string
          locale: string | null
          prompt_directives: string | null
          search_frequencies: Json | null
          search_terms: Json | null
          style_guidelines: string | null
          tone_of_voice: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          duplication_of?: string | null
          id?: string
          locale?: string | null
          prompt_directives?: string | null
          search_frequencies?: Json | null
          search_terms?: Json | null
          style_guidelines?: string | null
          tone_of_voice?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          duplication_of?: string | null
          id?: string
          locale?: string | null
          prompt_directives?: string | null
          search_frequencies?: Json | null
          search_terms?: Json | null
          style_guidelines?: string | null
          tone_of_voice?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_settings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_settings_duplication_of_fkey"
            columns: ["duplication_of"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          name: string
          plan: Database["public"]["Enums"]["plan_type"] | null
          slug: string
          status: Database["public"]["Enums"]["client_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
          slug: string
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
          slug?: string
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      generated_content: {
        Row: {
          category: string
          client_id: string | null
          content: string
          context: string | null
          created_at: string | null
          id: string
          objective: string | null
          source_category: string | null
          source_content: string | null
          title: string
          type: string
          updated_at: string | null
          use_knowledge_base: boolean | null
          user_id: string | null
        }
        Insert: {
          category: string
          client_id?: string | null
          content: string
          context?: string | null
          created_at?: string | null
          id?: string
          objective?: string | null
          source_category?: string | null
          source_content?: string | null
          title: string
          type?: string
          updated_at?: string | null
          use_knowledge_base?: boolean | null
          user_id?: string | null
        }
        Update: {
          category?: string
          client_id?: string | null
          content?: string
          context?: string | null
          created_at?: string | null
          id?: string
          objective?: string | null
          source_category?: string | null
          source_content?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          use_knowledge_base?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      kb_items: {
        Row: {
          chunk_id: string | null
          client_id: string
          created_at: string | null
          embeddings_ref: string | null
          id: string
          kb_id: string
          metadata: Json | null
          source_ref: string | null
          source_type: Database["public"]["Enums"]["kb_source_type"]
          text: string
        }
        Insert: {
          chunk_id?: string | null
          client_id: string
          created_at?: string | null
          embeddings_ref?: string | null
          id?: string
          kb_id: string
          metadata?: Json | null
          source_ref?: string | null
          source_type: Database["public"]["Enums"]["kb_source_type"]
          text: string
        }
        Update: {
          chunk_id?: string | null
          client_id?: string
          created_at?: string | null
          embeddings_ref?: string | null
          id?: string
          kb_id?: string
          metadata?: Json | null
          source_ref?: string | null
          source_type?: Database["public"]["Enums"]["kb_source_type"]
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_items_kb_id_fkey"
            columns: ["kb_id"]
            isOneToOne: false
            referencedRelation: "knowledge_bases"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_bases: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          indexing_policy:
            | Database["public"]["Enums"]["kb_indexing_policy"]
            | null
          name: string
          updated_at: string | null
          vector_store: Database["public"]["Enums"]["vector_store"] | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          indexing_policy?:
            | Database["public"]["Enums"]["kb_indexing_policy"]
            | null
          name: string
          updated_at?: string | null
          vector_store?: Database["public"]["Enums"]["vector_store"] | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          indexing_policy?:
            | Database["public"]["Enums"]["kb_indexing_policy"]
            | null
          name?: string
          updated_at?: string | null
          vector_store?: Database["public"]["Enums"]["vector_store"] | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_bases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      news_ingestion_runs: {
        Row: {
          client_id: string
          error_message: string | null
          finished_at: string | null
          id: string
          items_fetched: number | null
          items_inserted: number | null
          items_skipped: number | null
          metadata: Json | null
          source_id: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          client_id: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_fetched?: number | null
          items_inserted?: number | null
          items_skipped?: number | null
          metadata?: Json | null
          source_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_fetched?: number | null
          items_inserted?: number | null
          items_skipped?: number | null
          metadata?: Json | null
          source_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_ingestion_runs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_ingestion_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "news_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      news_items: {
        Row: {
          author: string | null
          client_id: string
          content: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          published_at: string | null
          source_id: string
          summary: string | null
          title: string
          topics: Json | null
          updated_at: string | null
          url: string
          url_hash: string
        }
        Insert: {
          author?: string | null
          client_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          source_id: string
          summary?: string | null
          title: string
          topics?: Json | null
          updated_at?: string | null
          url: string
          url_hash: string
        }
        Update: {
          author?: string | null
          client_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          source_id?: string
          summary?: string | null
          title?: string
          topics?: Json | null
          updated_at?: string | null
          url?: string
          url_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "news_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      news_sources: {
        Row: {
          api_config: Json | null
          client_id: string
          created_at: string | null
          enabled: boolean | null
          id: string
          name: string
          schedule: string | null
          type: Database["public"]["Enums"]["news_source_type"]
          updated_at: string | null
          url: string | null
        }
        Insert: {
          api_config?: Json | null
          client_id: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          schedule?: string | null
          type: Database["public"]["Enums"]["news_source_type"]
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          api_config?: Json | null
          client_id?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          schedule?: string | null
          type?: Database["public"]["Enums"]["news_source_type"]
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_sources_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
      search_integrations: {
        Row: {
          api_key_ref: string
          client_id: string
          created_at: string | null
          daily_quota: number | null
          enabled: boolean | null
          id: string
          provider: Database["public"]["Enums"]["search_provider"]
          updated_at: string | null
        }
        Insert: {
          api_key_ref: string
          client_id: string
          created_at?: string | null
          daily_quota?: number | null
          enabled?: boolean | null
          id?: string
          provider: Database["public"]["Enums"]["search_provider"]
          updated_at?: string | null
        }
        Update: {
          api_key_ref?: string
          client_id?: string
          created_at?: string | null
          daily_quota?: number | null
          enabled?: boolean | null
          id?: string
          provider?: Database["public"]["Enums"]["search_provider"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_integrations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      search_usage: {
        Row: {
          calls_made: number | null
          client_id: string
          cost_cents: number | null
          created_at: string | null
          id: string
          provider: Database["public"]["Enums"]["search_provider"]
          tokens_used: number | null
        }
        Insert: {
          calls_made?: number | null
          client_id: string
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          provider: Database["public"]["Enums"]["search_provider"]
          tokens_used?: number | null
        }
        Update: {
          calls_made?: number | null
          client_id?: string
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          provider?: Database["public"]["Enums"]["search_provider"]
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "search_usage_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_old_news_items: { Args: { cutoff_ts: string }; Returns: number }
      expire_old_invites: { Args: never; Returns: undefined }
      get_member_client_ids: { Args: never; Returns: string[] }
      get_owned_clients: { Args: never; Returns: string[] }
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
      client_role: "client_admin" | "editor" | "viewer"
      client_status: "active" | "archived"
      content_status: "draft" | "scheduled" | "published" | "failed"
      content_type: "post" | "story" | "reel" | "article" | "newsletter"
      input_type: "text" | "file" | "url" | "structured"
      invite_status: "pending" | "accepted" | "declined" | "expired"
      kb_indexing_policy: "fulltext+embeddings" | "raw"
      kb_source_type: "input" | "url" | "file" | "news" | "manual"
      news_source_type: "rss" | "api" | "scraper"
      plan_type: "free" | "pro" | "business"
      search_provider: "serpapi" | "tavily" | "bing" | "custom"
      vector_store: "pgvector" | "pinecone" | "qdrant" | "weaviate"
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
  graphql_public: {
    Enums: {},
  },
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
      client_role: ["client_admin", "editor", "viewer"],
      client_status: ["active", "archived"],
      content_status: ["draft", "scheduled", "published", "failed"],
      content_type: ["post", "story", "reel", "article", "newsletter"],
      input_type: ["text", "file", "url", "structured"],
      invite_status: ["pending", "accepted", "declined", "expired"],
      kb_indexing_policy: ["fulltext+embeddings", "raw"],
      kb_source_type: ["input", "url", "file", "news", "manual"],
      news_source_type: ["rss", "api", "scraper"],
      plan_type: ["free", "pro", "business"],
      search_provider: ["serpapi", "tavily", "bing", "custom"],
      vector_store: ["pgvector", "pinecone", "qdrant", "weaviate"],
    },
  },
} as const
