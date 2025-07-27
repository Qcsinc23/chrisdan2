import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'https://yddnvrvlgzoqjuazryht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZG52cnZsZ3pvcWp1YXpyeWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQyODYsImV4cCI6MjA2ODY3MDI4Nn0.YJq43VnHrb5vRtxpH_4a7nWI_ufMsW7WRUSBhWoqnIM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const sampleShipments = [
  {
    tracking_number: 'CD123456789',
    customer_name: 'John Smith',
    customer_email: 'john.smith@example.com',
    customer_phone: '+1-555-123-4567',
    origin_address: 'Jamaica, NY 11436, USA',
    destination_address: '123 Main Street, Kingston',
    destination_country: 'Jamaica',
    package_type: 'Box',
    package_description: 'Personal items and clothing',
    weight_lbs: 15.5,
    dimensions: '12x10x8 inches',
    service_type: 'Standard Shipping',
    status: 'delivered',
    created_at: new Date('2025-01-15').toISOString(),
    received_at: new Date('2025-01-15').toISOString(),
    shipped_at: new Date('2025-01-18').toISOString(),
    delivered_at: new Date('2025-01-22').toISOString(),
    estimated_delivery: new Date('2025-01-25').toISOString(),
    total_cost: 45.99,
    is_paid: true
  },
  {
    tracking_number: 'CD987654321',
    customer_name: 'Maria Rodriguez',
    customer_email: 'maria.rodriguez@example.com',
    customer_phone: '+1-555-987-6543',
    origin_address: 'Jamaica, NY 11436, USA',
    destination_address: '456 Palm Avenue, San José',
    destination_country: 'Costa Rica',
    package_type: 'Barrel',
    package_description: 'Household goods and electronics',
    weight_lbs: 85.0,
    dimensions: '24x24x36 inches',
    service_type: 'Express Shipping',
    status: 'shipped',
    created_at: new Date('2025-01-20').toISOString(),
    received_at: new Date('2025-01-20').toISOString(),
    shipped_at: new Date('2025-01-22').toISOString(),
    estimated_delivery: new Date('2025-01-28').toISOString(),
    total_cost: 125.50,
    is_paid: true
  },
  {
    tracking_number: 'CD555666777',
    customer_name: 'David Thompson',
    customer_email: 'david.thompson@example.com',
    customer_phone: '+1-555-555-7777',
    origin_address: 'Jamaica, NY 11436, USA',
    destination_address: '789 Beach Road, Bridgetown',
    destination_country: 'Barbados',
    package_type: 'Box',
    package_description: 'Medical supplies and medications',
    weight_lbs: 8.3,
    dimensions: '10x8x6 inches',
    service_type: 'Priority Shipping',
    status: 'processing',
    created_at: new Date('2025-01-25').toISOString(),
    received_at: new Date('2025-01-25').toISOString(),
    estimated_delivery: new Date('2025-02-01').toISOString(),
    total_cost: 75.25,
    is_paid: true
  }
]

async function createSampleShipments() {
  try {
    console.log('Creating sample shipments...')
    
    for (const shipment of sampleShipments) {
      console.log(`Creating shipment: ${shipment.tracking_number}`)
      
      const { data, error } = await supabase
        .from('shipments')
        .insert(shipment)
        .select()

      if (error) {
        if (error.code === '23505') {
          console.log(`Shipment ${shipment.tracking_number} already exists, skipping...`)
        } else {
          console.error(`Error creating shipment ${shipment.tracking_number}:`, error)
        }
      } else {
        console.log(`✅ Created shipment: ${shipment.tracking_number}`)
      }
    }

    console.log('\n=== SAMPLE TRACKING NUMBERS ===')
    console.log('1. CD123456789 - Delivered package')
    console.log('2. CD987654321 - Shipped package')
    console.log('3. CD555666777 - Processing package')
    console.log('\nYou can now test tracking at: /tracking')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createSampleShipments()
