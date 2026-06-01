export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          auth_user_id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      trees: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['trees']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'trees_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      tree_collaborators: {
        Row: {
          id: string
          tree_id: string
          profile_id: string
          role: string
          invited_by: string | null
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          profile_id: string
          role?: string
          invited_by?: string | null
          accepted_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['tree_collaborators']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'tree_collaborators_tree_id_fkey'
            columns: ['tree_id']
            isOneToOne: false
            referencedRelation: 'trees'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tree_collaborators_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      persons: {
        Row: {
          id: string
          tree_id: string
          created_by: string
          first_name: string
          last_name: string | null
          maiden_name: string | null
          birth_date: string | null
          birth_place: string | null
          primary_residence: string | null
          death_date: string | null
          occupation: string | null
          bio: string | null
          highlights: string | null
          avatar_url: string | null
          is_living: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          created_by: string
          first_name: string
          last_name?: string | null
          maiden_name?: string | null
          birth_date?: string | null
          birth_place?: string | null
          primary_residence?: string | null
          death_date?: string | null
          occupation?: string | null
          bio?: string | null
          highlights?: string | null
          avatar_url?: string | null
          is_living?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['persons']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'persons_tree_id_fkey'
            columns: ['tree_id']
            isOneToOne: false
            referencedRelation: 'trees'
            referencedColumns: ['id']
          }
        ]
      }
      relationships: {
        Row: {
          id: string
          tree_id: string
          person_a_id: string
          person_b_id: string
          relationship_type: string
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          person_a_id: string
          person_b_id: string
          relationship_type: string
          is_current?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['relationships']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'relationships_tree_id_fkey'
            columns: ['tree_id']
            isOneToOne: false
            referencedRelation: 'trees'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'relationships_person_a_id_fkey'
            columns: ['person_a_id']
            isOneToOne: false
            referencedRelation: 'persons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'relationships_person_b_id_fkey'
            columns: ['person_b_id']
            isOneToOne: false
            referencedRelation: 'persons'
            referencedColumns: ['id']
          }
        ]
      }
      memories: {
        Row: {
          id: string
          tree_id: string
          title: string
          content: string | null
          memory_date: string | null
          memory_date_precision: string
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          title: string
          content?: string | null
          memory_date?: string | null
          memory_date_precision?: string
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['memories']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'memories_tree_id_fkey'
            columns: ['tree_id']
            isOneToOne: false
            referencedRelation: 'trees'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'memories_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      memory_persons: {
        Row: { memory_id: string; person_id: string }
        Insert: { memory_id: string; person_id: string }
        Update: { memory_id?: string; person_id?: string }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          tree_id: string
          owner_id: string
          file_url: string
          file_type: string
          file_size_bytes: number
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          owner_id: string
          file_url: string
          file_type: string
          file_size_bytes: number
          caption?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['media']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'media_tree_id_fkey'
            columns: ['tree_id']
            isOneToOne: false
            referencedRelation: 'trees'
            referencedColumns: ['id']
          }
        ]
      }
      media_persons: {
        Row: { media_id: string; person_id: string }
        Insert: { media_id: string; person_id: string }
        Update: { media_id?: string; person_id?: string }
        Relationships: []
      }
      tags: {
        Row: { id: string; tree_id: string; name: string; created_at: string }
        Insert: { id?: string; tree_id: string; name: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['tags']['Insert']>
        Relationships: []
      }
      memory_tags: {
        Row: { memory_id: string; tag_id: string }
        Insert: { memory_id: string; tag_id: string }
        Update: { memory_id?: string; tag_id?: string }
        Relationships: []
      }
      activity_log: {
        Row: {
          id: string
          tree_id: string
          actor_id: string
          action: string
          target_type: string | null
          target_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          actor_id: string
          action: string
          target_type?: string | null
          target_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: never
        Relationships: [
          {
            foreignKeyName: 'activity_log_tree_id_fkey'
            columns: ['tree_id']
            isOneToOne: false
            referencedRelation: 'trees'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'activity_log_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
