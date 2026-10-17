import { createClient } from '@supabase/supabase-js'

const configuredSupabaseUrl = process.env.REACT_APP_SUPABASE_URL
const configuredSupabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
export const isSupabaseConfigured = Boolean(configuredSupabaseUrl && configuredSupabaseAnonKey)
const supabaseUrl = configuredSupabaseUrl || 'https://example.supabase.co'
const supabaseAnonKey = configuredSupabaseAnonKey || 'demo-anon-key'

if (!isSupabaseConfigured) {
  console.warn('Supabase env variables not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env file.')
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: async (_name, _acquireTimeout, fn) => {
      return await fn();
    }
  }
})


// Types for our database
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          industry?: string
          profile_json: Record<string, any>
          profile_version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string
          profile_json?: Record<string, any>
          profile_version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string
          profile_json?: Record<string, any>
          profile_version?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email?: string
          display_name?: string
          company?: string
          industry?: string
          interests?: string[]
          default_company_id?: string
          created_at: string
          last_login: string
        }
        Insert: {
          id?: string
          email?: string
          display_name?: string
          company?: string
          industry?: string
          interests?: string[]
          default_company_id?: string
          created_at?: string
          last_login?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          company?: string
          industry?: string
          interests?: string[]
          default_company_id?: string
          created_at?: string
          last_login?: string
        }
      }
      company_members: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          areas: string[]
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          areas?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          areas?: string[]
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          module_id: string
          status: 'not_started' | 'in_progress' | 'completed'
          completion_percentage: number
          quiz_score?: number
          lessons_completed: string[]
          last_accessed: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          status?: 'not_started' | 'in_progress' | 'completed'
          completion_percentage?: number
          quiz_score?: number
          lessons_completed?: string[]
          last_accessed?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          status?: 'not_started' | 'in_progress' | 'completed'
          completion_percentage?: number
          quiz_score?: number
          lessons_completed?: string[]
          last_accessed?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_lessons: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          module_id: string
          title: string
          content: string
          summary: string
          key_points: string[]
          order: number
          duration: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          module_id: string
          title: string
          content: string
          summary: string
          key_points?: string[]
          order: number
          duration: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          module_id?: string
          title?: string
          content?: string
          summary?: string
          key_points?: string[]
          order?: number
          duration?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_quizzes: {
        Row: {
          id: string
          user_id: string
          module_id: string
          questions: any[]
          user_answers: number[]
          score: number
          passed: boolean
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          questions?: any[]
          user_answers?: number[]
          score?: number
          passed?: boolean
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          questions?: any[]
          user_answers?: number[]
          score?: number
          passed?: boolean
          completed_at?: string
          created_at?: string
        }
      }
      user_diagnostics: {
        Row: {
          id: string
          user_id: string
          business_type: string
          main_challenge: string
          business_description: string
          scalability_roadmap: any[]
          recommended_modules: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_type?: string
          main_challenge?: string
          business_description?: string
          scalability_roadmap?: any[]
          recommended_modules?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_type?: string
          main_challenge?: string
          business_description?: string
          scalability_roadmap?: any[]
          recommended_modules?: string[]
          created_at?: string
        }
      }
      saved_lessons: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          saved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          saved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id: string
          saved_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          company_id: string
          user_id?: string
          session_id?: string
          event_name: string
          event_properties: Record<string, any>
          page_path?: string
          referrer?: string
          user_agent?: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id?: string
          session_id?: string
          event_name: string
          event_properties?: Record<string, any>
          page_path?: string
          referrer?: string
          user_agent?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          session_id?: string
          event_name?: string
          event_properties?: Record<string, any>
          page_path?: string
          referrer?: string
          user_agent?: string
          created_at?: string
        }
      }
      tool_clicks: {
        Row: {
          id: string
          company_id: string
          user_id?: string
          tool_key: string
          tool_url?: string
          source_type?: string
          source_id?: string
          metadata: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id?: string
          tool_key: string
          tool_url?: string
          source_type?: string
          source_id?: string
          metadata?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          tool_key?: string
          tool_url?: string
          source_type?: string
          source_id?: string
          metadata?: Record<string, any>
          created_at?: string
        }
      }
      company_profiles: {
        Row: {
          company_id: string
          legal_name: string | null
          industry: string | null
          company_size: string | null
          country_code: string | null
          city: string | null
          website: string | null
          business_model: string | null
          description: string | null
          primary_challenge: string | null
          goals: any[]
          profile_version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          company_id: string
          legal_name?: string | null
          industry?: string | null
          company_size?: string | null
          country_code?: string | null
          city?: string | null
          website?: string | null
          business_model?: string | null
          description?: string | null
          primary_challenge?: string | null
          goals?: any[]
          profile_version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          legal_name?: string | null
          industry?: string | null
          company_size?: string | null
          country_code?: string | null
          city?: string | null
          website?: string | null
          business_model?: string | null
          description?: string | null
          primary_challenge?: string | null
          goals?: any[]
          profile_version?: number
          created_at?: string
          updated_at?: string
        }
      }
      learning_events: {
        Row: {
          id: string
          company_id: string
          user_id: string | null
          event_type: string
          module_key: string | null
          lesson_key: string | null
          quiz_key: string | null
          session_id: string | null
          event_properties: Record<string, any>
          occurred_at: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id?: string | null
          event_type: string
          module_key?: string | null
          lesson_key?: string | null
          quiz_key?: string | null
          session_id?: string | null
          event_properties?: Record<string, any>
          occurred_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string | null
          event_type?: string
          module_key?: string | null
          lesson_key?: string | null
          quiz_key?: string | null
          session_id?: string | null
          event_properties?: Record<string, any>
          occurred_at?: string
          created_at?: string
        }
      }
      business_processes: {
        Row: {
          id: string
          company_id: string
          process_key: string
          name: string
          area_key: string | null
          description: string | null
          owner_user_id: string | null
          status: 'draft' | 'active' | 'paused' | 'archived'
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          process_key: string
          name: string
          area_key?: string | null
          description?: string | null
          owner_user_id?: string | null
          status?: 'draft' | 'active' | 'paused' | 'archived'
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          process_key?: string
          name?: string
          area_key?: string | null
          description?: string | null
          owner_user_id?: string | null
          status?: 'draft' | 'active' | 'paused' | 'archived'
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      business_actions: {
        Row: {
          id: string
          company_id: string
          process_id: string | null
          owner_user_id: string | null
          horizon_days: 30 | 60 | 90
          action_key: string
          title: string
          description: string | null
          status: 'planned' | 'in_progress' | 'done' | 'cancelled'
          due_on: string | null
          completed_at: string | null
          sort_order: number
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          process_id?: string | null
          owner_user_id?: string | null
          horizon_days: 30 | 60 | 90
          action_key: string
          title: string
          description?: string | null
          status?: 'planned' | 'in_progress' | 'done' | 'cancelled'
          due_on?: string | null
          completed_at?: string | null
          sort_order?: number
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          process_id?: string | null
          owner_user_id?: string | null
          horizon_days?: 30 | 60 | 90
          action_key?: string
          title?: string
          description?: string | null
          status?: 'planned' | 'in_progress' | 'done' | 'cancelled'
          due_on?: string | null
          completed_at?: string | null
          sort_order?: number
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
