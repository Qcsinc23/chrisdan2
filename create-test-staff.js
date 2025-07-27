import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'https://yddnvrvlgzoqjuazryht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZG52cnZsZ3pvcWp1YXpyeWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQyODYsImV4cCI6MjA2ODY3MDI4Nn0.YJq43VnHrb5vRtxpH_4a7nWI_ufMsW7WRUSBhWoqnIM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestStaff() {
  try {
    const staffEmail = 'staff@chrisdan.com'
    const staffPassword = 'staff123'
    
    console.log('Creating test staff user...')
    
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: staffEmail,
      password: staffPassword,
      options: {
        data: {
          full_name: 'Test Staff Member'
        }
      }
    })

    if (error) {
      console.error('Error creating auth user:', error)
      return
    }

    console.log('Auth user created successfully:', data.user?.email)
    console.log('User ID:', data.user?.id)

    // Create staff record in staff_users table
    const { error: staffError } = await supabase
      .from('staff_users')
      .insert({
        email: staffEmail,
        full_name: 'Test Staff Member',
        role: 'admin',
        is_active: true
      })

    if (staffError) {
      console.error('Error creating staff record:', staffError)
      return
    }

    console.log('Staff record created successfully!')
    console.log('\n=== STAFF LOGIN CREDENTIALS ===')
    console.log('Email:', staffEmail)
    console.log('Password:', staffPassword)
    console.log('Role: admin')
    console.log('\nYou can now login at: /staff/login')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createTestStaff()
