CREATE TABLE consolidation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consolidation_id UUID REFERENCES consolidation_requests(id),
    tracking_number VARCHAR(255) NOT NULL,
    package_description TEXT,
    weight_lbs DECIMAL(10,2),
    dimensions VARCHAR(100),
    added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);