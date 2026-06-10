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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      lessons: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          lesson_date: string
          tags: string[] | null
          title: string
          trade_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          lesson_date?: string
          tags?: string[] | null
          title: string
          trade_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          lesson_date?: string
          tags?: string[] | null
          title?: string
          trade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      morning_briefs: {
        Row: {
          brief_date: string
          catalysts: string | null
          created_at: string
          id: string
          leadership_groups: string | null
          market_tone: string | null
          notes: string | null
          risks: string | null
          updated_at: string
          watchlist: string[] | null
        }
        Insert: {
          brief_date?: string
          catalysts?: string | null
          created_at?: string
          id?: string
          leadership_groups?: string | null
          market_tone?: string | null
          notes?: string | null
          risks?: string | null
          updated_at?: string
          watchlist?: string[] | null
        }
        Update: {
          brief_date?: string
          catalysts?: string | null
          created_at?: string
          id?: string
          leadership_groups?: string | null
          market_tone?: string | null
          notes?: string | null
          risks?: string | null
          updated_at?: string
          watchlist?: string[] | null
        }
        Relationships: []
      }
      patterns: {
        Row: {
          avg_rr: number | null
          created_at: string
          description: string | null
          examples: string | null
          id: string
          lessons: string | null
          name: string
          occurrences: number | null
          signs: string | null
          updated_at: string
          win_rate: number | null
        }
        Insert: {
          avg_rr?: number | null
          created_at?: string
          description?: string | null
          examples?: string | null
          id?: string
          lessons?: string | null
          name: string
          occurrences?: number | null
          signs?: string | null
          updated_at?: string
          win_rate?: number | null
        }
        Update: {
          avg_rr?: number | null
          created_at?: string
          description?: string | null
          examples?: string | null
          id?: string
          lessons?: string | null
          name?: string
          occurrences?: number | null
          signs?: string | null
          updated_at?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          entry_price: number | null
          exit_price: number | null
          id: string
          notes: string | null
          pnl: number | null
          side: string
          size: number | null
          status: string
          stop_price: number | null
          symbol: string
          tags: string[] | null
          target_price: number | null
          trade_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          notes?: string | null
          pnl?: number | null
          side?: string
          size?: number | null
          status?: string
          stop_price?: number | null
          symbol: string
          tags?: string[] | null
          target_price?: number | null
          trade_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          notes?: string | null
          pnl?: number | null
          side?: string
          size?: number | null
          status?: string
          stop_price?: number | null
          symbol?: string
          tags?: string[] | null
          target_price?: number | null
          trade_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      watchlist_entries: {
        Row: {
          created_at: string
          first_seen: string
          id: string
          last_reviewed: string | null
          notes: string | null
          observations: string | null
          performance_notes: string | null
          status: string
          symbol: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_seen?: string
          id?: string
          last_reviewed?: string | null
          notes?: string | null
          observations?: string | null
          performance_notes?: string | null
          status?: string
          symbol: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_seen?: string
          id?: string
          last_reviewed?: string | null
          notes?: string | null
          observations?: string | null
          performance_notes?: string | null
          status?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
