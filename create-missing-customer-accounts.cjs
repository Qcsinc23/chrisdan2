const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingCustomerAccounts() {
  try {
    // Get all auth users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.error('Error getting users:', usersError);
      return;
    }
    
    // Get existing customer accounts
    const { data: customers, error: customersError } = await supabase
      .from('customer_accounts')
      .select('user_id');
    
    if (customersError) {
      console.error('Error getting customers:', customersError);
      return;
    }
    
    const existingCustomerUserIds = new Set(customers?.map(c => c.user_id) || []);
    
    // Find users without customer accounts
    const usersWithoutAccounts = users?.filter(user => !existingCustomerUserIds.has(user.id)) || [];
    
    console.log('Users without customer accounts:', usersWithoutAccounts.length);
    
    // Create customer accounts for users who don't have them
    for (const user of usersWithoutAccounts) {
      console.log('Creating customer account for:', user.email);
      
      const { data, error } = await supabase
        .from('customer_accounts')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
          phone: user.user_metadata?.phone || '',
          whatsapp_notifications: true,
          email_notifications: true,
          sms_notifications: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating customer account for', user.email, ':', error);
      } else {
        console.log('✅ Created customer account for', user.email);
      }
    }
    
    console.log('\nDone! Created customer accounts for', usersWithoutAccounts.length, 'users');
  } catch (error) {
    console.error('Error:', error);
  }
}

createMissingCustomerAccounts();
