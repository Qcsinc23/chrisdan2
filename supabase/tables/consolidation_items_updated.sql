-- Updated consolidation_items table to match component expectations
CREATE TABLE consolidation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consolidation_id UUID REFERENCES consolidation_requests(id) ON DELETE CASCADE,
    shipment_id UUID,
    tracking_number VARCHAR(255) NOT NULL,
    package_description TEXT,
    weight_lbs DECIMAL(10,2),
    dimensions VARCHAR(100),
    added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to shipments table
ALTER TABLE consolidation_items 
ADD CONSTRAINT fk_consolidation_items_shipment 
FOREIGN KEY (shipment_id) REFERENCES shipments(id);

-- Add index for better performance
CREATE INDEX idx_consolidation_items_consolidation_id ON consolidation_items(consolidation_id);
CREATE INDEX idx_consolidation_items_shipment_id ON consolidation_items(shipment_id);
