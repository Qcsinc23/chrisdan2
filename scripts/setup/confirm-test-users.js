import { createClient } from '@supabase/supabase-js'

// You'll need to get the service role key from your Supabase dashboard
// Go to Settings > API > service_role key (keep this secret!)
const supabaseUrl = 'https://yddnvrvlgzoqjuazryht.supabase.co'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE' // Replace with actual service role key

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function confirmTestUsers() {
  console.log('Attempting to confirm test users...')
  
  const testUsers = [
    'testuser@gmail.com',
    'testcustomer@chrisdan.com'
  ]
  
  for (const email of testUsers) {
    try {
      // Get user by email
      const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (fetchError) {
        console.error(`Error fetching users: ${fetchError.message}`)
        continue
      }
      
      const user = users.users.find(u => u.email === email)
      
      if (user) {
        // Manually confirm the user's email
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email_confirm: true
        })
        
        if (error) {
          console.error(`Error confirming user ${email}:`, error.message)
        } else {
          console.log(`✅ Successfully confirmed user: ${email}`)
        }
      } else {
        console.log(`❌ User not found: ${email}`)
      }
    } catch (error) {
      console.error(`Unexpected error for ${email}:`, error.message)
    }
  }
}

// Alternative: Create new users with email confirmation disabled
async function createUsersWithoutConfirmation() {
  console.log('Creating test users without email confirmation...')
  
  const testUsers = [
    {
      email: 'test.user@example.com',
      password: 'TestPass123!',
      user_metadata: {
        full_name: 'Test User',
        phone: '+1-234-567-8900'
      }
    },
    {
      email: 'test.customer@example.com', 
      password: 'CustomerPass123!',
      user_metadata: {
        full_name: 'Test Customer',
        phone: '+1-234-567-8901'
      }
    }
  ]
  
  for (const userData of testUsers) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: true // This bypasses email confirmation
      })
      
      if (error) {
        console.error(`Error creating user ${userData.email}:`, error.message)
      } else {
        console.log(`✅ Created and confirmed user: ${userData.email}`)
        console.log(`   Password: ${userData.password}`)
      }
    } catch (error) {
      console.error(`Unexpected error creating ${userData.email}:`, error.message)
    }
  }
}

async function main() {
  if (supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.log('❌ Please replace YOUR_SERVICE_ROLE_KEY_HERE with your actual service role key')
    console.log('You can find this in your Supabase dashboard: Settings > API > service_role key')
    console.log('\nAlternatively, you can disable email confirmation in Supabase dashboard:')
    console.log('1. Go to Authentication > Settings')
    console.log('2. Disable "Enable email confirmations"')
    console.log('3. Then existing users can log in without email verification')
    return
  }
  
  await confirmTestUsers()
  await createUsersWithoutConfirmation()
}

main()
