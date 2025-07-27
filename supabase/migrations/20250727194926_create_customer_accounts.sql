-- Create customer_accounts table
CREATE TABLE IF NOT EXISTS customer_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    primary_address_id UUID,
    whatsapp_notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create staff_users table
CREATE TABLE IF NOT EXISTS staff_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number VARCHAR(255) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    origin_address TEXT,
    destination_address TEXT NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    package_type VARCHAR(50) NOT NULL,
    package_description TEXT,
    weight_lbs DECIMAL(10,2),
    dimensions VARCHAR(100),
    service_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    received_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    estimated_delivery TIMESTAMP,
    special_instructions TEXT,
    total_cost DECIMAL(10,2),
    is_paid BOOLEAN DEFAULT FALSE
);

-- Create tracking_events table
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id),
    event_type VARCHAR(50) NOT NULL,
    event_description TEXT NOT NULL,
    location VARCHAR(255),
    staff_member VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

-- Create customer_addresses table
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    address_type VARCHAR(50) DEFAULT 'delivery',
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scan_logs table
CREATE TABLE IF NOT EXISTS scan_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id),
    barcode VARCHAR(255) NOT NULL,
    scan_type VARCHAR(50) NOT NULL,
    scanned_by VARCHAR(255) NOT NULL,
    scan_timestamp TIMESTAMP DEFAULT NOW(),
    device_info TEXT,
    location VARCHAR(255)
);

-- Create consolidation_requests table
CREATE TABLE IF NOT EXISTS consolidation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    consolidation_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_weight DECIMAL(10,2),
    total_packages INTEGER DEFAULT 0,
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    consolidation_date TIMESTAMP WITH TIME ZONE,
    shipped_date TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create consolidation_items table
CREATE TABLE IF NOT EXISTS consolidation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consolidation_id UUID REFERENCES consolidation_requests(id),
    tracking_number VARCHAR(255) NOT NULL,
    package_description TEXT,
    weight_lbs DECIMAL(10,2),
    dimensions VARCHAR(100),
    added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_bookings table
CREATE TABLE IF NOT EXISTS service_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    pickup_address_id UUID,
    delivery_address_id UUID,
    special_instructions TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    estimated_cost DECIMAL(10,2),
    confirmation_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_documents table
CREATE TABLE IF NOT EXISTS customer_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    associated_shipment_id UUID,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false,
    notes TEXT
);
