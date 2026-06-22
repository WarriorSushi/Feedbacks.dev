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
      agent_setup_audit: {
        Row: {
          created_at: string
          event_type: string
          expires_at: string | null
          id: string
          metadata: Json
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_setup_audit_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_setup_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          metadata: Json
          project_id: string
          revoked_at: string | null
          token_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          metadata?: Json
          project_id: string
          revoked_at?: string | null
          token_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          metadata?: Json
          project_id?: string
          revoked_at?: string | null
          token_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_setup_tokens_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_accounts: {
        Row: {
          billing_email: string | null
          billing_status: string
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          dodo_customer_id: string | null
          dodo_product_id: string | null
          dodo_subscription_id: string | null
          last_event_id: string | null
          last_event_type: string | null
          plan_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_email?: string | null
          billing_status?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          dodo_customer_id?: string | null
          dodo_product_id?: string | null
          dodo_subscription_id?: string | null
          last_event_id?: string | null
          last_event_type?: string | null
          plan_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_email?: string | null
          billing_status?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          dodo_customer_id?: string | null
          dodo_product_id?: string | null
          dodo_subscription_id?: string | null
          last_event_id?: string | null
          last_event_type?: string | null
          plan_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_events: {
        Row: {
          created_at: string
          dodo_customer_id: string | null
          dodo_subscription_id: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dodo_customer_id?: string | null
          dodo_subscription_id?: string | null
          event_type: string
          id: string
          payload: Json
          processed_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dodo_customer_id?: string | null
          dodo_subscription_id?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      board_announcements: {
        Row: {
          board_id: string
          body: string
          created_at: string
          created_by: string | null
          href: string | null
          id: string
          project_id: string
          published_at: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          board_id: string
          body: string
          created_at?: string
          created_by?: string | null
          href?: string | null
          id?: string
          project_id: string
          published_at?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          board_id?: string
          body?: string
          created_at?: string
          created_by?: string | null
          href?: string | null
          id?: string
          project_id?: string
          published_at?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_announcements_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "public_board_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_announcements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      board_follows: {
        Row: {
          board_id: string
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          board_id: string
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          board_id?: string
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_follows_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "public_board_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_follows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      board_reports: {
        Row: {
          board_id: string
          created_at: string
          details: string | null
          feedback_id: string | null
          id: string
          project_id: string
          reason: string
          reporter_email: string | null
          reporter_identifier: string
          status: string
          target_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          board_id: string
          created_at?: string
          details?: string | null
          feedback_id?: string | null
          id?: string
          project_id: string
          reason: string
          reporter_email?: string | null
          reporter_identifier: string
          status?: string
          target_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          board_id?: string
          created_at?: string
          details?: string | null
          feedback_id?: string | null
          id?: string
          project_id?: string
          reason?: string
          reporter_email?: string | null
          reporter_identifier?: string
          status?: string
          target_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "board_reports_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "public_board_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_reports_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_runs: {
        Row: {
          error_message: string | null
          finished_at: string | null
          id: string
          job_name: string
          metadata: Json
          processed_count: number
          sent_count: number
          started_at: string
          status: string
        }
        Insert: {
          error_message?: string | null
          finished_at?: string | null
          id?: string
          job_name: string
          metadata?: Json
          processed_count?: number
          sent_count?: number
          started_at?: string
          status?: string
        }
        Update: {
          error_message?: string | null
          finished_at?: string | null
          id?: string
          job_name?: string
          metadata?: Json
          processed_count?: number
          sent_count?: number
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          agent_name: string | null
          agent_session_id: string | null
          attachments: Json | null
          created_at: string
          email: string | null
          id: string
          is_archived: boolean
          is_public: boolean | null
          message: string
          metadata: Json
          priority: string
          project_id: string
          rating: number | null
          read_at: string | null
          resolved_at: string | null
          screenshot_url: string | null
          status: string
          structured_data: Json | null
          tags: string[]
          type: string | null
          updated_at: string
          url: string | null
          user_agent: string
          vote_count: number | null
        }
        Insert: {
          agent_name?: string | null
          agent_session_id?: string | null
          attachments?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          is_public?: boolean | null
          message: string
          metadata?: Json
          priority?: string
          project_id: string
          rating?: number | null
          read_at?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          status?: string
          structured_data?: Json | null
          tags?: string[]
          type?: string | null
          updated_at?: string
          url?: string | null
          user_agent: string
          vote_count?: number | null
        }
        Update: {
          agent_name?: string | null
          agent_session_id?: string | null
          attachments?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          is_public?: boolean | null
          message?: string
          metadata?: Json
          priority?: string
          project_id?: string
          rating?: number | null
          read_at?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          status?: string
          structured_data?: Json | null
          tags?: string[]
          type?: string | null
          updated_at?: string
          url?: string | null
          user_agent?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_notes: {
        Row: {
          content: string
          created_at: string
          feedback_id: string
          id: string
          is_public: boolean
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          feedback_id: string
          id?: string
          is_public?: boolean
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          feedback_id?: string
          id?: string
          is_public?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_notes_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_watches: {
        Row: {
          board_id: string
          created_at: string
          feedback_id: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          board_id: string
          created_at?: string
          feedback_id: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          board_id?: string
          created_at?: string
          feedback_id?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_watches_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "public_board_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_watches_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_watches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_digests: {
        Row: {
          created_at: string
          digest_date: string
          digest_type: string
          id: string
          item_count: number
          sent_at: string
          user_id: string
          window_end: string
          window_start: string
        }
        Insert: {
          created_at?: string
          digest_date: string
          digest_type: string
          id?: string
          item_count?: number
          sent_at?: string
          user_id: string
          window_end: string
          window_start: string
        }
        Update: {
          created_at?: string
          digest_date?: string
          digest_type?: string
          id?: string
          item_count?: number
          sent_at?: string
          user_id?: string
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          api_key: string | null
          api_key_hash: string | null
          api_key_last_four: string | null
          created_at: string
          domain: string | null
          id: string
          name: string
          owner_user_id: string
          settings: Json
          updated_at: string
          webhooks: Json
        }
        Insert: {
          api_key?: string | null
          api_key_hash?: string | null
          api_key_last_four?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          name: string
          owner_user_id: string
          settings?: Json
          updated_at?: string
          webhooks?: Json
        }
        Update: {
          api_key?: string | null
          api_key_hash?: string | null
          api_key_last_four?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          name?: string
          owner_user_id?: string
          settings?: Json
          updated_at?: string
          webhooks?: Json
        }
        Relationships: []
      }
      public_board_settings: {
        Row: {
          accent_color: string | null
          allow_submissions: boolean | null
          branding: Json | null
          categories: string[]
          created_at: string
          custom_css: string | null
          description: string | null
          directory_opt_in: boolean
          display_name: string | null
          empty_state_description: string | null
          empty_state_title: string | null
          enabled: boolean
          hero_description: string | null
          hero_eyebrow: string | null
          hero_title: string | null
          id: string
          logo_emoji: string | null
          project_id: string
          require_email_to_vote: boolean | null
          show_types: string[] | null
          slug: string
          tagline: string | null
          title: string | null
          updated_at: string
          visibility: string
          website_url: string | null
        }
        Insert: {
          accent_color?: string | null
          allow_submissions?: boolean | null
          branding?: Json | null
          categories?: string[]
          created_at?: string
          custom_css?: string | null
          description?: string | null
          directory_opt_in?: boolean
          display_name?: string | null
          empty_state_description?: string | null
          empty_state_title?: string | null
          enabled?: boolean
          hero_description?: string | null
          hero_eyebrow?: string | null
          hero_title?: string | null
          id?: string
          logo_emoji?: string | null
          project_id: string
          require_email_to_vote?: boolean | null
          show_types?: string[] | null
          slug: string
          tagline?: string | null
          title?: string | null
          updated_at?: string
          visibility?: string
          website_url?: string | null
        }
        Update: {
          accent_color?: string | null
          allow_submissions?: boolean | null
          branding?: Json | null
          categories?: string[]
          created_at?: string
          custom_css?: string | null
          description?: string | null
          directory_opt_in?: boolean
          display_name?: string | null
          empty_state_description?: string | null
          empty_state_title?: string | null
          enabled?: boolean
          hero_description?: string | null
          hero_eyebrow?: string | null
          hero_title?: string | null
          id?: string
          logo_emoji?: string | null
          project_id?: string
          require_email_to_vote?: boolean | null
          show_types?: string[] | null
          slug?: string
          tagline?: string | null
          title?: string | null
          updated_at?: string
          visibility?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_board_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string
          id: string
          key: string
          route: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          route: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          route?: string
        }
        Relationships: []
      }
      usage_counters: {
        Row: {
          count: number
          created_at: string
          id: string
          metric: string
          period_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          metric: string
          period_start: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          metric?: string
          period_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          notification_settings: Json
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          notification_settings?: Json
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          notification_settings?: Json
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          feedback_id: string
          id: string
          vote_type: string
          voter_identifier: string
        }
        Insert: {
          created_at?: string
          feedback_id: string
          id?: string
          vote_type: string
          voter_identifier: string
        }
        Update: {
          created_at?: string
          feedback_id?: string
          id?: string
          vote_type?: string
          voter_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt: number
          created_at: string
          endpoint_id: string | null
          error: string | null
          event: string
          id: string
          kind: string
          payload: Json | null
          project_id: string
          response_body: string | null
          response_time_ms: number | null
          status: string
          status_code: number | null
          url: string
        }
        Insert: {
          attempt?: number
          created_at?: string
          endpoint_id?: string | null
          error?: string | null
          event: string
          id?: string
          kind: string
          payload?: Json | null
          project_id: string
          response_body?: string | null
          response_time_ms?: number | null
          status: string
          status_code?: number | null
          url: string
        }
        Update: {
          attempt?: number
          created_at?: string
          endpoint_id?: string | null
          error?: string | null
          event?: string
          id?: string
          kind?: string
          payload?: Json | null
          project_id?: string
          response_body?: string | null
          response_time_ms?: number | null
          status?: string
          status_code?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_digest_items: {
        Row: {
          attempt: number
          created_at: string
          digest_date: string
          endpoint_id: string | null
          endpoint_url: string
          event: string
          id: string
          kind: string
          last_delivery_id: string | null
          last_error: string | null
          locked_at: string | null
          max_attempts: number
          next_attempt_at: string
          payload: Json
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          attempt?: number
          created_at?: string
          digest_date?: string
          endpoint_id?: string | null
          endpoint_url: string
          event?: string
          id?: string
          kind: string
          last_delivery_id?: string | null
          last_error?: string | null
          locked_at?: string | null
          max_attempts?: number
          next_attempt_at?: string
          payload: Json
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          attempt?: number
          created_at?: string
          digest_date?: string
          endpoint_id?: string | null
          endpoint_url?: string
          event?: string
          id?: string
          kind?: string
          last_delivery_id?: string | null
          last_error?: string | null
          locked_at?: string | null
          max_attempts?: number
          next_attempt_at?: string
          payload?: Json
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_digest_items_last_delivery_id_fkey"
            columns: ["last_delivery_id"]
            isOneToOne: false
            referencedRelation: "webhook_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_digest_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_jobs: {
        Row: {
          attempt: number
          created_at: string
          endpoint_id: string | null
          endpoint_url: string
          event: string
          id: string
          kind: string
          last_delivery_id: string | null
          last_error: string | null
          locked_at: string | null
          max_attempts: number
          next_attempt_at: string
          payload: Json
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          attempt?: number
          created_at?: string
          endpoint_id?: string | null
          endpoint_url: string
          event: string
          id?: string
          kind: string
          last_delivery_id?: string | null
          last_error?: string | null
          locked_at?: string | null
          max_attempts?: number
          next_attempt_at?: string
          payload: Json
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          attempt?: number
          created_at?: string
          endpoint_id?: string | null
          endpoint_url?: string
          event?: string
          id?: string
          kind?: string
          last_delivery_id?: string | null
          last_error?: string | null
          locked_at?: string | null
          max_attempts?: number
          next_attempt_at?: string
          payload?: Json
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_jobs_last_delivery_id_fkey"
            columns: ["last_delivery_id"]
            isOneToOne: false
            referencedRelation: "webhook_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_config_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          project_id: string
          user_id: string | null
          widget_config_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          project_id: string
          user_id?: string | null
          widget_config_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          project_id?: string
          user_id?: string | null
          widget_config_id?: string
        }
        Relationships: []
      }
      widget_configs: {
        Row: {
          channel: string
          config: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          label: string
          project_id: string
          updated_at: string
          version: number
        }
        Insert: {
          channel?: string
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          label?: string
          project_id: string
          updated_at?: string
          version: number
        }
        Update: {
          channel?: string
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          label?: string
          project_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "widget_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_presets: {
        Row: {
          category: string | null
          config: Json
          created_at: string
          description: string | null
          id: string
          name: string
          preview_image_url: string | null
          slug: string
        }
        Insert: {
          category?: string | null
          config: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          preview_image_url?: string | null
          slug: string
        }
        Update: {
          category?: string | null
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          preview_image_url?: string | null
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      avg_rating_for_project: {
        Args: { p_project_id: string }
        Returns: number
      }
      check_rate_limit: {
        Args: {
          p_key: string
          p_limit?: number
          p_route: string
          p_window_seconds?: number
        }
        Returns: Json
      }
      count_by_column: {
        Args: {
          column_name: string
          filter_project_id: string
          table_name: string
        }
        Returns: Json
      }
      generate_api_key: { Args: never; Returns: string }
      increment_usage_counter: {
        Args: {
          p_amount?: number
          p_metric: string
          p_period_start: string
          p_user_id: string
        }
        Returns: number
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
