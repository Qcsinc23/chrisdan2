CREATE TABLE delivery_proof (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL,
    signature_data TEXT,
    signature_image_url TEXT,
    delivery_photo_url TEXT,
    recipient_name VARCHAR(255),
    delivery_notes TEXT,
    delivery_location TEXT,
    delivered_by UUID,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_code VARCHAR(50)
);