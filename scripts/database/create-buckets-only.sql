-- Create Storage Buckets ONLY for Chrisdan Enterprises
-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- This creates just the buckets without policies to avoid schema conflicts

-- Create the storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('customer-documents', 'customer-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'image/webp']),
  ('package-photos', 'package-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('delivery-signatures', 'delivery-signatures', false, 2097152, ARRAY['image/jpeg', 'image/png', 'image/svg+xml']),
  ('chrisdan-assets', 'chrisdan-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Verify bucket creation
SELECT 'Storage buckets created successfully!' AS status;
SELECT id, name, public, file_size_limit FROM storage.buckets 
WHERE id IN ('customer-documents', 'package-photos', 'delivery-signatures', 'chrisdan-assets');
