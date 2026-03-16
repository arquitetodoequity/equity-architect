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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          id: string
          monthly_revenue: string | null
          name: string
          sector: string | null
          total_supply: number
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_revenue?: string | null
          name: string
          sector?: string | null
          total_supply?: number
        }
        Update: {
          created_at?: string
          id?: string
          monthly_revenue?: string | null
          name?: string
          sector?: string | null
          total_supply?: number
        }
        Relationships: []
      }
      distributions: {
        Row: {
          company_id: string
          created_by: string | null
          distributed_at: string
          id: string
          period_label: string
          total_amount: number
        }
        Insert: {
          company_id: string
          created_by?: string | null
          distributed_at?: string
          id?: string
          period_label: string
          total_amount?: number
        }
        Update: {
          company_id?: string
          created_by?: string | null
          distributed_at?: string
          id?: string
          period_label?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "distributions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_rules: {
        Row: {
          company_id: string
          id: string
          new_partner_mode: Database["public"]["Enums"]["new_partner_mode"]
          quorum_dissolution: number
          quorum_entry: number
          quorum_exit: number
          quorum_rules_change: number
          quorum_standard: number
        }
        Insert: {
          company_id: string
          id?: string
          new_partner_mode?: Database["public"]["Enums"]["new_partner_mode"]
          quorum_dissolution?: number
          quorum_entry?: number
          quorum_exit?: number
          quorum_rules_change?: number
          quorum_standard?: number
        }
        Update: {
          company_id?: string
          id?: string
          new_partner_mode?: Database["public"]["Enums"]["new_partner_mode"]
          quorum_dissolution?: number
          quorum_entry?: number
          quorum_exit?: number
          quorum_rules_change?: number
          quorum_standard?: number
        }
        Relationships: [
          {
            foreignKeyName: "governance_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          partner_type: Database["public"]["Enums"]["partner_type"]
          percentage: number
          pix_key: string | null
          role: string | null
          status: Database["public"]["Enums"]["partner_status"]
          token_amount: number
          wallet_address: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          partner_type?: Database["public"]["Enums"]["partner_type"]
          percentage?: number
          pix_key?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          token_amount?: number
          wallet_address?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          partner_type?: Database["public"]["Enums"]["partner_type"]
          percentage?: number
          pix_key?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          token_amount?: number
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          closes_at: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          proposal_type: string | null
          quorum_required: number
          status: Database["public"]["Enums"]["proposal_status"]
          title: string
        }
        Insert: {
          closes_at?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          proposal_type?: string | null
          quorum_required?: number
          status?: Database["public"]["Enums"]["proposal_status"]
          title: string
        }
        Update: {
          closes_at?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          proposal_type?: string | null
          quorum_required?: number
          status?: Database["public"]["Enums"]["proposal_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      token_types: {
        Row: {
          company_id: string
          description: string | null
          has_economic_rights: boolean
          has_voting_rights: boolean
          id: string
          name: Database["public"]["Enums"]["token_type_name"]
        }
        Insert: {
          company_id: string
          description?: string | null
          has_economic_rights?: boolean
          has_voting_rights?: boolean
          id?: string
          name: Database["public"]["Enums"]["token_type_name"]
        }
        Update: {
          company_id?: string
          description?: string | null
          has_economic_rights?: boolean
          has_voting_rights?: boolean
          id?: string
          name?: Database["public"]["Enums"]["token_type_name"]
        }
        Relationships: [
          {
            foreignKeyName: "token_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vesting_configs: {
        Row: {
          cliff_months: number | null
          company_id: string
          has_vesting: boolean
          id: string
          vesting_months: number | null
          vesting_type: Database["public"]["Enums"]["vesting_type"] | null
        }
        Insert: {
          cliff_months?: number | null
          company_id: string
          has_vesting?: boolean
          id?: string
          vesting_months?: number | null
          vesting_type?: Database["public"]["Enums"]["vesting_type"] | null
        }
        Update: {
          cliff_months?: number | null
          company_id?: string
          has_vesting?: boolean
          id?: string
          vesting_months?: number | null
          vesting_type?: Database["public"]["Enums"]["vesting_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "vesting_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          partner_id: string
          proposal_id: string
          token_weight: number
          vote: Database["public"]["Enums"]["vote_choice"]
        }
        Insert: {
          created_at?: string
          id?: string
          partner_id: string
          proposal_id: string
          token_weight?: number
          vote: Database["public"]["Enums"]["vote_choice"]
        }
        Update: {
          created_at?: string
          id?: string
          partner_id?: string
          proposal_id?: string
          token_weight?: number
          vote?: Database["public"]["Enums"]["vote_choice"]
        }
        Relationships: [
          {
            foreignKeyName: "votes_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      new_partner_mode: "pool" | "new_emission" | "both"
      partner_status: "active" | "inactive" | "reserve"
      partner_type: "founder" | "key_person" | "pool"
      proposal_status: "open" | "approved" | "rejected"
      token_type_name: "ON" | "PN" | "PHANTOM" | "GOLDEN"
      vesting_type: "time" | "milestone"
      vote_choice: "approve" | "reject"
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
    Enums: {
      new_partner_mode: ["pool", "new_emission", "both"],
      partner_status: ["active", "inactive", "reserve"],
      partner_type: ["founder", "key_person", "pool"],
      proposal_status: ["open", "approved", "rejected"],
      token_type_name: ["ON", "PN", "PHANTOM", "GOLDEN"],
      vesting_type: ["time", "milestone"],
      vote_choice: ["approve", "reject"],
    },
  },
} as const
