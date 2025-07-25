export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          attachment_url: string | null
          chat_room_id: string
          id: string
          is_read: boolean | null
          message_content: string
          message_type: string | null
          sender_id: string | null
          sender_type: string
          sent_at: string | null
        }
        Insert: {
          attachment_url?: string | null
          chat_room_id: string
          id?: string
          is_read?: boolean | null
          message_content: string
          message_type?: string | null
          sender_id?: string | null
          sender_type: string
          sent_at?: string | null
        }
        Update: {
          attachment_url?: string | null
          chat_room_id?: string
          id?: string
          is_read?: boolean | null
          message_content?: string
          message_type?: string | null
          sender_id?: string | null
          sender_type?: string
          sent_at?: string | null
        }
        Relationships: []
      }
      consolidation_items: {
        Row: {
          added_at: string | null
          consolidation_request_id: string
          dimensions: string | null
          id: string
          package_description: string | null
          shipment_id: string
          weight_lbs: number | null
        }
        Insert: {
          added_at?: string | null
          consolidation_request_id: string
          dimensions?: string | null
          id?: string
          package_description?: string | null
          shipment_id: string
          weight_lbs?: number | null
        }
        Update: {
          added_at?: string | null
          consolidation_request_id?: string
          dimensions?: string | null
          id?: string
          package_description?: string | null
          shipment_id?: string
          weight_lbs?: number | null
        }
        Relationships: []
      }
      consolidation_requests: {
        Row: {
          consolidated_shipment_id: string | null
          created_at: string | null
          customer_id: string
          destination_country: string | null
          estimated_savings: number | null
          id: string
          request_date: string | null
          special_instructions: string | null
          status: string | null
          total_packages: number | null
          total_weight: number | null
          updated_at: string | null
        }
        Insert: {
          consolidated_shipment_id?: string | null
          created_at?: string | null
          customer_id: string
          destination_country?: string | null
          estimated_savings?: number | null
          id?: string
          request_date?: string | null
          special_instructions?: string | null
          status?: string | null
          total_packages?: number | null
          total_weight?: number | null
          updated_at?: string | null
        }
        Update: {
          consolidated_shipment_id?: string | null
          created_at?: string | null
          customer_id?: string
          destination_country?: string | null
          estimated_savings?: number | null
          id?: string
          request_date?: string | null
          special_instructions?: string | null
          status?: string | null
          total_packages?: number | null
          total_weight?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          frequent_shipper: boolean | null
          full_name: string
          id: string
          phone: string | null
          total_shipments: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          frequent_shipper?: boolean | null
          full_name: string
          id?: string
          phone?: string | null
          total_shipments?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          frequent_shipper?: boolean | null
          full_name?: string
          id?: string
          phone?: string | null
          total_shipments?: number | null
        }
        Relationships: []
      }
      delivery_proof: {
        Row: {
          delivered_at: string | null
          delivered_by: string | null
          delivery_location: string | null
          delivery_notes: string | null
          delivery_photo_url: string | null
          id: string
          recipient_name: string | null
          shipment_id: string
          signature_data: string | null
          signature_image_url: string | null
          verification_code: string | null
        }
        Insert: {
          delivered_at?: string | null
          delivered_by?: string | null
          delivery_location?: string | null
          delivery_notes?: string | null
          delivery_photo_url?: string | null
          id?: string
          recipient_name?: string | null
          shipment_id: string
          signature_data?: string | null
          signature_image_url?: string | null
          verification_code?: string | null
        }
        Update: {
          delivered_at?: string | null
          delivered_by?: string | null
          delivery_location?: string | null
          delivery_notes?: string | null
          delivery_photo_url?: string | null
          id?: string
          recipient_name?: string | null
          shipment_id?: string
          signature_data?: string | null
          signature_image_url?: string | null
          verification_code?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string | null
          customer_id: string | null
          error_message: string | null
          id: string
          message_content: string | null
          notification_type: string
          recipient: string
          sent_at: string | null
          shipment_id: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          notification_type: string
          recipient: string
          sent_at?: string | null
          shipment_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          notification_type?: string
          recipient?: string
          sent_at?: string | null
          shipment_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      package_photos: {
        Row: {
          caption: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          photo_type: string
          photo_url: string
          shipment_id: string
          taken_at: string | null
          taken_by: string | null
        }
        Insert: {
          caption?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          photo_type: string
          photo_url: string
          shipment_id: string
          taken_at?: string | null
          taken_by?: string | null
        }
        Update: {
          caption?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          photo_type?: string
          photo_url?: string
          shipment_id?: string
          taken_at?: string | null
          taken_by?: string | null
        }
        Relationships: []
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
          shipment_id: string
        }
        Insert: {
          barcode: string
          device_info?: string | null
          id?: string
          location?: string | null
          scan_timestamp?: string | null
          scan_type: string
          scanned_by: string
          shipment_id: string
        }
        Update: {
          barcode?: string
          device_info?: string | null
          id?: string
          location?: string | null
          scan_timestamp?: string | null
          scan_type?: string
          scanned_by?: string
          shipment_id?: string
        }
        Relationships: []
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
        Relationships: []
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
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: string
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          event_description: string
          event_type: string
          id: string
          location: string | null
          notes: string | null
          shipment_id: string
          staff_member: string | null
          timestamp: string | null
        }
        Insert: {
          event_description: string
          event_type: string
          id?: string
          location?: string | null
          notes?: string | null
          shipment_id: string
          staff_member?: string | null
          timestamp?: string | null
        }
        Update: {
          event_description?: string
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          shipment_id?: string
          staff_member?: string | null
          timestamp?: string | null
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