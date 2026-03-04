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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
