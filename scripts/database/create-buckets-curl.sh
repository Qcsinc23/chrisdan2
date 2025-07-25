#!/bin/bash

# Create Storage Buckets via Supabase REST API
# Note: This requires the service role key (not anon key) to work

SUPABASE_URL="https://yddnvrvlgzoqjuazryht.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZG52cnZsZ3pvcWp1YXpyeWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQyODYsImV4cCI6MjA2ODY3MDI4Nn0.YJq43VnHrb5vRtxpH_4a7nWI_ufMsW7WRUSBhWoqnIM"

echo "🗄️  Attempting to create storage buckets via REST API..."
echo ""

# Try creating customer-documents bucket
echo "📁 Creating customer-documents bucket..."
curl -X POST "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "customer-documents",
    "name": "customer-documents",
    "public": false,
    "file_size_limit": 10485760,
    "allowed_mime_types": ["image/jpeg", "image/png", "application/pdf", "image/webp"]
  }'
echo ""

# Try creating package-photos bucket
echo "📁 Creating package-photos bucket..."
curl -X POST "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "package-photos",
    "name": "package-photos", 
    "public": false,
    "file_size_limit": 5242880,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
  }'
echo ""

# Try creating delivery-signatures bucket
echo "📁 Creating delivery-signatures bucket..."
curl -X POST "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "delivery-signatures",
    "name": "delivery-signatures",
    "public": false, 
    "file_size_limit": 2097152,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/svg+xml"]
  }'
echo ""

# Try creating chrisdan-assets bucket (public)
echo "📁 Creating chrisdan-assets bucket..."
curl -X POST "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "chrisdan-assets",
    "name": "chrisdan-assets",
    "public": true,
    "file_size_limit": 5242880,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
  }'
echo ""

echo "✅ Bucket creation attempts completed"
echo "⚠️  Note: You may see 'Unauthorized' errors - this is expected with anon key"
echo "💡 For successful creation, use the SQL script method in Supabase Dashboard"
