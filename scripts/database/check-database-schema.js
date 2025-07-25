import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://yddnvrvlgzoqjuazryht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZG52cnZsZ3pvcWp1YXpyeWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQyODYsImV4cCI6MjA2ODY3MDI4Nn0.YJq43VnHrb5vRtxpH_4a7nWI_ufMsW7WRUSBhWoqnIM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Expected tables for our application
const expectedTables = [
    'customer_accounts',
    'customer_addresses', 
    'staff_users',
    'shipments',
    'tracking_events',
    'service_bookings',
    'customer_documents',
    'package_photos',
    'delivery_proof',
    'scan_logs',
    'consolidation_requests',
    'consolidation_items',
    'chat_messages',
    'notification_logs'
]

// Expected storage buckets
const expectedBuckets = [
    'customer-documents',
    'package-photos',
    'delivery-signatures',
    'chrisdan-assets'
]

async function checkDatabaseSchema() {
    console.log('🔍 Checking Supabase database schema...\n')
    
    try {
        // Check existing tables
        console.log('📊 Checking tables...')
        const existingTables = []
        const missingTables = []
        
        for (const tableName of expectedTables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1)
                
                if (error) {
                    if (error.message.includes('does not exist') || error.message.includes('relation') || error.code === 'PGRST116') {
                        missingTables.push(tableName)
                        console.log(`❌ ${tableName} - NOT FOUND`)
                    } else {
                        console.log(`⚠️  ${tableName} - ERROR: ${error.message}`)
                    }
                } else {
                    existingTables.push(tableName)
                    console.log(`✅ ${tableName} - EXISTS`)
                }
            } catch (err) {
                missingTables.push(tableName)
                console.log(`❌ ${tableName} - ERROR: ${err.message}`)
            }
        }
        
        console.log(`\n📈 Tables Summary:`)
        console.log(`✅ Found: ${existingTables.length}/${expectedTables.length}`)
        console.log(`❌ Missing: ${missingTables.length}`)
        
        if (missingTables.length > 0) {
            console.log(`\n🚨 Missing Tables:`)
            missingTables.forEach(table => console.log(`   - ${table}`))
        }
        
        // Check storage buckets
        console.log('\n🗄️  Checking storage buckets...')
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
        
        if (bucketsError) {
            console.log(`❌ Error checking buckets: ${bucketsError.message}`)
        } else {
            const existingBucketNames = buckets.map(b => b.name)
            const missingBuckets = expectedBuckets.filter(bucket => !existingBucketNames.includes(bucket))
            
            expectedBuckets.forEach(bucket => {
                if (existingBucketNames.includes(bucket)) {
                    console.log(`✅ ${bucket} - EXISTS`)
                } else {
                    console.log(`❌ ${bucket} - NOT FOUND`)
                }
            })
            
            console.log(`\n🗄️  Buckets Summary:`)
            console.log(`✅ Found: ${expectedBuckets.length - missingBuckets.length}/${expectedBuckets.length}`)
            console.log(`❌ Missing: ${missingBuckets.length}`)
        }
        
        // Check for any existing data
        console.log('\n📋 Checking existing data...')
        
        if (existingTables.includes('customer_accounts')) {
            const { data: customers, error } = await supabase
                .from('customer_accounts')
                .select('id, full_name, created_at')
                .limit(5)
            
            if (!error && customers) {
                console.log(`👥 Customer accounts: ${customers.length} found`)
                if (customers.length > 0) {
                    console.log(`   Latest: ${customers[0]?.full_name || 'Unknown'} (${customers[0]?.created_at || 'No date'})`)
                }
            }
        }
        
        if (existingTables.includes('shipments')) {
            const { data: shipments, error } = await supabase
                .from('shipments')
                .select('id, tracking_number, current_status')
                .limit(5)
            
            if (!error && shipments) {
                console.log(`📦 Shipments: ${shipments.length} found`)
            }
        }
        
        if (existingTables.includes('customer_addresses')) {
            const { data: addresses, error } = await supabase
                .from('customer_addresses')
                .select('id, country, is_default')
                .limit(5)
            
            if (!error && addresses) {
                console.log(`📍 Customer addresses: ${addresses.length} found`)
            }
        }
        
        // Generate migration recommendations
        console.log('\n🔧 Migration Recommendations:')
        
        if (missingTables.length > 0 || (buckets && expectedBuckets.length - buckets.filter(b => expectedBuckets.includes(b.name)).length > 0)) {
            console.log('\n⚠️  MIGRATIONS NEEDED:')
            console.log('1. Run the database synchronization script:')
            console.log('   node scripts/database/run-database-sync.js')
            console.log('\n2. This will create:')
            if (missingTables.length > 0) {
                console.log('   - Missing database tables')
                console.log('   - Row Level Security policies')
                console.log('   - Database indexes and triggers')
            }
            if (buckets && expectedBuckets.some(bucket => !buckets.find(b => b.name === bucket))) {
                console.log('   - Missing storage buckets')
                console.log('   - Storage access policies')
            }
            console.log('\n3. Test the application functionality after migration')
        } else {
            console.log('✅ No migrations needed - database schema appears complete')
            console.log('💡 You can still run the sync script to ensure all policies and indexes are up to date')
        }
        
        console.log('\n🎯 Next Steps:')
        console.log('1. Update scripts/database/run-database-sync.js with your database password')
        console.log('2. Run: node scripts/database/run-database-sync.js')
        console.log('3. Test customer dashboard address functionality')
        console.log('4. Verify edge functions are working correctly')
        
    } catch (error) {
        console.error('❌ Database check failed:', error)
        console.log('\n🔧 Troubleshooting:')
        console.log('1. Verify your Supabase project is active')
        console.log('2. Check that the anon key has proper permissions')
        console.log('3. Ensure your project URL is correct')
    }
}

// Run the check
checkDatabaseSchema()
