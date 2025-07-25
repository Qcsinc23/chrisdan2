CREATE TABLE consolidation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    estimated_savings DECIMAL(10,2),
    total_packages INTEGER DEFAULT 0,
    total_weight DECIMAL(10,2),
    destination_country VARCHAR(100),
    special_instructions TEXT,
    consolidated_shipment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);