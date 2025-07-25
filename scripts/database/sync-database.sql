-- Comprehensive Database Sync Script for Chrisdan Enterprises
-- This script ensures all tables, relationships, and policies are properly set up

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE tracking_status AS ENUM (
        'pending',
        'picked_up',
        'in_transit',
        'customs',
        'out_for_delivery',
        'delivered',
        'failed_delivery',
        'returned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE address_type AS ENUM ('delivery', 'pickup', 'billing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_type AS ENUM ('standard', 'express', 'overnight', 'economy');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables if they don't exist

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer accounts table (enhanced profile)
CREATE TABLE IF NOT EXISTS customer_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    whatsapp_notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer addresses table
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    address_type address_type DEFAULT 'delivery',
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff users table
CREATE TABLE IF NOT EXISTS staff_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'staff',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customer_accounts(id),
    sender_name TEXT NOT NULL,
    sender_email TEXT,
    sender_phone TEXT,
    sender_address TEXT,
    receiver_name TEXT NOT NULL,
    receiver_email TEXT,
    receiver_phone TEXT,
    receiver_address TEXT NOT NULL,
    service_type service_type DEFAULT 'standard',
    weight DECIMAL(10,2),
    dimensions TEXT,
    declared_value DECIMAL(12,2),
    shipping_cost DECIMAL(10,2),
    current_status tracking_status DEFAULT 'pending',
    estimated_delivery DATE,
    actual_delivery DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracking events table
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    status tracking_status NOT NULL,
    location TEXT,
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    staff_id UUID REFERENCES staff_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service bookings table
CREATE TABLE IF NOT EXISTS service_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customer_accounts(id),
    service_type VARCHAR(100) NOT NULL,
    pickup_address TEXT,
    delivery_address TEXT,
    preferred_date DATE,
    preferred_time TIME,
    special_instructions TEXT,
    estimated_cost DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer documents table
CREATE TABLE IF NOT EXISTS customer_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_type VARCHAR(50),
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package photos table
CREATE TABLE IF NOT EXISTS package_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_type VARCHAR(50) DEFAULT 'general',
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    staff_id UUID REFERENCES staff_users(id)
);

-- Delivery proof table
CREATE TABLE IF NOT EXISTS delivery_proof (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    signature_url TEXT,
    photo_url TEXT,
    receiver_name TEXT,
    delivery_notes TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    staff_id UUID REFERENCES staff_users(id)
);

-- Scan logs table
CREATE TABLE IF NOT EXISTS scan_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    scan_type VARCHAR(50) NOT NULL,
    location TEXT,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    staff_id UUID REFERENCES staff_users(id)
);

-- Consolidation requests table
CREATE TABLE IF NOT EXISTS consolidation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
    request_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_weight DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    consolidation_fee DECIMAL(8,2),
    shipping_address_id UUID REFERENCES customer_addresses(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consolidation items table
CREATE TABLE IF NOT EXISTS consolidation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consolidation_id UUID NOT NULL REFERENCES consolidation_requests(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100) NOT NULL,
    description TEXT,
    weight DECIMAL(8,2),
    declared_value DECIMAL(10,2),
    received_date DATE,
    status VARCHAR(50) DEFAULT 'pending'
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customer_accounts(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff_users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'staff')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customer_accounts(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(current_status);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON tracking_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_is_default ON customer_addresses(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_service_bookings_customer_id ON service_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_customer_id ON chat_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_customer_accounts_updated_at BEFORE UPDATE ON customer_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_users_updated_at BEFORE UPDATE ON staff_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON service_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consolidation_requests_updated_at BEFORE UPDATE ON consolidation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE customer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_proof ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Customer account policies
DROP POLICY IF EXISTS "Users can view own account" ON customer_accounts;
CREATE POLICY "Users can view own account" ON customer_accounts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own account" ON customer_accounts;
CREATE POLICY "Users can insert own account" ON customer_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own account" ON customer_accounts;
CREATE POLICY "Users can update own account" ON customer_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Customer addresses policies
DROP POLICY IF EXISTS "Users can view own addresses" ON customer_addresses;
CREATE POLICY "Users can view own addresses" ON customer_addresses
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customer_accounts WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own addresses" ON customer_addresses;
CREATE POLICY "Users can insert own addresses" ON customer_addresses
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT id FROM customer_accounts WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own addresses" ON customer_addresses;
CREATE POLICY "Users can update own addresses" ON customer_addresses
    FOR UPDATE USING (
        customer_id IN (
            SELECT id FROM customer_accounts WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete own addresses" ON customer_addresses;
CREATE POLICY "Users can delete own addresses" ON customer_addresses
    FOR DELETE USING (
        customer_id IN (
            SELECT id FROM customer_accounts WHERE user_id = auth.uid()
        )
    );

-- Staff policies (staff can access everything)
DROP POLICY IF EXISTS "Staff can access all accounts" ON customer_accounts;
CREATE POLICY "Staff can access all accounts" ON customer_accounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM staff_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Shipments policies
DROP POLICY IF EXISTS "Customers can view own shipments" ON shipments;
CREATE POLICY "Customers can view own shipments" ON shipments
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customer_accounts WHERE user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM staff_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Set up storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('customer-documents', 'customer-documents', false),
    ('package-photos', 'package-photos', false),
    ('delivery-signatures', 'delivery-signatures', false),
    ('chrisdan-assets', 'chrisdan-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Customer document access" ON storage.objects;
CREATE POLICY "Customer document access" ON storage.objects
    FOR ALL USING (bucket_id = 'customer-documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Package photo access" ON storage.objects;
CREATE POLICY "Package photo access" ON storage.objects
    FOR ALL USING (bucket_id = 'package-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Delivery signature access" ON storage.objects;
CREATE POLICY "Delivery signature access" ON storage.objects
    FOR ALL USING (bucket_id = 'delivery-signatures' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public asset access" ON storage.objects;
CREATE POLICY "Public asset access" ON storage.objects
    FOR SELECT USING (bucket_id = 'chrisdan-assets');

-- Create function to generate tracking numbers
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
DECLARE
    tracking_num TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate tracking number: CE + YYYYMMDD + 6 random digits
        tracking_num := 'CE' || to_char(NOW(), 'YYYYMMDD') || lpad(floor(random() * 1000000)::text, 6, '0');
        
        -- Check if it already exists
        SELECT COUNT(*) INTO exists_check FROM shipments WHERE tracking_number = tracking_num;
        
        -- If unique, exit loop
        EXIT WHEN exists_check = 0;
    END LOOP;
    
    RETURN tracking_num;
END;
$$ LANGUAGE plpgsql;

-- Create constraint to ensure only one default address per customer
DROP CONSTRAINT IF EXISTS unique_default_address;
CREATE UNIQUE INDEX IF NOT EXISTS unique_default_address_per_customer 
ON customer_addresses (customer_id) 
WHERE is_default = true;

-- Insert sample data for development (only if tables are empty)
DO $$
BEGIN
    -- Check if we already have data
    IF NOT EXISTS (SELECT 1 FROM customer_accounts LIMIT 1) THEN
        -- This will be handled by the application-level user creation scripts
        NULL;
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Refresh the schema
NOTIFY pgrst, 'reload schema';

-- Final verification
SELECT 'Database schema synchronized successfully' as status;
