CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    frequent_shipper BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    total_shipments INTEGER DEFAULT 0
);