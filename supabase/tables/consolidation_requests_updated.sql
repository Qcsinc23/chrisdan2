-- Updated consolidation_requests table to match component expectations
CREATE TABLE consolidation_requests (
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

-- Add foreign key constraint to customer_accounts
ALTER TABLE consolidation_requests 
ADD CONSTRAINT fk_consolidation_customer 
FOREIGN KEY (customer_id) REFERENCES customer_accounts(id);

-- Add index for better performance
CREATE INDEX idx_consolidation_requests_customer_id ON consolidation_requests(customer_id);
CREATE INDEX idx_consolidation_requests_status ON consolidation_requests(status);
