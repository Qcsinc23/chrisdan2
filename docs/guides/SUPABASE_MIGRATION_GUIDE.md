# Supabase Migration Guide

## Current Status
✅ **Database Tables**: All 14 required tables are present and working
❌ **Storage Buckets**: 4 buckets need to be created manually

## Required Storage Buckets

### 1. Create Storage Buckets

Go to your Supabase Dashboard → Storage and create these buckets manually:

#### Bucket 1: `customer-documents`
- **Public**: No (Private)
- **File size limit**: 10 MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `application/pdf`, `image/webp`
- **Purpose**: Customer ID documents, invoices, receipts

#### Bucket 2: `package-photos`
- **Public**: No (Private) 
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`
- **Purpose**: Photos of packages for tracking

#### Bucket 3: `delivery-signatures`
- **Public**: No (Private)
- **File size limit**: 2 MB  
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/svg+xml`
- **Purpose**: Digital signatures for deliveries

#### Bucket 4: `chrisdan-assets`
- **Public**: Yes (Public)
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`
- **Purpose**: Company logos, public images

### 2. Set Up Row Level Security Policies

After creating the buckets, go to **Storage → Policies** and create these policies:

#### For `customer-documents` bucket:
```sql
-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload own documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'customer-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own documents
CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'customer-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow staff to view all documents
CREATE POLICY "Staff can view all documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'customer-documents' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);
```

#### For `package-photos` bucket:
```sql
-- Allow staff to upload package photos
CREATE POLICY "Staff can upload package photos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'package-photos' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Allow staff to view all package photos
CREATE POLICY "Staff can view all package photos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'package-photos' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Allow customers to view photos of their packages
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
```

#### For `delivery-signatures` bucket:
```sql
-- Allow staff to upload delivery signatures
CREATE POLICY "Staff can upload signatures" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'delivery-signatures' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Allow staff to view all signatures
CREATE POLICY "Staff can view all signatures" ON storage.objects
FOR SELECT USING (
    bucket_id = 'delivery-signatures' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Allow customers to view their delivery signatures
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
```

#### For `chrisdan-assets` bucket (Public):
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'chrisdan-assets');

-- Allow staff to upload company assets
CREATE POLICY "Staff can upload assets" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'chrisdan-assets' 
    AND EXISTS (
        SELECT 1 FROM staff_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);
```

## Step-by-Step Instructions

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your Chrisdan Enterprises project
3. Navigate to **Storage** in the left sidebar

### Step 2: Create Buckets
1. Click **"New bucket"**
2. Enter bucket name exactly as specified above
3. Configure settings (public/private, file limits, MIME types)
4. Click **"Create bucket"**
5. Repeat for all 4 buckets

### Step 3: Set Up Policies
1. Go to **Storage → Policies**
2. Click **"New policy"** 
3. Choose **"For full customization"**
4. Copy and paste the SQL policies above
5. Click **"Create policy"**
6. Repeat for each bucket

### Step 4: Verify Setup
Run the verification script to confirm everything is working:

```bash
cd chrisdan2
node check-database-schema.js
```

You should see:
- ✅ All 14 tables found
- ✅ All 4 storage buckets found

## Troubleshooting

### If bucket creation fails:
1. Check project permissions in Supabase dashboard
2. Ensure you're using the correct project
3. Try refreshing the dashboard and retrying

### If policies fail:
1. Verify table names match your schema
2. Check that `staff_users` and `customer_accounts` tables exist
3. Ensure policy names don't conflict with existing ones

### If file uploads still fail:
1. Check bucket policies in Storage → Policies
2. Verify MIME types are correctly configured
3. Test with a simple file upload in the dashboard

## Expected Results

After completing this migration:

1. **Address Management**: Customer dashboard address saving will work without "Edge Function returned a non-2xx status code" errors
2. **File Uploads**: All document and photo upload features will function
3. **Staff Dashboard**: Will have access to customer documents and package photos
4. **Security**: Proper RLS policies will protect customer data

## Contact Information

If you encounter issues:
1. Check the Supabase project logs (Dashboard → Logs)
2. Verify all bucket names match exactly (case-sensitive)
3. Confirm your user has admin access to the project

## Migration Complete Checklist

- [ ] Created `customer-documents` bucket with correct settings
- [ ] Created `package-photos` bucket with correct settings  
- [ ] Created `delivery-signatures` bucket with correct settings
- [ ] Created `chrisdan-assets` bucket with correct settings
- [ ] Applied all RLS policies for customer-documents
- [ ] Applied all RLS policies for package-photos
- [ ] Applied all RLS policies for delivery-signatures
- [ ] Applied all RLS policies for chrisdan-assets
- [ ] Ran verification script successfully
- [ ] Tested address saving functionality
- [ ] Tested file upload functionality

Once all items are checked, your Supabase project will be fully configured for the Chrisdan Enterprises application!
