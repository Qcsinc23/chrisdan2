#!/usr/bin/env node
// Fix super admin login by resetting password

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixSuperAdminLogin() {
  console.log('🔧 Fixing super admin login...')
  
  try {
    const email = 'sales@quietcraftsolutions.com'
    const newPassword = 'Brit4987*'
    
    // First, try to get the user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      return
    }
    
    const existingUser = users.find(user => user.email === email)
    
    if (!existingUser) {
      console.log('❌ Super admin user not found, creating new one...')
      
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: newPassword,
        email_confirm: true
      })
      
      if (createError) {
        console.error('❌ Error creating user:', createError.message)
        return
      }
      
      console.log('✅ Created new super admin user:', newUser.user.id)
      
      // Create staff record
      const { error: staffError } = await supabase
        .from('staff_users')
        .upsert({
          id: newUser.user.id,
          email: email,
          full_name: 'Super Admin',
          role: 'super_admin',
          is_active: true,
          approval_status: 'approved'
        })
      
      if (staffError) {
        console.error('❌ Error creating staff record:', staffError.message)
        return
      }
      
      console.log('✅ Created staff record')
      
    } else {
      console.log('✅ Found existing user:', existingUser.id)
      
      // Reset password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: newPassword,
          email_confirm: true
        }
      )
      
      if (updateError) {
        console.error('❌ Error updating password:', updateError.message)
        return
      }
      
      console.log('✅ Password reset successfully')
      
      // Update staff record
      const { error: staffError } = await supabase
        .from('staff_users')
        .upsert({
          id: existingUser.id,
          email: email,
          full_name: 'Super Admin',
          role: 'super_admin',
          is_active: true,
          approval_status: 'approved'
        })
      
      if (staffError) {
        console.error('❌ Error updating staff record:', staffError.message)
        return
      }
      
      console.log('✅ Staff record updated')
    }
    
    console.log('\n🎉 SUPER ADMIN LOGIN FIXED!')
    console.log('=================================')
    console.log(`Email: ${email}`)
    console.log(`Password: ${newPassword}`)
    console.log('Role: super_admin')
    console.log('Login URL: /staff/login')
    console.log('\nYou can now login to the staff portal!')
    
  } catch (error) {
    console.error('❌ Error fixing super admin login:', error.message)
  }
}

// Execute fix
if (require.main === module) {
  fixSuperAdminLogin().catch(console.error)
}

module.exports = { fixSuperAdminLogin }
