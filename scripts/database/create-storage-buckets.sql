-- Create Storage Buckets and Policies for Chrisdan Enterprises
-- Run this SQL in your Supabase Dashboard -> SQL Editor

-- Create the storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('customer-documents', 'customer-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'image/webp']),
  ('package-photos', 'package-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('delivery-signatures', 'delivery-signatures', false, 2097152, ARRAY['image/jpeg', 'image/png', 'image/svg+xml']),
  ('chrisdan-assets', 'chrisdan-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for customer-documents bucket
CREATE POLICY "Users can upload own documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'customer-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'customer-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Staff can view all documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'customer-documents' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Storage policies for package-photos bucket
CREATE POLICY "Staff can upload package photos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'package-photos' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Staff can view all package photos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'package-photos' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Customers can view own package photos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'package-photos' 
    AND EXISTS (
        SELECT 1 FROM shipments s
        JOIN customer_accounts ca ON s.customer_id = ca.id
        WHERE ca.user_id = auth.uid()
        AND s.tracking_number = (storage.foldername(name))[1]
    )
);

-- Storage policies for delivery-signatures bucket
CREATE POLICY "Staff can upload signatures" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'delivery-signatures' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Staff can view all signatures" ON storage.objects
FOR SELECT USING (
    bucket_id = 'delivery-signatures' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Customers can view own signatures" ON storage.objects
FOR SELECT USING (
    bucket_id = 'delivery-signatures' 
    AND EXISTS (
        SELECT 1 FROM shipments s
        JOIN customer_accounts ca ON s.customer_id = ca.id
        WHERE ca.user_id = auth.uid()
        AND s.tracking_number = (storage.foldername(name))[1]
    )
);

-- Storage policies for chrisdan-assets bucket (Public)
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'chrisdan-assets');

CREATE POLICY "Staff can upload assets" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'chrisdan-assets' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Verify bucket creation
SELECT 'Storage buckets created successfully' AS status;
SELECT id, name, public, file_size_limit FROM storage.buckets 
WHERE id IN ('customer-documents', 'package-photos', 'delivery-signatures', 'chrisdan-assets');
