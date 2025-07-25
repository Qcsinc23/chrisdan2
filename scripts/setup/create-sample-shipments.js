import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'https://yddnvrvlgzoqjuazryht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZG52cnZsZ3pvcWp1YXpyeWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQyODYsImV4cCI6MjA2ODY3MDI4Nn0.YJq43VnHrb5vRtxpH_4a7nWI_ufMsW7WRUSBhWoqnIM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sample data for shipments
const sampleShipments = [
  {
    tracking_number: 'CE240001',
    customer_name: 'John Smith',
    customer_email: 'john.smith@email.com',
    destination_address: '123 Main Street, Kingston 10',
    destination_country: 'Jamaica',
    package_type: 'Box',
    service_type: 'Standard',
    status: 'delivered',
    estimated_delivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    tracking_number: 'CE240002',
    customer_name: 'Maria Rodriguez',
    customer_email: 'maria.rodriguez@email.com',
    destination_address: '456 Spanish Town Road, St. Catherine',
    destination_country: 'Jamaica',
    package_type: 'Envelope',
    service_type: 'Express',
    status: 'shipped',
    estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    tracking_number: 'CE240003',
    customer_name: 'Robert Brown',
    customer_email: 'robert.brown@email.com',
    destination_address: '789 Hope Road, St. Andrew',
    destination_country: 'Jamaica',
    package_type: 'Box',
    service_type: 'Standard',
    status: 'processing',
    estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    tracking_number: 'CE240004',
    customer_name: 'Lisa Johnson',
    customer_email: 'lisa.johnson@email.com',
    destination_address: '321 Orange Street, Spanish Town',
    destination_country: 'Jamaica',
    package_type: 'Package',
    service_type: 'Express',
    status: 'received',
    estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    tracking_number: 'CE240005',
    customer_name: 'Michael Davis',
    customer_email: 'michael.davis@email.com',
    destination_address: '654 Mandela Highway, Kingston',
    destination_country: 'Jamaica',
    package_type: 'Box',
    service_type: 'Standard',
    status: 'pending',
    estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    tracking_number: 'CE240006',
    customer_name: 'Sarah Wilson',
    customer_email: 'sarah.wilson@email.com',
    destination_address: '987 Red Hills Road, St. Andrew',
    destination_country: 'Jamaica',
    package_type: 'Envelope',
    service_type: 'Express',
    status: 'shipped',
    estimated_delivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    tracking_number: 'CE240007',
    customer_name: 'David Thompson',
    customer_email: 'david.thompson@email.com',
    destination_address: '147 Portmore Boulevard, St. Catherine',
    destination_country: 'Jamaica',
    package_type: 'Box',
    service_type: 'Standard',
    status: 'delivered',
    estimated_delivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    tracking_number: 'CE240008',
    customer_name: 'Jennifer Lee',
    customer_email: 'jennifer.lee@email.com',
    destination_address: '258 Half Way Tree Road, Kingston',
    destination_country: 'Jamaica',
    package_type: 'Package',
    service_type: 'Express',
    status: 'processing',
    estimated_delivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    tracking_number: 'CE240009',
    customer_name: 'Christopher Martin',
    customer_email: 'christopher.martin@email.com',
    destination_address: '369 Old Harbour Road, St. Catherine',
    destination_country: 'Jamaica',
    package_type: 'Envelope',
    service_type: 'Standard',
    status: 'received',
    estimated_delivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    tracking_number: 'CE240010',
    customer_name: 'Amanda Clarke',
    customer_email: 'amanda.clarke@email.com',
    destination_address: '741 Mountain View Avenue, Kingston',
    destination_country: 'Jamaica',
    package_type: 'Box',
    service_type: 'Express',
    status: 'pending',
    estimated_delivery: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
]

async function createSampleShipments() {
  try {
    console.log('Creating sample shipments for testing...')
    
    // Insert sample shipments
    const { data, error } = await supabase
      .from('shipments')
      .insert(sampleShipments)
      .select()

    if (error) {
      console.error('Error creating sample shipments:', error)
      return
    }

    console.log(`Successfully created ${data.length} sample shipments!`)
    
    // Show summary
    const statusCounts = sampleShipments.reduce((acc, shipment) => {
      acc[shipment.status] = (acc[shipment.status] || 0) + 1
      return acc
    }, {})
    
    console.log('\n=== SAMPLE SHIPMENTS SUMMARY ===')
    console.log('Total shipments:', sampleShipments.length)
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count}`)
    })
    
    console.log('\nSample tracking numbers:')
    sampleShipments.slice(0, 5).forEach(shipment => {
      console.log(`- ${shipment.tracking_number} (${shipment.status})`)
    })
    
    console.log('\nYou can now refresh the staff dashboard to see the data!')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createSampleShipments()
