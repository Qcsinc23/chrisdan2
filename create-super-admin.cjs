const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createSuperAdmin() {
  console.log('🚀 Creating super admin account...')

  try {
    const adminEmail = 'sales@quietcraftsolutions.com'
    const adminPassword = 'Brit4987*'

    // Check if user already exists
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers()
    
    if (getUserError) {
      console.error('Error getting users:', getUserError)
      return
    }

    let adminUser = users.find(user => user.email === adminEmail)

    if (!adminUser) {
      // Create auth user
      console.log('Creating auth user...')
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Super Admin',
          role: 'super_admin'
        }
      })

      if (error) {
        console.error('Error creating auth user:', error)
        return
      }

      adminUser = data.user
      console.log('✅ Auth user created successfully:', adminUser.email)
    } else {
      console.log('✅ Auth user already exists:', adminUser.email)
    }

    // Check if staff record exists
    const { data: existingStaff, error: checkError } = await supabase
      .from('staff_users')
      .select('*')
      .eq('email', adminEmail)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing staff:', checkError)
      return
    }

    if (!existingStaff) {
      // Create staff record
      console.log('Creating staff record...')
      const { data: newStaff, error: createError } = await supabase
        .from('staff_users')
        .insert({
          email: adminEmail,
          full_name: 'Super Admin',
          role: 'super_admin',
          is_active: true
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating staff record:', createError)
        return
      }

      console.log('✅ Staff record created successfully:', newStaff)
    } else {
      // Update existing staff record to super_admin
      console.log('Updating existing staff record to super_admin...')
      const { data: updatedStaff, error: updateError } = await supabase
        .from('staff_users')
        .update({
          role: 'super_admin',
          is_active: true
        })
        .eq('email', adminEmail)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating staff record:', updateError)
        return
      }

      console.log('✅ Staff record updated successfully:', updatedStaff)
    }

    console.log('\n🎉 SUPER ADMIN ACCOUNT READY!')
    console.log('=================================')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('Role: super_admin')
    console.log('Login URL: /staff/login')
    console.log('\nYou can now login to the staff portal!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createSuperAdmin()
