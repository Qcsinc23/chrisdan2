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
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consolidation_requests table
CREATE TABLE IF NOT EXISTS consolidation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    consolidation_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    destination_country VARCHAR(100) NOT NULL,
    total_weight DECIMAL(10,2) DEFAULT 0,
    total_packages INTEGER DEFAULT 0,
    estimated_savings DECIMAL(10,2) DEFAULT 0,
    consolidated_shipment_id UUID,
    special_instructions TEXT,
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    consolidation_date TIMESTAMP WITH TIME ZONE,
    shipped_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Create consolidation_items table
CREATE TABLE IF NOT EXISTS consolidation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consolidation_id UUID NOT NULL,
    shipment_id UUID,
    tracking_number VARCHAR(255) NOT NULL,
    package_description TEXT,
    weight_lbs DECIMAL(10,2),
    dimensions VARCHAR(100),
    added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints (only if tables exist)
DO $$ 
BEGIN
    -- Add foreign key for customer_addresses
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customer_addresses_customer') THEN
        ALTER TABLE customer_addresses 
        ADD CONSTRAINT fk_customer_addresses_customer 
        FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for service_bookings
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_service_bookings_customer') THEN
        ALTER TABLE service_bookings 
        ADD CONSTRAINT fk_service_bookings_customer 
        FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_service_bookings_pickup_address') THEN
        ALTER TABLE service_bookings 
        ADD CONSTRAINT fk_service_bookings_pickup_address 
        FOREIGN KEY (pickup_address_id) REFERENCES customer_addresses(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_service_bookings_delivery_address') THEN
        ALTER TABLE service_bookings 
        ADD CONSTRAINT fk_service_bookings_delivery_address 
        FOREIGN KEY (delivery_address_id) REFERENCES customer_addresses(id);
    END IF;
    
    -- Add foreign key for customer_documents
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customer_documents_customer') THEN
        ALTER TABLE customer_documents 
        ADD CONSTRAINT fk_customer_documents_customer 
        FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for customer_documents to shipments (only if shipments table exists)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customer_documents_shipment') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipments') THEN
        ALTER TABLE customer_documents 
        ADD CONSTRAINT fk_customer_documents_shipment 
        FOREIGN KEY (associated_shipment_id) REFERENCES shipments(id);
    END IF;
    
    -- Add foreign key for consolidation_requests
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_consolidation_customer') THEN
        ALTER TABLE consolidation_requests 
        ADD CONSTRAINT fk_consolidation_customer 
        FOREIGN KEY (customer_id) REFERENCES customer_accounts(id);
    END IF;
    
    -- Add foreign key for consolidation_items to consolidation_requests
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_consolidation_items_consolidation') THEN
        ALTER TABLE consolidation_items 
        ADD CONSTRAINT fk_consolidation_items_consolidation 
        FOREIGN KEY (consolidation_id) REFERENCES consolidation_requests(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for consolidation_items (only if shipments table and shipment_id column exist)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_consolidation_items_shipment') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipments')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consolidation_items' AND column_name = 'shipment_id') THEN
        ALTER TABLE consolidation_items 
        ADD CONSTRAINT fk_consolidation_items_shipment 
        FOREIGN KEY (shipment_id) REFERENCES shipments(id);
    END IF;
    
    -- Add primary_address_id foreign key to customer_accounts
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customer_accounts_primary_address') THEN
        ALTER TABLE customer_accounts 
        ADD CONSTRAINT fk_customer_accounts_primary_address 
        FOREIGN KEY (primary_address_id) REFERENCES customer_addresses(id);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_is_default ON customer_addresses(is_default);

CREATE INDEX IF NOT EXISTS idx_service_bookings_customer_id ON service_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_service_bookings_booking_date ON service_bookings(booking_date);

CREATE INDEX IF NOT EXISTS idx_customer_documents_customer_id ON customer_documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_documents_document_type ON customer_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_customer_documents_upload_date ON customer_documents(upload_date);
CREATE INDEX IF NOT EXISTS idx_customer_documents_is_verified ON customer_documents(is_verified);

CREATE INDEX IF NOT EXISTS idx_consolidation_requests_customer_id ON consolidation_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_consolidation_requests_status ON consolidation_requests(status);

CREATE INDEX IF NOT EXISTS idx_consolidation_items_consolidation_id ON consolidation_items(consolidation_id);
CREATE INDEX IF NOT EXISTS idx_consolidation_items_shipment_id ON consolidation_items(shipment_id);
