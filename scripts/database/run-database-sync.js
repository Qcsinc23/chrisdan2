import { Client } from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Database connection
const connectionString = 'postgresql://postgres:[YOUR-PASSWORD]@db.yddnvrvlgzoqjuazryht.supabase.co:5432/postgres'

async function syncDatabase() {
  console.log('🔄 Starting database synchronization...')
  
  // Read the SQL file
  const sqlScript = readFileSync(join(__dirname, 'sync-database.sql'), 'utf8')
  
  // Create database client
  const client = new Client({
    connectionString: connectionString
  })
  
  try {
    // Connect to database
    console.log('📡 Connecting to database...')
    await client.connect()
    console.log('✅ Connected to database successfully')
    
    // Execute the sync script
    console.log('🏗️  Running database sync script...')
    const result = await client.query(sqlScript)
    console.log('✅ Database sync completed successfully')
    
    // Verify tables exist
    console.log('🔍 Verifying table structure...')
    const tableCheck = await client.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'customer_accounts', 
        'customer_addresses', 
        'staff_users', 
        'shipments', 
        'tracking_events',
        'service_bookings',
        'consolidation_requests'
      )
      ORDER BY table_name, ordinal_position;
    `)
    
    console.log(`📊 Found ${tableCheck.rows.length} columns across core tables`)
    
    // Check for storage buckets
    const bucketCheck = await client.query(`
      SELECT name FROM storage.buckets 
      WHERE name IN ('customer-documents', 'package-photos', 'delivery-signatures', 'chrisdan-assets')
    `)
    
    console.log(`🗄️  Found ${bucketCheck.rows.length} storage buckets configured`)
    
    // Check RLS policies
    const policyCheck = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies 
      WHERE schemaname = 'public'
      AND tablename IN ('customer_accounts', 'customer_addresses', 'shipments')
    `)
    
    console.log(`🔒 Found ${policyCheck.rows.length} RLS policies configured`)
    
    console.log('\n🎉 Database synchronization completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Test customer registration and login')
    console.log('2. Test address management (add/edit/delete)')
    console.log('3. Test staff dashboard functionality')
    console.log('4. Verify all edge functions work correctly')
    
  } catch (error) {
    console.error('❌ Database sync failed:', error)
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔧 Please update the connection string with your actual database password:')
      console.log('Replace [YOUR-PASSWORD] in the connection string with your Supabase database password')
    }
    
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run the sync
syncDatabase().catch(console.error)
