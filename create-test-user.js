import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'https://yddnvrvlgzoqjuazryht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZG52cnZsZ3pvcWp1YXpyeWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQyODYsImV4cCI6MjA2ODY3MDI4Nn0.YJq43VnHrb5vRtxpH_4a7nWI_ufMsW7WRUSBhWoqnIM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestUser() {
  try {
    // Create test user
    const { data, error } = await supabase.auth.signUp({
      email: 'testuser@gmail.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
          phone: '+1-234-567-8900'
        }
      }
    })

    if (error) {
      console.error('Error creating test user:', error)
      return
    }

    console.log('Test user created successfully:', data.user?.email)
    console.log('User ID:', data.user?.id)

    // If instant login (email confirmation disabled), also create customer account
    if (data.session) {
      console.log('User logged in automatically, creating customer account...')
      
      const { error: accountError } = await supabase.functions.invoke('manage-customer-account', {
        body: {
          action: 'create_account',
          accountData: {
            fullName: 'Test User',
            phone: '+1-234-567-8900',
            whatsappNotifications: true,
            emailNotifications: true,
            smsNotifications: false
          }
        }
      })

      if (accountError) {
        console.error('Error creating customer account:', accountError)
      } else {
        console.log('Customer account created successfully')
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createTestUser()
