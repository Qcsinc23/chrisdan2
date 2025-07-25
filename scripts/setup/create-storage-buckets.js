import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://yddnvrvlgzoqjuazryht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZG52cnZsZ3pvcWp1YXpyeWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQyODYsImV4cCI6MjA2ODY3MDI4Nn0.YJq43VnHrb5vRtxpH_4a7nWI_ufMsW7WRUSBhWoqnIM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Required storage buckets configuration
const bucketsToCreate = [
    {
        name: 'customer-documents',
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
    },
    {
        name: 'package-photos',
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
    },
    {
        name: 'delivery-signatures',
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
        fileSizeLimit: 2097152 // 2MB
    },
    {
        name: 'chrisdan-assets',
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 5242880 // 5MB
    }
]

async function createStorageBuckets() {
    console.log('🗄️  Creating Supabase storage buckets...\n')
    
    try {
        // Check existing buckets first
        const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
        
        if (listError) {
            console.error('❌ Error listing buckets:', listError.message)
            return
        }
        
        const existingBucketNames = existingBuckets.map(b => b.name)
        console.log('📋 Existing buckets:', existingBucketNames.length > 0 ? existingBucketNames.join(', ') : 'None')
        
        let bucketsCreated = 0
        let bucketsSkipped = 0
        
        for (const bucketConfig of bucketsToCreate) {
            const { name, public: isPublic, allowedMimeTypes, fileSizeLimit } = bucketConfig
            
            if (existingBucketNames.includes(name)) {
                console.log(`⏭️  ${name} - Already exists, skipping`)
                bucketsSkipped++
                continue
            }
            
            console.log(`🔨 Creating bucket: ${name}...`)
            
            // Create the bucket
            const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(name, {
                public: isPublic,
                allowedMimeTypes,
                fileSizeLimit
            })
            
            if (bucketError) {
                if (bucketError.message.includes('already exists')) {
                    console.log(`⏭️  ${name} - Already exists`)
                    bucketsSkipped++
                } else {
                    console.error(`❌ ${name} - Error: ${bucketError.message}`)
                }
                continue
            }
            
            console.log(`✅ ${name} - Created successfully`)
            bucketsCreated++
            
            // Note: Storage policies are typically managed through the Supabase dashboard
            // or SQL commands, as the JavaScript client has limited policy management
            console.log(`   📝 Remember to set up RLS policies for ${name} in Supabase dashboard`)
        }
        
        console.log('\n📊 Summary:')
        console.log(`✅ Buckets created: ${bucketsCreated}`)
        console.log(`⏭️  Buckets skipped (already exist): ${bucketsSkipped}`)
        console.log(`📝 Total expected: ${bucketsToCreate.length}`)
        
        if (bucketsCreated > 0) {
            console.log('\n🎯 Next Steps:')
            console.log('1. Go to Supabase Dashboard → Storage → Policies')
            console.log('2. Set up Row Level Security policies for each bucket:')
            console.log('   - customer-documents: Allow authenticated users to manage their own files')
            console.log('   - package-photos: Allow staff users to upload, customers to view their own')
            console.log('   - delivery-signatures: Allow staff users to upload, customers to view their own')
            console.log('   - chrisdan-assets: Public read access, staff write access')
            console.log('\n3. Test file upload functionality in the application')
        } else {
            console.log('\n✅ All storage buckets are already configured!')
        }
        
        // Verify buckets were created
        console.log('\n🔍 Verifying bucket creation...')
        const { data: finalBuckets, error: finalError } = await supabase.storage.listBuckets()
        
        if (!finalError && finalBuckets) {
            const finalBucketNames = finalBuckets.map(b => b.name)
            const expectedBuckets = bucketsToCreate.map(b => b.name)
            const missing = expectedBuckets.filter(name => !finalBucketNames.includes(name))
            
            if (missing.length === 0) {
                console.log('✅ All required buckets are now present!')
            } else {
                console.log(`⚠️  Still missing: ${missing.join(', ')}`)
                console.log('💡 These may need to be created manually in the Supabase dashboard')
            }
        }
        
    } catch (error) {
        console.error('❌ Failed to create storage buckets:', error)
        console.log('\n🔧 Troubleshooting:')
        console.log('1. Verify you have admin access to the Supabase project')
        console.log('2. Check that the service role key has storage permissions')
        console.log('3. Create buckets manually in the Supabase dashboard if needed')
    }
}

// Run the bucket creation
createStorageBuckets()
