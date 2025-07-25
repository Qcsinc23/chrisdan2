# Complete Migration Instructions for Chrisdan Enterprises

## Current Status Summary
✅ **All database tables exist and are working**  
✅ **Edge function errors have been fixed**  
❌ **Storage buckets need to be created**

## Quick Migration Steps

### Option 1: SQL Script (Recommended - Fastest)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your Chrisdan Enterprises project

2. **Run the SQL Script**
   - Go to **SQL Editor** in the left sidebar
   - Click **"New query"**
   - Copy the entire contents of `create-storage-buckets.sql`
   - Paste it into the SQL editor
   - Click **"Run"** button

3. **Verify Results**
   - You should see "Storage buckets created successfully" 
   - Check **Storage** section to confirm all 4 buckets exist

### Option 2: Manual Creation (If SQL fails)

Follow the detailed instructions in `SUPABASE_MIGRATION_GUIDE.md`

## Verification

After completing the migration, run this command to verify:

```bash
cd chrisdan2
node check-database-schema.js
```

Expected output:
```
✅ Found: 14/14 tables
✅ Found: 4/4 storage buckets
```

## What Gets Created

### 4 Storage Buckets:
1. **customer-documents** (Private, 10MB, PDF/Images)
2. **package-photos** (Private, 5MB, Images only)
3. **delivery-signatures** (Private, 2MB, Images/SVG)
4. **chrisdan-assets** (Public, 5MB, Images/SVG)

### Security Policies:
- Users can only access their own documents
- Staff can access all files for business purposes
- Customers can view photos of their packages
- Public assets are accessible to everyone

## Expected Results

After migration:

### ✅ Fixed Issues:
1. **Address saving works** - No more "Edge Function returned a non-2xx status code"
2. **File uploads enabled** - Document and photo management functional
3. **Customer dashboard fully operational** - All features working
4. **Staff dashboard enhanced** - Full document access
5. **Proper security** - RLS policies protect customer data

### 🎯 Test These Features:
- Customer registration and login
- Adding/editing customer addresses
- Uploading customer documents
- Package photo viewing
- Staff document management

## Migration Complete Checklist

- [ ] Ran SQL script in Supabase Dashboard
- [ ] Verified 4 storage buckets created
- [ ] Ran `node check-database-schema.js` successfully  
- [ ] Tested address saving in customer dashboard
- [ ] Confirmed no edge function errors
- [ ] Verified file upload functionality

## Troubleshooting

### If SQL script fails:
1. Check you're in the correct Supabase project
2. Ensure you have admin permissions
3. Try running each section separately
4. Fall back to manual bucket creation

### If address saving still fails:
1. Check browser console for errors
2. Verify edge functions are deployed
3. Confirm database tables exist
4. Test with a fresh browser session

### If file uploads don't work:
1. Verify storage buckets exist
2. Check storage policies are applied
3. Test with allowed file types only
4. Confirm user authentication is working

## Support

If you encounter any issues:
1. Check Supabase project logs
2. Verify all buckets appear in Storage section
3. Confirm policies exist in Storage → Policies
4. Test with a simple file upload in dashboard first

---

**The migration should take less than 5 minutes to complete using the SQL script method.**
