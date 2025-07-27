// Simple test to verify customer registration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yddnvrvlgzoqjuazryht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZG52cnZsZ3pvcWp1YXpyeWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQyODYsImV4cCI6MjA2ODY3MDI4Nn0.YJq43VnHrb5vRtxpH_4a7nWI_ufMsW7WRUSBhWoqnIM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRegistration() {
  console.log('Testing customer registration...')
  console.log('Supabase URL:', supabaseUrl)
  
  const { data, error } = await supabase.auth.signUp({
    email: 'testcustomer@chrisdan.com',
    password: 'TestPass123!',
    options: {
      data: {
        full_name: 'Test Customer',
        phone: '(555) 123-4567'
      }
    }
  })
  
  if (error) {
    console.error('Registration error:', error.message)
    console.error('Error details:', error)
  } else {
    console.log('✅ Registration successful!')
    console.log('User ID:', data.user?.id)
    console.log('Email:', data.user?.email)
    console.log('Email confirmation required:', !data.session)
    console.log('Please check your email for confirmation link')
  }
}

testRegistration()
