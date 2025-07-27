const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createCustomerAccount() {
  console.log('🚀 Creating customer account for existing user...')

  try {
    // Get the user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers()
    
    if (getUserError) {
      console.error('Error getting users:', getUserError)
      return
    }

    // Find the test user
    const testUser = users.find(user => user.email === 'trevor50020@gmail.com')
    
    if (!testUser) {
      console.error('Test user trevor50020@gmail.com not found')
      return
    }

    console.log('Found test user:', testUser.email, 'ID:', testUser.id)

    // Check if customer account already exists
    const { data: existingAccount, error: checkError } = await supabase
      .from('customer_accounts')
      .select('*')
      .eq('user_id', testUser.id)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing account:', checkError)
      return
    }

    if (existingAccount) {
      console.log('✅ Customer account already exists:', existingAccount)
      return
    }

    // Create customer account
    const { data: newAccount, error: createError } = await supabase
      .from('customer_accounts')
      .insert({
        user_id: testUser.id,
        full_name: testUser.user_metadata?.full_name || 'Trevor Test User',
        phone: testUser.user_metadata?.phone || '+1-555-0123',
        whatsapp_notifications: true,
        email_notifications: true,
        sms_notifications: false,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating customer account:', createError)
      return
    }

    console.log('✅ Customer account created successfully:', newAccount)
    console.log('🎉 User can now access the customer dashboard without issues!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createCustomerAccount()
