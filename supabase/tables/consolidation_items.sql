CREATE TABLE consolidation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consolidation_request_id UUID NOT NULL,
    shipment_id UUID NOT NULL,
    package_description TEXT,
    weight_lbs DECIMAL(8,2),
    dimensions VARCHAR(100),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);