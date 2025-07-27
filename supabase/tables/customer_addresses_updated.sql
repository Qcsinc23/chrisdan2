-- Updated customer_addresses table with proper foreign key constraints
CREATE TABLE customer_addresses (
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

-- Add foreign key constraint to customer_accounts
ALTER TABLE customer_addresses 
ADD CONSTRAINT fk_customer_addresses_customer 
FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_is_default ON customer_addresses(is_default);
