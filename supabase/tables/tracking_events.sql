CREATE TABLE tracking_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id),
    event_type VARCHAR(50) NOT NULL,
    event_description TEXT NOT NULL,
    location VARCHAR(255),
    staff_member VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW(),
    notes TEXT
);