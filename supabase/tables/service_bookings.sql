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