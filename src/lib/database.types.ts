export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      business_metrics: {
        Row: {
          actual_revenue: number | null
          assigned_staff_id: string | null
          business_priority_score: number | null
          calculated_at: string | null
          communication_responsiveness: number | null
          created_at: string | null
          customer_engagement_level: number | null
          customer_lifetime_value: number | null
          customer_retention_risk: number | null
          customer_satisfaction_score: number | null
          destination_country: string | null
          documentation_completeness: number | null
          estimated_revenue: number | null
          first_response_time_minutes: number | null
          id: string
          marketing_channel: string | null
          origin_region: string | null
          processing_time_minutes: number | null
          referral_source: string | null
          repeat_customer: boolean | null
          resolution_time_minutes: number | null
          service_quality_score: number | null
          shipping_route: string | null
          sla_compliance: boolean | null
          staff_customer_rating: number | null
          staff_efficiency_score: number | null
          staff_workload_impact: number | null
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          actual_revenue?: number | null
          assigned_staff_id?: string | null
          business_priority_score?: number | null
          calculated_at?: string | null
          communication_responsiveness?: number | null
          created_at?: string | null
          customer_engagement_level?: number | null
          customer_lifetime_value?: number | null
          customer_retention_risk?: number | null
          customer_satisfaction_score?: number | null
          destination_country?: string | null
          documentation_completeness?: number | null
          estimated_revenue?: number | null
          first_response_time_minutes?: number | null
          id?: string
          marketing_channel?: string | null
          origin_region?: string | null
          processing_time_minutes?: number | null
          referral_source?: string | null
          repeat_customer?: boolean | null
          resolution_time_minutes?: number | null
          service_quality_score?: number | null
          shipping_route?: string | null
          sla_compliance?: boolean | null
          staff_customer_rating?: number | null
          staff_efficiency_score?: number | null
          staff_workload_impact?: number | null
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          actual_revenue?: number | null
          assigned_staff_id?: string | null
          business_priority_score?: number | null
          calculated_at?: string | null
          communication_responsiveness?: number | null
          created_at?: string | null
          customer_engagement_level?: number | null
          customer_lifetime_value?: number | null
          customer_retention_risk?: number | null
          customer_satisfaction_score?: number | null
          destination_country?: string | null
          documentation_completeness?: number | null
          estimated_revenue?: number | null
          first_response_time_minutes?: number | null
          id?: string
          marketing_channel?: string | null
          origin_region?: string | null
          processing_time_minutes?: number | null
          referral_source?: string | null
          repeat_customer?: boolean | null
          resolution_time_minutes?: number | null
          service_quality_score?: number | null
          shipping_route?: string | null
          sla_compliance?: boolean | null
          staff_customer_rating?: number | null
          staff_efficiency_score?: number | null
          staff_workload_impact?: number | null
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_metrics_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_metrics_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_threads: {
        Row: {
          action_required: boolean | null
          action_type: string | null
          automation_rule: string | null
          channel: string | null
          created_at: string | null
          delivery_error: string | null
          delivery_status: string | null
          id: string
          is_automated: boolean | null
          is_business_synced: boolean | null
          is_customer_synced: boolean | null
          is_important: boolean | null
          is_read: boolean | null
          is_staff_synced: boolean | null
          message_content: string
          message_subject: string | null
          message_type: string
          parent_message_id: string | null
          participant_id: string | null
          participant_type: string
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          responded_at: string | null
          response_count: number | null
          workflow_id: string | null
        }
        Insert: {
          action_required?: boolean | null
          action_type?: string | null
          automation_rule?: string | null
          channel?: string | null
          created_at?: string | null
          delivery_error?: string | null
          delivery_status?: string | null
          id?: string
          is_automated?: boolean | null
          is_business_synced?: boolean | null
          is_customer_synced?: boolean | null
          is_important?: boolean | null
          is_read?: boolean | null
          is_staff_synced?: boolean | null
          message_content: string
          message_subject?: string | null
          message_type: string
          parent_message_id?: string | null
          participant_id?: string | null
          participant_type: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          responded_at?: string | null
          response_count?: number | null
          workflow_id?: string | null
        }
        Update: {
          action_required?: boolean | null
          action_type?: string | null
          automation_rule?: string | null
          channel?: string | null
          created_at?: string | null
          delivery_error?: string | null
          delivery_status?: string | null
          id?: string
          is_automated?: boolean | null
          is_business_synced?: boolean | null
          is_customer_synced?: boolean | null
          is_important?: boolean | null
          is_read?: boolean | null
          is_staff_synced?: boolean | null
          message_content?: string
          message_subject?: string | null
          message_type?: string
          parent_message_id?: string | null
          participant_id?: string | null
          participant_type?: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          responded_at?: string | null
          response_count?: number | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_threads_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "communication_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "unified_communication_timeline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      consolidation_items: {
        Row: {
          added_date: string | null
          consolidation_id: string | null
          dimensions: string | null
          id: string
          package_description: string | null
          tracking_number: string
          weight_lbs: number | null
        }
        Insert: {
          added_date?: string | null
          consolidation_id?: string | null
          dimensions?: string | null
          id?: string
          package_description?: string | null
          tracking_number: string
          weight_lbs?: number | null
        }
        Update: {
          added_date?: string | null
          consolidation_id?: string | null
          dimensions?: string | null
          id?: string
          package_description?: string | null
          tracking_number?: string
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consolidation_items_consolidation_id_fkey"
            columns: ["consolidation_id"]
            isOneToOne: false
            referencedRelation: "consolidation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_consolidation_items_consolidation"
            columns: ["consolidation_id"]
            isOneToOne: false
            referencedRelation: "consolidation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      consolidation_requests: {
        Row: {
          consolidation_date: string | null
          consolidation_name: string
          customer_id: string
          id: string
          notes: string | null
          requested_date: string | null
          shipped_date: string | null
          status: string | null
          total_packages: number | null
          total_weight: number | null
        }
        Insert: {
          consolidation_date?: string | null
          consolidation_name: string
          customer_id: string
          id?: string
          notes?: string | null
          requested_date?: string | null
          shipped_date?: string | null
          status?: string | null
          total_packages?: number | null
          total_weight?: number | null
        }
        Update: {
          consolidation_date?: string | null
          consolidation_name?: string
          customer_id?: string
          id?: string
          notes?: string | null
          requested_date?: string | null
          shipped_date?: string | null
          status?: string | null
          total_packages?: number | null
          total_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_consolidation_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_consolidation_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_insights"
            referencedColumns: ["customer_email"]
          },
        ]
      }
      customer_accounts: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          primary_address_id: string | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_id: string | null
          whatsapp_notifications: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          primary_address_id?: string | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_notifications?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          primary_address_id?: string | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_notifications?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer_accounts_primary_address"
            columns: ["primary_address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          address_type: string | null
          city: string
          country: string
          created_at: string | null
          customer_id: string
          id: string
          is_default: boolean | null
          postal_code: string | null
          state_province: string | null
          street_address: string
          updated_at: string | null
        }
        Insert: {
          address_type?: string | null
          city: string
          country: string
          created_at?: string | null
          customer_id: string
          id?: string
          is_default?: boolean | null
          postal_code?: string | null
          state_province?: string | null
          street_address: string
          updated_at?: string | null
        }
        Update: {
          address_type?: string | null
          city?: string
          country?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          is_default?: boolean | null
          postal_code?: string | null
          state_province?: string | null
          street_address?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer_addresses_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_addresses_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_insights"
            referencedColumns: ["customer_email"]
          },
        ]
      }
      customer_documents: {
        Row: {
          associated_shipment_id: string | null
          customer_id: string
          document_name: string
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          is_verified: boolean | null
          mime_type: string | null
          notes: string | null
          upload_date: string | null
        }
        Insert: {
          associated_shipment_id?: string | null
          customer_id: string
          document_name: string
          document_type: string
          file_size?: number | null
          file_url: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          upload_date?: string | null
        }
        Update: {
          associated_shipment_id?: string | null
          customer_id?: string
          document_name?: string
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          upload_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer_documents_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_documents_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_insights"
            referencedColumns: ["customer_email"]
          },
        ]
      }
      scan_logs: {
        Row: {
          barcode: string
          device_info: string | null
          id: string
          location: string | null
          scan_timestamp: string | null
          scan_type: string
          scanned_by: string
          shipment_id: string | null
        }
        Insert: {
          barcode: string
          device_info?: string | null
          id?: string
          location?: string | null
          scan_timestamp?: string | null
          scan_type: string
          scanned_by: string
          shipment_id?: string | null
        }
        Update: {
          barcode?: string
          device_info?: string | null
          id?: string
          location?: string | null
          scan_timestamp?: string | null
          scan_type?: string
          scanned_by?: string
          shipment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_logs_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bookings: {
        Row: {
          booking_date: string
          confirmation_number: string | null
          created_at: string | null
          customer_id: string
          delivery_address_id: string | null
          estimated_cost: number | null
          id: string
          pickup_address_id: string | null
          service_type: string
          special_instructions: string | null
          status: string | null
          time_slot: string
          updated_at: string | null
        }
        Insert: {
          booking_date: string
          confirmation_number?: string | null
          created_at?: string | null
          customer_id: string
          delivery_address_id?: string | null
          estimated_cost?: number | null
          id?: string
          pickup_address_id?: string | null
          service_type: string
          special_instructions?: string | null
          status?: string | null
          time_slot: string
          updated_at?: string | null
        }
        Update: {
          booking_date?: string
          confirmation_number?: string | null
          created_at?: string | null
          customer_id?: string
          delivery_address_id?: string | null
          estimated_cost?: number | null
          id?: string
          pickup_address_id?: string | null
          service_type?: string
          special_instructions?: string | null
          status?: string | null
          time_slot?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_bookings_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_bookings_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_insights"
            referencedColumns: ["customer_email"]
          },
          {
            foreignKeyName: "fk_service_bookings_delivery_address"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_bookings_pickup_address"
            columns: ["pickup_address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          delivered_at: string | null
          destination_address: string
          destination_country: string
          dimensions: string | null
          estimated_delivery: string | null
          id: string
          is_paid: boolean | null
          origin_address: string | null
          package_description: string | null
          package_type: string
          received_at: string | null
          service_type: string
          shipped_at: string | null
          special_instructions: string | null
          status: string
          total_cost: number | null
          tracking_number: string
          weight_lbs: number | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          delivered_at?: string | null
          destination_address: string
          destination_country: string
          dimensions?: string | null
          estimated_delivery?: string | null
          id?: string
          is_paid?: boolean | null
          origin_address?: string | null
          package_description?: string | null
          package_type: string
          received_at?: string | null
          service_type: string
          shipped_at?: string | null
          special_instructions?: string | null
          status?: string
          total_cost?: number | null
          tracking_number: string
          weight_lbs?: number | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivered_at?: string | null
          destination_address?: string
          destination_country?: string
          dimensions?: string | null
          estimated_delivery?: string | null
          id?: string
          is_paid?: boolean | null
          origin_address?: string | null
          package_description?: string | null
          package_type?: string
          received_at?: string | null
          service_type?: string
          shipped_at?: string | null
          special_instructions?: string | null
          status?: string
          total_cost?: number | null
          tracking_number?: string
          weight_lbs?: number | null
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          phone: string | null
          requested_at: string | null
          role: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          requested_at?: string | null
          role?: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          requested_at?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_staff_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          event_description: string
          event_type: string
          id: string
          location: string | null
          notes: string | null
          shipment_id: string | null
          staff_member: string | null
          timestamp: string | null
        }
        Insert: {
          event_description: string
          event_type: string
          id?: string
          location?: string | null
          notes?: string | null
          shipment_id?: string | null
          staff_member?: string | null
          timestamp?: string | null
        }
        Update: {
          event_description?: string
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          shipment_id?: string | null
          staff_member?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_instances: {
        Row: {
          actual_revenue: number | null
          assigned_at: string | null
          assigned_staff_id: string | null
          completed_at: string | null
          created_at: string | null
          current_step: string | null
          customer_id: string | null
          customer_last_activity_at: string | null
          estimated_revenue: number | null
          first_staff_response_at: string | null
          id: string
          intake_at: string | null
          is_business_updated: boolean | null
          is_customer_notified: boolean | null
          is_staff_notified: boolean | null
          next_required_action: string | null
          priority_level: number | null
          processing_time_minutes: number | null
          source_channel: string | null
          tracking_number: string
          updated_at: string | null
          workflow_status: string
          workflow_type: string
        }
        Insert: {
          actual_revenue?: number | null
          assigned_at?: string | null
          assigned_staff_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          customer_id?: string | null
          customer_last_activity_at?: string | null
          estimated_revenue?: number | null
          first_staff_response_at?: string | null
          id?: string
          intake_at?: string | null
          is_business_updated?: boolean | null
          is_customer_notified?: boolean | null
          is_staff_notified?: boolean | null
          next_required_action?: string | null
          priority_level?: number | null
          processing_time_minutes?: number | null
          source_channel?: string | null
          tracking_number: string
          updated_at?: string | null
          workflow_status?: string
          workflow_type?: string
        }
        Update: {
          actual_revenue?: number | null
          assigned_at?: string | null
          assigned_staff_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          customer_id?: string | null
          customer_last_activity_at?: string | null
          estimated_revenue?: number | null
          first_staff_response_at?: string | null
          id?: string
          intake_at?: string | null
          is_business_updated?: boolean | null
          is_customer_notified?: boolean | null
          is_staff_notified?: boolean | null
          next_required_action?: string | null
          priority_level?: number | null
          processing_time_minutes?: number | null
          source_channel?: string | null
          tracking_number?: string
          updated_at?: string | null
          workflow_status?: string
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_instances_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_insights"
            referencedColumns: ["customer_email"]
          },
        ]
      }
    }
    Views: {
      customer_insights: {
        Row: {
          avg_processing_time: number | null
          avg_satisfaction: number | null
          customer_email: string | null
          customer_name: string | null
          last_activity: string | null
          repeat_customer: boolean | null
          total_shipments: number | null
          total_spent: number | null
        }
        Relationships: []
      }
      daily_revenue_summary: {
        Row: {
          avg_processing_time: number | null
          avg_satisfaction: number | null
          daily_revenue: number | null
          date: string | null
          total_workflows: number | null
        }
        Relationships: []
      }
      staff_performance_summary: {
        Row: {
          avg_customer_rating: number | null
          avg_efficiency: number | null
          avg_processing_time: number | null
          staff_email: string | null
          total_assignments: number | null
          total_revenue_generated: number | null
        }
        Relationships: []
      }
      unified_communication_timeline: {
        Row: {
          action_required: boolean | null
          channel: string | null
          created_at: string | null
          delivery_status: string | null
          id: string | null
          is_read: boolean | null
          message_content: string | null
          message_subject: string | null
          message_type: string | null
          participant_name: string | null
          participant_type: string | null
          response_count: number | null
          tracking_number: string | null
          workflow_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_threads_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_business_metrics: {
        Args: { p_workflow_id: string }
        Returns: undefined
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
