export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          owner_id: string
          is_public: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          owner_id: string
          is_public?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          owner_id?: string
          is_public?: boolean
        }
      }
      stickies: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          project_id: string
          title: string
          content: string
          color: string
          position_x: number
          position_y: number
          width: number
          height: number
          z_index: number
          is_locked: boolean
          is_hidden: boolean
          is_pinned: boolean
          group_id: string | null
          created_by: string
          priority: 'low' | 'medium' | 'high' | 'critical' | null
          due_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id: string
          title?: string
          content?: string
          color?: string
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          z_index?: number
          is_locked?: boolean
          is_hidden?: boolean
          is_pinned?: boolean
          group_id?: string | null
          created_by: string
          priority?: 'low' | 'medium' | 'high' | 'critical' | null
          due_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id?: string
          title?: string
          content?: string
          color?: string
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          z_index?: number
          is_locked?: boolean
          is_hidden?: boolean
          is_pinned?: boolean
          group_id?: string | null
          created_by?: string
          priority?: 'low' | 'medium' | 'high' | 'critical' | null
          due_date?: string | null
        }
      }
      sticky_votes: {
        Row: {
          id: string
          sticky_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          sticky_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          sticky_id?: string
          user_id?: string
          created_at?: string
        }
      }
      sticky_comments: {
        Row: {
          id: string
          sticky_id: string
          user_id: string
          parent_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sticky_id: string
          user_id: string
          parent_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sticky_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          project_id: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          project_id: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          project_id?: string
          color?: string
          created_at?: string
        }
      }
      sticky_tags: {
        Row: {
          sticky_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          sticky_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          sticky_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          created_at: string
          project_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'editor' | 'viewer'
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
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

export type Project = Database['public']['Tables']['projects']['Row']
export type Sticky = Database['public']['Tables']['stickies']['Row']
export type ProjectMember = Database['public']['Tables']['project_members']['Row']

export type StickyColor =
  | 'default'
  | 'yellow'
  | 'red'
  | 'blue'
  | 'green'
  | 'pink'
  | 'purple'
  | 'orange'

export interface User {
  id: string
  email: string
  created_at: string
}
