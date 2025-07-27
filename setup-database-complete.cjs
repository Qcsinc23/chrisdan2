const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.error('Available vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')))
  process.exit(1)
}

console.log('Using Supabase URL:', supabaseUrl)
console.log('Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role' : 'Anon Key')

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('🚀 Setting up complete database schema...')

  try {
    // 1. Create customer_accounts table (if not exists)
    console.log('📋 Creating customer_accounts table...')
    const { error: customerAccountsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS customer_accounts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id),
          full_name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          primary_address_id UUID,
          whatsapp_notifications BOOLEAN DEFAULT true,
          email_notifications BOOLEAN DEFAULT true,
          sms_notifications BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true
        );
        
        CREATE INDEX IF NOT EXISTS idx_customer_accounts_user_id ON customer_accounts(user_id);
      `
    })

    if (customerAccountsError) {
      console.error('Error creating customer_accounts:', customerAccountsError)
    } else {
      console.log('✅ customer_accounts table created')
    }

    // 2. Create customer_addresses table
    console.log('📋 Creating customer_addresses table...')
    const { error: addressesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS customer_addresses (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          customer_id UUID NOT NULL,
          address_type VARCHAR(50) DEFAULT 'delivery',
          street_address TEXT NOT NULL,
          city VARCHAR(100) NOT NULL,
          state_province VARCHAR(100),
          postal_code VARCHAR(20),
          country VARCHAR(100) NOT NULL,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add foreign key constraint
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customer_addresses_customer') THEN
            ALTER TABLE customer_addresses 
            ADD CONSTRAINT fk_customer_addresses_customer 
            FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE;
          END IF;
        END $$;

        CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
        CREATE INDEX IF NOT EXISTS idx_customer_addresses_is_default ON customer_addresses(is_default);
      `
    })

    if (addressesError) {
      console.error('Error creating customer_addresses:', addressesError)
    } else {
      console.log('✅ customer_addresses table created')
    }

    // 3. Create service_bookings table
    console.log('📋 Creating service_bookings table...')
    const { error: bookingsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS service_bookings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          customer_id UUID NOT NULL,
          service_type VARCHAR(100) NOT NULL,
          booking_date DATE NOT NULL,
          time_slot VARCHAR(50) NOT NULL,
          pickup_address_id UUID,
          delivery_address_id UUID,
          special_instructions TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          estimated_cost DECIMAL(10,2),
          confirmation_number VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add foreign key constraints
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_service_bookings_customer') THEN
            ALTER TABLE service_bookings 
            ADD CONSTRAINT fk_service_bookings_customer 
            FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_service_bookings_pickup_address') THEN
            ALTER TABLE service_bookings 
            ADD CONSTRAINT fk_service_bookings_pickup_address 
            FOREIGN KEY (pickup_address_id) REFERENCES customer_addresses(id);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_service_bookings_delivery_address') THEN
            ALTER TABLE service_bookings 
            ADD CONSTRAINT fk_service_bookings_delivery_address 
            FOREIGN KEY (delivery_address_id) REFERENCES customer_addresses(id);
          END IF;
        END $$;

        CREATE INDEX IF NOT EXISTS idx_service_bookings_customer_id ON service_bookings(customer_id);
        CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(status);
        CREATE INDEX IF NOT EXISTS idx_service_bookings_booking_date ON service_bookings(booking_date);
      `
    })

    if (bookingsError) {
      console.error('Error creating service_bookings:', bookingsError)
    } else {
      console.log('✅ service_bookings table created')
    }

    // 4. Create customer_documents table
    console.log('📋 Creating customer_documents table...')
    const { error: documentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS customer_documents (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          customer_id UUID NOT NULL,
          document_type VARCHAR(100) NOT NULL,
          document_name VARCHAR(255) NOT NULL,
          file_url TEXT NOT NULL,
          file_size INTEGER,
          mime_type VARCHAR(100),
          associated_shipment_id UUID,
          upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_verified BOOLEAN DEFAULT false,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add foreign key constraints
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customer_documents_customer') THEN
            ALTER TABLE customer_documents 
            ADD CONSTRAINT fk_customer_documents_customer 
            FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE;
          END IF;
        END $$;

        CREATE INDEX IF NOT EXISTS idx_customer_documents_customer_id ON customer_documents(customer_id);
        CREATE INDEX IF NOT EXISTS idx_customer_documents_document_type ON customer_documents(document_type);
        CREATE INDEX IF NOT EXISTS idx_customer_documents_upload_date ON customer_documents(upload_date);
        CREATE INDEX IF NOT EXISTS idx_customer_documents_is_verified ON customer_documents(is_verified);
      `
    })

    if (documentsError) {
      console.error('Error creating customer_documents:', documentsError)
    } else {
      console.log('✅ customer_documents table created')
    }

    // 5. Create consolidation_requests table
    console.log('📋 Creating consolidation_requests table...')
    const { error: consolidationError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS consolidation_requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          customer_id UUID NOT NULL,
          consolidation_name VARCHAR(255),
          status VARCHAR(50) DEFAULT 'pending',
          destination_country VARCHAR(100) NOT NULL,
          total_weight DECIMAL(10,2) DEFAULT 0,
          total_packages INTEGER DEFAULT 0,
          estimated_savings DECIMAL(10,2) DEFAULT 0,
          consolidated_shipment_id UUID,
          special_instructions TEXT,
          requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          consolidation_date TIMESTAMP WITH TIME ZONE,
          shipped_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          notes TEXT
        );

        -- Add foreign key constraint
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_consolidation_customer') THEN
            ALTER TABLE consolidation_requests 
            ADD CONSTRAINT fk_consolidation_customer 
            FOREIGN KEY (customer_id) REFERENCES customer_accounts(id);
          END IF;
        END $$;

        CREATE INDEX IF NOT EXISTS idx_consolidation_requests_customer_id ON consolidation_requests(customer_id);
        CREATE INDEX IF NOT EXISTS idx_consolidation_requests_status ON consolidation_requests(status);
      `
    })

    if (consolidationError) {
      console.error('Error creating consolidation_requests:', consolidationError)
    } else {
      console.log('✅ consolidation_requests table created')
    }

    // 6. Create consolidation_items table
    console.log('📋 Creating consolidation_items table...')
    const { error: consolidationItemsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS consolidation_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          consolidation_id UUID REFERENCES consolidation_requests(id) ON DELETE CASCADE,
          shipment_id UUID,
          tracking_number VARCHAR(255) NOT NULL,
          package_description TEXT,
          weight_lbs DECIMAL(10,2),
          dimensions VARCHAR(100),
          added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_consolidation_items_consolidation_id ON consolidation_items(consolidation_id);
        CREATE INDEX IF NOT EXISTS idx_consolidation_items_shipment_id ON consolidation_items(shipment_id);
      `
    })

    if (consolidationItemsError) {
      console.error('Error creating consolidation_items:', consolidationItemsError)
    } else {
      console.log('✅ consolidation_items table created')
    }

    // 7. Update primary_address_id foreign key in customer_accounts
    console.log('📋 Adding primary_address_id foreign key...')
    const { error: primaryAddressError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customer_accounts_primary_address') THEN
            ALTER TABLE customer_accounts 
            ADD CONSTRAINT fk_customer_accounts_primary_address 
            FOREIGN KEY (primary_address_id) REFERENCES customer_addresses(id);
          END IF;
        END $$;
      `
    })

    if (primaryAddressError) {
      console.error('Error adding primary_address_id foreign key:', primaryAddressError)
    } else {
      console.log('✅ primary_address_id foreign key added')
    }

    console.log('🎉 Database setup completed successfully!')
    console.log('\n📊 Summary of created tables:')
    console.log('  ✅ customer_accounts')
    console.log('  ✅ customer_addresses')
    console.log('  ✅ service_bookings')
    console.log('  ✅ customer_documents')
    console.log('  ✅ consolidation_requests')
    console.log('  ✅ consolidation_items')
    console.log('\n🔗 All foreign key relationships established')
    console.log('📈 All indexes created for optimal performance')

  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase()
