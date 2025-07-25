# Database Synchronization Guide

This guide helps you synchronize your Supabase database with all application components and resolve the address saving issue.

## Issues Resolved

### 1. Address Saving Error Fix
**Problem:** "Edge Function returned a non-2xx status code" when saving customer addresses.

**Root Cause:** The `manage-customer-account` edge function was attempting to update the database with invalid field names that don't exist in the `customer_addresses` table schema.

**Solution:** Updated the edge function to properly map form fields to database columns:

```javascript
// ❌ Before (invalid fields included)
body: JSON.stringify({
    ...accountData,  // This spread included customerId, addressId, etc.
    updated_at: new Date().toISOString()
})

// ✅ After (explicit field mapping)
body: JSON.stringify({
    address_type: accountData.addressType,
    street_address: accountData.streetAddress,
    city: accountData.city,
    state_province: accountData.stateProvince,
    postal_code: accountData.postalCode,
    country: accountData.country,
    is_default: accountData.isDefault,
    updated_at: new Date().toISOString()
})
```

## Database Synchronization

### Prerequisites
1. Your Supabase database password
2. Node.js and npm installed
3. PostgreSQL client access

### Files Created
- `sync-database.sql` - Comprehensive database schema with all tables, indexes, policies
- `scripts/database/run-database-sync.js` - Script to execute the synchronization

### Step 1: Update Database Connection
Edit `scripts/database/run-database-sync.js` and replace `[YOUR-PASSWORD]` with your actual Supabase database password:

```javascript
const connectionString = 'postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.yddnvrvlgzoqjuazryht.supabase.co:5432/postgres'
```

### Step 2: Run Database Synchronization
```bash
cd chrisdan2
node scripts/database/run-database-sync.js
```

### Step 3: Verify Synchronization
The script will:
- ✅ Create all necessary tables with proper schemas
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create indexes for performance optimization
- ✅ Configure storage buckets for file uploads
- ✅ Add database functions and triggers
- ✅ Verify all components are working

## Database Schema Overview

### Core Tables
1. **customer_accounts** - Enhanced customer profiles
2. **customer_addresses** - Customer shipping/billing addresses
3. **staff_users** - Staff member accounts
4. **shipments** - Package tracking information
5. **tracking_events** - Shipment status updates
6. **service_bookings** - Customer service requests

### Supporting Tables
- **customer_documents** - File uploads
- **package_photos** - Shipment images
- **delivery_proof** - Delivery confirmations
- **consolidation_requests** - Package consolidation
- **chat_messages** - Customer support chat
- **notification_logs** - Communication tracking

### Storage Buckets
- **customer-documents** - Customer file uploads
- **package-photos** - Package images
- **delivery-signatures** - Delivery signatures
- **chrisdan-assets** - Public website assets

## Security Features

### Row Level Security (RLS)
- ✅ Customers can only access their own data
- ✅ Staff can access all data when authenticated
- ✅ Proper isolation between customer accounts
- ✅ Secure file upload policies

### Data Relationships
- ✅ Foreign key constraints ensure data integrity
- ✅ Cascade deletes for data cleanup
- ✅ Unique constraints prevent duplicates
- ✅ Proper indexing for performance

## Testing the Fix

### 1. Test Customer Address Management
1. Log in to customer dashboard: `http://localhost:5174/customer/login`
2. Use credentials: `testuser@gmail.com` / `password123`
3. Navigate to address management
4. Try adding a new address
5. Try editing an existing address
6. Verify no "Edge Function returned a non-2xx status code" errors

### 2. Test Staff Dashboard
1. Create a staff user using `scripts/setup/create-test-staff.js`
2. Log in to staff dashboard
3. Verify all shipment and customer data displays correctly

### 3. Test Edge Functions
All edge functions should now work with the synchronized database:
- ✅ `manage-customer-account` - Customer profile and address management
- ✅ `track-shipment` - Package tracking
- ✅ `update-tracking-status` - Status updates
- ✅ `service-booking-system` - Service requests

## Troubleshooting

### Database Connection Issues
If you see password authentication errors:
1. Verify your Supabase project URL
2. Check your database password in Supabase settings
3. Ensure your IP is whitelisted in network access

### RLS Policy Issues
If you encounter permission errors:
1. Verify RLS policies are created correctly
2. Check that users have proper authentication tokens
3. Ensure customer accounts exist for authenticated users

### Edge Function Errors
If edge functions still fail:
1. Check Supabase function logs
2. Verify database table schemas match function expectations
3. Ensure all referenced tables exist

## Maintenance

### Regular Tasks
1. Monitor database performance using the created indexes
2. Backup important data regularly
3. Review RLS policies for security
4. Update storage bucket policies as needed

### Schema Updates
When adding new features:
1. Update `sync-database.sql` with new tables/columns
2. Run the sync script to apply changes
3. Update edge functions to use new schema
4. Test all functionality thoroughly

## Support

If you encounter any issues:
1. Check the database sync script output for errors
2. Verify all prerequisites are met
3. Ensure your Supabase project is properly configured
4. Review the application logs for additional context

---

**Note:** This synchronization script is idempotent - you can run it multiple times safely. It will only create missing components and won't affect existing data.
