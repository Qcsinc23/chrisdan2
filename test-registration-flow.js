import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'https://yddnvrvlgzoqjuazryht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZG52cnZsZ3pvcWp1YXpyeWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQyODYsImV4cCI6MjA2ODY3MDI4Nn0.YJq43VnHrb5vRtxpH_4a7nWI_ufMsW7WRUSBhWoqnIM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRegistrationFlow() {
  try {
    const testEmail = 'newuser@example.com'
    const testPassword = 'TestPassword123!'
    
    console.log('🧪 Testing Registration Flow...')
    console.log('Email:', testEmail)
    console.log('Password:', testPassword)
    
    // First, clean up any existing user
    try {
      const { data: existingUser } = await supabase
        .from('customer_accounts')
        .select('user_id')
        .eq('email', testEmail)
        .single()
      
      if (existingUser) {
        console.log('🧹 Cleaning up existing test user...')
        await supabase
          .from('customer_accounts')
          .delete()
          .eq('email', testEmail)
      }
    } catch (error) {
      // User doesn't exist, which is fine
    }

    // Test registration
    console.log('\n📝 Step 1: Creating new user account...')
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test Registration User',
          phone: '+1-555-123-4567'
        }
      }
    })

    if (error) {
      console.error('❌ Registration failed:', error)
      return
    }

    console.log('✅ User created successfully!')
    console.log('User ID:', data.user?.id)
    console.log('Email:', data.user?.email)
    console.log('Session created:', !!data.session)

    if (data.session) {
      console.log('\n📝 Step 2: Creating customer account...')
      
      // Simulate the automatic customer account creation
      const { error: accountError } = await supabase.functions.invoke('manage-customer-account', {
        body: {
          action: 'create_account',
          accountData: {
            fullName: 'Test Registration User',
            phone: '+1-555-123-4567',
            whatsappNotifications: true,
            emailNotifications: true,
            smsNotifications: false
          }
        }
      })

      if (accountError) {
        console.error('❌ Customer account creation failed:', accountError)
      } else {
        console.log('✅ Customer account created successfully!')
      }

      // Verify customer account exists
      console.log('\n📝 Step 3: Verifying customer account...')
      const { data: customerAccount, error: fetchError } = await supabase
        .from('customer_accounts')
        .select('*')
        .eq('user_id', data.user.id)
        .single()

      if (fetchError) {
        console.error('❌ Failed to fetch customer account:', fetchError)
      } else {
        console.log('✅ Customer account verified!')
        console.log('Account ID:', customerAccount.id)
        console.log('Full Name:', customerAccount.full_name)
        console.log('Phone:', customerAccount.phone)
      }

      // Test sign out
      console.log('\n📝 Step 4: Testing sign out...')
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        console.error('❌ Sign out failed:', signOutError)
      } else {
        console.log('✅ Sign out successful!')
      }
    }

    console.log('\n🎉 Registration flow test completed!')
    console.log('\n=== TEST CREDENTIALS ===')
    console.log('Email:', testEmail)
    console.log('Password:', testPassword)
    console.log('You can now test login on the website!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testRegistrationFlow()
