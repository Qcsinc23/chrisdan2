CREATE TABLE consolidation_requests (
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