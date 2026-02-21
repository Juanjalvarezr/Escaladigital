import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmafzvpokkiwetstajqv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtYWZ6dnBva2tpd2V0c3RhanF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDkzNzksImV4cCI6MjA4NzA4NTM3OX0.IGhAfKtMyfo29W3fyhMJGaYLb4NOqdjrPtingXzEbgw'

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: isLocalhost
    ? {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    : {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
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
