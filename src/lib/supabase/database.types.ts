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
      Gestao_FamiliarWillfamilies: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      Gestao_FamiliarWillfamily_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: 'admin' | 'member'
          invited_email: string | null
          status: 'active' | 'pending'
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role?: 'admin' | 'member'
          invited_email?: string | null
          status?: 'active' | 'pending'
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          invited_email?: string | null
          status?: 'active' | 'pending'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'family_members_family_id_fkey'
            columns: ['family_id']
            isOneToOne: false
            referencedRelation: 'families'
            referencedColumns: ['id']
          }
        ]
      }
      Gestao_FamiliarWillaccounts: {
        Row: {
          id: string
          family_id: string
          name: string
          type: 'checking' | 'savings' | 'wallet' | 'credit_card'
          initial_balance: number
          color: string
          icon: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          type?: 'checking' | 'savings' | 'wallet' | 'credit_card'
          initial_balance?: number
          color?: string
          icon?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          type?: 'checking' | 'savings' | 'wallet' | 'credit_card'
          initial_balance?: number
          color?: string
          icon?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'accounts_family_id_fkey'
            columns: ['family_id']
            isOneToOne: false
            referencedRelation: 'families'
            referencedColumns: ['id']
          }
        ]
      }
      Gestao_FamiliarWillcategories: {
        Row: {
          id: string
          family_id: string
          name: string
          type: 'income' | 'expense'
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          type: 'income' | 'expense'
          icon?: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          type?: 'income' | 'expense'
          icon?: string
          color?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_family_id_fkey'
            columns: ['family_id']
            isOneToOne: false
            referencedRelation: 'families'
            referencedColumns: ['id']
          }
        ]
      }
      Gestao_FamiliarWilltransactions: {
        Row: {
          id: string
          family_id: string
          account_id: string
          category_id: string | null
          user_id: string
          description: string | null
          amount: number
          type: 'income' | 'expense' | 'transfer'
          date: string
          due_date: string | null
          paid: boolean
          paid_at: string | null
          transfer_id: string | null
          notes: string | null
          payment_cycle: 'dia05' | 'dia20' | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          account_id: string
          category_id?: string | null
          user_id: string
          description?: string | null
          amount: number
          type: 'income' | 'expense' | 'transfer'
          date: string
          due_date?: string | null
          paid?: boolean
          paid_at?: string | null
          transfer_id?: string | null
          notes?: string | null
          payment_cycle?: 'dia05' | 'dia20' | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          account_id?: string
          category_id?: string | null
          user_id?: string
          description?: string | null
          amount?: number
          type?: 'income' | 'expense' | 'transfer'
          date?: string
          due_date?: string | null
          paid?: boolean
          paid_at?: string | null
          transfer_id?: string | null
          notes?: string | null
          payment_cycle?: 'dia05' | 'dia20' | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_family_id_fkey'
            columns: ['family_id']
            isOneToOne: false
            referencedRelation: 'families'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          }
        ]
      }
      Gestao_FamiliarWillrecurring: {
        Row: {
          id: string
          family_id: string
          account_id: string
          category_id: string | null
          description: string
          amount: number
          type: 'income' | 'expense'
          frequency: 'weekly' | 'monthly' | 'yearly'
          next_date: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          account_id: string
          category_id?: string | null
          description: string
          amount: number
          type: 'income' | 'expense'
          frequency: 'weekly' | 'monthly' | 'yearly'
          next_date: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          account_id?: string
          category_id?: string | null
          description?: string
          amount?: number
          type?: 'income' | 'expense'
          frequency?: 'weekly' | 'monthly' | 'yearly'
          next_date?: string
          active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recurring_family_id_fkey'
            columns: ['family_id']
            isOneToOne: false
            referencedRelation: 'families'
            referencedColumns: ['id']
          }
        ]
      }
      Gestao_FamiliarWillgoals: {
        Row: {
          id: string
          family_id: string
          name: string
          target_amount: number
          current_amount: number
          deadline: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          target_amount: number
          current_amount?: number
          deadline?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          deadline?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'goals_family_id_fkey'
            columns: ['family_id']
            isOneToOne: false
            referencedRelation: 'families'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      register_family: {
        Args: { p_family_name: string }
        Returns: string
      }
      create_default_categories: {
        Args: { p_family_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
