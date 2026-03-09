import type { StackConfig } from './stack'

export type Plan = 'free' | 'starter' | 'pro'
export type EntitlementStatus = 'active' | 'canceled' | 'past_due'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
        }
        Update: {
          display_name?: string | null
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          user_id: string
          plan: Plan
          status: EntitlementStatus
          current_period_end: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          plan?: Plan
          status?: EntitlementStatus
          current_period_end?: string | null
          updated_at?: string
        }
        Update: {
          plan?: Plan
          status?: EntitlementStatus
          current_period_end?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stacks: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          public_slug: string | null
          config: StackConfig
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          public_slug?: string | null
          config: StackConfig
        }
        Update: {
          name?: string
          description?: string | null
          is_public?: boolean
          public_slug?: string | null
          config?: StackConfig
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          stack_id: string
          user_id: string | null
          author_name: string | null
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          stack_id: string
          user_id?: string | null
          author_name?: string | null
          body: string
        }
        Update: {
          author_name?: string | null
          body?: string
        }
        Relationships: []
      }
      journals: {
        Row: {
          id: string
          stack_id: string
          user_id: string
          body: string
          is_private: boolean
          created_at: string
        }
        Insert: {
          id?: string
          stack_id: string
          user_id: string
          body: string
          is_private?: boolean
        }
        Update: {
          body?: string
          is_private?: boolean
        }
        Relationships: []
      }
      listening_sessions: {
        Row: {
          id: string
          user_id: string
          stack_id: string | null
          stack_name: string | null
          started_at: string
          duration_seconds: number
        }
        Insert: {
          id?: string
          user_id: string
          stack_id?: string | null
          stack_name?: string | null
          started_at?: string
          duration_seconds: number
        }
        Update: Record<string, never>
        Relationships: []
      }
      free_sessions: {
        Row: {
          id: string
          ip_hash: string | null
          user_id: string | null
          started_at: string
          duration_minutes: number
        }
        Insert: {
          id?: string
          ip_hash?: string | null
          user_id?: string | null
          started_at?: string
          duration_minutes?: number
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
