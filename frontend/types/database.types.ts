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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      tbl_admin: {
        Row: {
          adm_access_level: Database["public"]["Enums"]["admin_access_level_enum"]
          adm_created_at: string
          adm_email: string
          adm_full_name: string
          adm_id: number
          adm_is_active: boolean
          adm_password_hash: string
          adm_updated_at: string
        }
        Insert: {
          adm_access_level?: Database["public"]["Enums"]["admin_access_level_enum"]
          adm_created_at?: string
          adm_email: string
          adm_full_name: string
          adm_id?: number
          adm_is_active?: boolean
          adm_password_hash: string
          adm_updated_at?: string
        }
        Update: {
          adm_access_level?: Database["public"]["Enums"]["admin_access_level_enum"]
          adm_created_at?: string
          adm_email?: string
          adm_full_name?: string
          adm_id?: number
          adm_is_active?: boolean
          adm_password_hash?: string
          adm_updated_at?: string
        }
        Relationships: []
      }
      tbl_chef_profile: {
        Row: {
          chf_bio: string | null
          chf_created_at: string
          chf_cuisine_type: string | null
          chf_id: number
          chf_kitchen_address: string
          chf_rating_avg: number
          chf_user_id: string
          chf_verification_status: Database["public"]["Enums"]["chef_verification_enum"]
        }
        Insert: {
          chf_bio?: string | null
          chf_created_at?: string
          chf_cuisine_type?: string | null
          chf_id?: number
          chf_kitchen_address: string
          chf_rating_avg?: number
          chf_user_id: string
          chf_verification_status?: Database["public"]["Enums"]["chef_verification_enum"]
        }
        Update: {
          chf_bio?: string | null
          chf_created_at?: string
          chf_cuisine_type?: string | null
          chf_id?: number
          chf_kitchen_address?: string
          chf_rating_avg?: number
          chf_user_id?: string
          chf_verification_status?: Database["public"]["Enums"]["chef_verification_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_chf_user"
            columns: ["chf_user_id"]
            isOneToOne: true
            referencedRelation: "tbl_users"
            referencedColumns: ["usr_id"]
          },
        ]
      }
      tbl_customer: {
        Row: {
          cs_created_at: string
          cs_default_address: string | null
          cs_id: number
          cs_loyalty_points: number
          cs_user_id: string
        }
        Insert: {
          cs_created_at?: string
          cs_default_address?: string | null
          cs_id?: number
          cs_loyalty_points?: number
          cs_user_id: string
        }
        Update: {
          cs_created_at?: string
          cs_default_address?: string | null
          cs_id?: number
          cs_loyalty_points?: number
          cs_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cs_user"
            columns: ["cs_user_id"]
            isOneToOne: true
            referencedRelation: "tbl_users"
            referencedColumns: ["usr_id"]
          },
        ]
      }
      tbl_delivery_partner: {
        Row: {
          dp_admin_id: number | null
          dp_created_at: string
          dp_full_name: string
          dp_id: number
          dp_phone: string
          dp_status: Database["public"]["Enums"]["delivery_status_enum"]
          dp_vehicle_type: string | null
        }
        Insert: {
          dp_admin_id?: number | null
          dp_created_at?: string
          dp_full_name: string
          dp_id?: number
          dp_phone: string
          dp_status?: Database["public"]["Enums"]["delivery_status_enum"]
          dp_vehicle_type?: string | null
        }
        Update: {
          dp_admin_id?: number | null
          dp_created_at?: string
          dp_full_name?: string
          dp_id?: number
          dp_phone?: string
          dp_status?: Database["public"]["Enums"]["delivery_status_enum"]
          dp_vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_dp_admin"
            columns: ["dp_admin_id"]
            isOneToOne: false
            referencedRelation: "tbl_admin"
            referencedColumns: ["adm_id"]
          },
        ]
      }
      tbl_dish: {
        Row: {
          dsh_category: string | null
          dsh_chef_id: number
          dsh_created_at: string
          dsh_description: string | null
          dsh_id: number
          dsh_image_url: string | null
          dsh_is_available: boolean
          dsh_name: string
          dsh_price: number
          dsh_updated_at: string
        }
        Insert: {
          dsh_category?: string | null
          dsh_chef_id: number
          dsh_created_at?: string
          dsh_description?: string | null
          dsh_id?: number
          dsh_image_url?: string | null
          dsh_is_available?: boolean
          dsh_name: string
          dsh_price: number
          dsh_updated_at?: string
        }
        Update: {
          dsh_category?: string | null
          dsh_chef_id?: number
          dsh_created_at?: string
          dsh_description?: string | null
          dsh_id?: number
          dsh_image_url?: string | null
          dsh_is_available?: boolean
          dsh_name?: string
          dsh_price?: number
          dsh_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_dsh_chef"
            columns: ["dsh_chef_id"]
            isOneToOne: false
            referencedRelation: "tbl_chef_profile"
            referencedColumns: ["chf_id"]
          },
        ]
      }
      tbl_favorites: {
        Row: {
          fav_created_at: string
          fav_customer_id: number
          fav_dish_id: number
          fav_id: number
        }
        Insert: {
          fav_created_at?: string
          fav_customer_id: number
          fav_dish_id: number
          fav_id?: number
        }
        Update: {
          fav_created_at?: string
          fav_customer_id?: number
          fav_dish_id?: number
          fav_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_fav_customer"
            columns: ["fav_customer_id"]
            isOneToOne: false
            referencedRelation: "tbl_customer"
            referencedColumns: ["cs_id"]
          },
          {
            foreignKeyName: "fk_fav_dish"
            columns: ["fav_dish_id"]
            isOneToOne: false
            referencedRelation: "tbl_dish"
            referencedColumns: ["dsh_id"]
          },
        ]
      }
      tbl_order: {
        Row: {
          ord_customer_id: number
          ord_delivered_at: string | null
          ord_delivery_address: string
          ord_delivery_partner_id: number | null
          ord_id: number
          ord_order_date: string
          ord_payment_method_id: number
          ord_status: Database["public"]["Enums"]["order_status_enum"]
          ord_total_amount: number
        }
        Insert: {
          ord_customer_id: number
          ord_delivered_at?: string | null
          ord_delivery_address: string
          ord_delivery_partner_id?: number | null
          ord_id?: number
          ord_order_date?: string
          ord_payment_method_id: number
          ord_status?: Database["public"]["Enums"]["order_status_enum"]
          ord_total_amount: number
        }
        Update: {
          ord_customer_id?: number
          ord_delivered_at?: string | null
          ord_delivery_address?: string
          ord_delivery_partner_id?: number | null
          ord_id?: number
          ord_order_date?: string
          ord_payment_method_id?: number
          ord_status?: Database["public"]["Enums"]["order_status_enum"]
          ord_total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_ord_customer"
            columns: ["ord_customer_id"]
            isOneToOne: false
            referencedRelation: "tbl_customer"
            referencedColumns: ["cs_id"]
          },
          {
            foreignKeyName: "fk_ord_delivery_partner"
            columns: ["ord_delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "tbl_delivery_partner"
            referencedColumns: ["dp_id"]
          },
          {
            foreignKeyName: "fk_ord_payment_method"
            columns: ["ord_payment_method_id"]
            isOneToOne: false
            referencedRelation: "tbl_payment_method"
            referencedColumns: ["pm_id"]
          },
        ]
      }
      tbl_order_items: {
        Row: {
          oi_dish_id: number
          oi_id: number
          oi_order_id: number
          oi_quantity: number
          oi_subtotal: number
          oi_unit_price: number
        }
        Insert: {
          oi_dish_id: number
          oi_id?: number
          oi_order_id: number
          oi_quantity?: number
          oi_subtotal: number
          oi_unit_price: number
        }
        Update: {
          oi_dish_id?: number
          oi_id?: number
          oi_order_id?: number
          oi_quantity?: number
          oi_subtotal?: number
          oi_unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_oi_dish"
            columns: ["oi_dish_id"]
            isOneToOne: false
            referencedRelation: "tbl_dish"
            referencedColumns: ["dsh_id"]
          },
          {
            foreignKeyName: "fk_oi_order"
            columns: ["oi_order_id"]
            isOneToOne: false
            referencedRelation: "tbl_order"
            referencedColumns: ["ord_id"]
          },
        ]
      }
      tbl_payment_method: {
        Row: {
          pm_id: number
          pm_is_active: boolean
          pm_name: string
        }
        Insert: {
          pm_id?: number
          pm_is_active?: boolean
          pm_name: string
        }
        Update: {
          pm_id?: number
          pm_is_active?: boolean
          pm_name?: string
        }
        Relationships: []
      }
      tbl_review: {
        Row: {
          rv_comment: string | null
          rv_created_at: string
          rv_customer_id: number
          rv_id: number
          rv_order_id: number
          rv_rating: number
        }
        Insert: {
          rv_comment?: string | null
          rv_created_at?: string
          rv_customer_id: number
          rv_id?: number
          rv_order_id: number
          rv_rating: number
        }
        Update: {
          rv_comment?: string | null
          rv_created_at?: string
          rv_customer_id?: number
          rv_id?: number
          rv_order_id?: number
          rv_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_rv_customer"
            columns: ["rv_customer_id"]
            isOneToOne: false
            referencedRelation: "tbl_customer"
            referencedColumns: ["cs_id"]
          },
          {
            foreignKeyName: "fk_rv_order"
            columns: ["rv_order_id"]
            isOneToOne: true
            referencedRelation: "tbl_order"
            referencedColumns: ["ord_id"]
          },
        ]
      }
      tbl_support_content: {
        Row: {
          sc_admin_id: number | null
          sc_category: string | null
          sc_content: string
          sc_created_at: string
          sc_id: number
          sc_title: string
          sc_updated_at: string
        }
        Insert: {
          sc_admin_id?: number | null
          sc_category?: string | null
          sc_content: string
          sc_created_at?: string
          sc_id?: number
          sc_title: string
          sc_updated_at?: string
        }
        Update: {
          sc_admin_id?: number | null
          sc_category?: string | null
          sc_content?: string
          sc_created_at?: string
          sc_id?: number
          sc_title?: string
          sc_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sc_admin"
            columns: ["sc_admin_id"]
            isOneToOne: false
            referencedRelation: "tbl_admin"
            referencedColumns: ["adm_id"]
          },
        ]
      }
      tbl_users: {
        Row: {
          usr_address: string | null
          usr_admin_id: number | null
          usr_created_at: string
          usr_email: string
          usr_full_name: string
          usr_id: string
          usr_is_active: boolean
          usr_phone: string | null
          usr_profile_image: string | null
          usr_updated_at: string
        }
        Insert: {
          usr_address?: string | null
          usr_admin_id?: number | null
          usr_created_at?: string
          usr_email: string
          usr_full_name: string
          usr_id: string
          usr_is_active?: boolean
          usr_phone?: string | null
          usr_profile_image?: string | null
          usr_updated_at?: string
        }
        Update: {
          usr_address?: string | null
          usr_admin_id?: number | null
          usr_created_at?: string
          usr_email?: string
          usr_full_name?: string
          usr_id?: string
          usr_is_active?: boolean
          usr_phone?: string | null
          usr_profile_image?: string | null
          usr_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_usr_admin"
            columns: ["usr_admin_id"]
            isOneToOne: false
            referencedRelation: "tbl_admin"
            referencedColumns: ["adm_id"]
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
      admin_access_level_enum: "super_admin" | "moderator" | "support"
      chef_verification_enum: "pending" | "verified" | "rejected"
      delivery_status_enum: "available" | "busy" | "offline"
      order_status_enum:
        | "pending"
        | "confirmed"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
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
      admin_access_level_enum: ["super_admin", "moderator", "support"],
      chef_verification_enum: ["pending", "verified", "rejected"],
      delivery_status_enum: ["available", "busy", "offline"],
      order_status_enum: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
