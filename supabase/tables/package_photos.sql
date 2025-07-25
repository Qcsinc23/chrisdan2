CREATE TABLE package_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL,
    photo_type VARCHAR(50) NOT NULL,
    photo_url TEXT NOT NULL,
    caption TEXT,
    taken_by UUID,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_size INTEGER,
    mime_type VARCHAR(100)
);