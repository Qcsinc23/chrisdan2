-- Updated service_bookings table with proper foreign key constraints
CREATE TABLE service_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    pickup_address_id UUID,
    delivery_address_id UUID,
    special_instructions TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    estimated_cost DECIMAL(10,2),
    confirmation_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE service_bookings 
ADD CONSTRAINT fk_service_bookings_customer 
FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE;

ALTER TABLE service_bookings 
ADD CONSTRAINT fk_service_bookings_pickup_address 
FOREIGN KEY (pickup_address_id) REFERENCES customer_addresses(id);

ALTER TABLE service_bookings 
ADD CONSTRAINT fk_service_bookings_delivery_address 
FOREIGN KEY (delivery_address_id) REFERENCES customer_addresses(id);

-- Add indexes for better performance
CREATE INDEX idx_service_bookings_customer_id ON service_bookings(customer_id);
CREATE INDEX idx_service_bookings_status ON service_bookings(status);
CREATE INDEX idx_service_bookings_booking_date ON service_bookings(booking_date);
