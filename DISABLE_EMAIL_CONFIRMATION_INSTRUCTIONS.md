# How to Disable Email Confirmation in Supabase

## Quick Setup Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `yddnvrvlgzoqjuazryht`

2. **Disable Email Confirmation**
   - Go to: **Authentication** → **Settings**
   - Find: **"Enable email confirmations"**
   - **Turn OFF** this toggle
   - Click **Save**

3. **Optional: Confirm Existing Users**
   - Go to: **Authentication** → **Users**
   - Find users: `testuser@gmail.com` and `testcustomer@chrisdan.com`
   - Click on each user → **Confirm user** if they show as unconfirmed

## Alternative Method (Using Service Role Key):

If you prefer to use the script approach:
1. Go to **Settings** → **API**
2. Copy the **service_role** key (keep it secret!)
3. Replace `YOUR_SERVICE_ROLE_KEY_HERE` in `confirm-test-users.js`
4. Run: `node confirm-test-users.js`

## Current Test Credentials:

**Customer Accounts:**
- Email: `testuser@gmail.com` | Password: `password123`
- Email: `testcustomer@chrisdan.com` | Password: `TestPass123!`

After disabling email confirmation, these users should be able to log in immediately.
