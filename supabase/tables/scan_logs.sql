CREATE TABLE scan_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id),
    barcode VARCHAR(255) NOT NULL,
    scan_type VARCHAR(50) NOT NULL,
    scanned_by VARCHAR(255) NOT NULL,
    scan_timestamp TIMESTAMP DEFAULT NOW(),
    device_info TEXT,
    location VARCHAR(255)
);