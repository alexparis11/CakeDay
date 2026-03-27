// Auto-generated Supabase types (run: supabase gen types typescript --local > src/types/database.ts)
// This is a manually maintained version — regenerate after schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = "admin" | "client"
export type SubscriptionStatus = "active" | "inactive"
export type OrderStatus = "pending_approval" | "approved" | "skipped" | "dispatched"

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          contact_name: string | null
          contact_email: string
          headcount: number
          subscription_status: SubscriptionStatus
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          default_cake_type: string
          default_delivery_notes: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["companies"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>
        Relationships: []
      }
      users: {
        Row: {
          id: string
          role: UserRole
          company_id: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at"> & {
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>
        Relationships: []
      }
      employees: {
        Row: {
          id: string
          company_id: string
          first_name: string
          last_name: string
          birthday: string
          delivery_address: string
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["employees"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          company_id: string
          employee_id: string
          delivery_date: string
          cake_type: string
          delivery_address: string
          status: OrderStatus
          approved_at: string | null
          dispatched_at: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>
        Relationships: []
      }
      bakery_summary_emails: {
        Row: {
          id: string
          order_id: string
          sent_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["bakery_summary_emails"]["Row"], "id" | "sent_at"> & {
          id?: string
          sent_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["bakery_summary_emails"]["Insert"]>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      subscription_status: SubscriptionStatus
      order_status: OrderStatus
    }
  }
}
