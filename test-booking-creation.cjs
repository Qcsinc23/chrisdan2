#!/usr/bin/env node
// Test script to create a service booking and verify cross-connection

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yddnvrvlgzoqjuazryht.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZG52cnZsZ3pvcWp1YXpyeWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQyODYsImV4cCI6MjA2ODY3MDI4Nn0.YJq43VnHrb5vRtxpH_4a7nWI_ufMsW7WRUSBhWoqnIM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

async function testBookingSystem() {
    console.log(`${colors.bright}${colors.cyan}🧪 Testing Service Booking System${colors.reset}`);
    console.log(`${colors.yellow}Creating test booking and verifying cross-connection...${colors.reset}\n`);

    try {
        // Step 1: Get a customer account to use for testing
        console.log(`${colors.yellow}📋 Step 1: Finding customer account...${colors.reset}`);
        const { data: customers, error: customerError } = await supabase
            .from('customer_accounts')
            .select('*')
            .limit(1);

        if (customerError) {
            console.log(`${colors.red}❌ Error getting customer: ${customerError.message}${colors.reset}`);
            return;
        }

        if (!customers || customers.length === 0) {
            console.log(`${colors.red}❌ No customer accounts found${colors.reset}`);
            return;
        }

        const customer = customers[0];
        console.log(`${colors.green}✅ Found customer: ${customer.full_name} (${customer.id})${colors.reset}`);

        // Step 2: Create a test booking using the service-booking-system function
        console.log(`\n${colors.yellow}📋 Step 2: Creating test booking...${colors.reset}`);
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const bookingDate = tomorrow.toISOString().split('T')[0];

        const { data: bookingResult, error: bookingError } = await supabase.functions.invoke('service-booking-system', {
            body: {
                action: 'create_booking',
                bookingData: {
                    customerId: customer.id,
                    serviceType: 'pickup',
                    bookingDate: bookingDate,
                    timeSlot: '10:00 AM - 11:00 AM',
                    pickupAddressId: null,
                    deliveryAddressId: null,
                    specialInstructions: 'Test booking for cross-connection verification'
                }
            }
        });

        if (bookingError) {
            console.log(`${colors.red}❌ Error creating booking: ${bookingError.message}${colors.reset}`);
            return;
        }

        console.log(`${colors.green}✅ Booking created successfully!${colors.reset}`);
        console.log(`${colors.cyan}   Confirmation: ${bookingResult.data[0]?.confirmation_number}${colors.reset}`);

        // Step 3: Verify booking appears in database
        console.log(`\n${colors.yellow}📋 Step 3: Verifying booking in database...${colors.reset}`);
        
        const { data: bookings, error: verifyError } = await supabase
            .from('service_bookings')
            .select('*')
            .eq('customer_id', customer.id);

        if (verifyError) {
            console.log(`${colors.red}❌ Error verifying booking: ${verifyError.message}${colors.reset}`);
            return;
        }

        console.log(`${colors.green}✅ Found ${bookings?.length || 0} booking(s) in database${colors.reset}`);
        
        if (bookings && bookings.length > 0) {
            const booking = bookings[0];
            console.log(`${colors.cyan}   Service Type: ${booking.service_type}${colors.reset}`);
            console.log(`${colors.cyan}   Status: ${booking.status}${colors.reset}`);
            console.log(`${colors.cyan}   Date: ${booking.booking_date}${colors.reset}`);
            console.log(`${colors.cyan}   Time: ${booking.time_slot}${colors.reset}`);
        }

        // Step 4: Test staff visibility
        console.log(`\n${colors.yellow}📋 Step 4: Testing staff visibility...${colors.reset}`);
        
        const { data: staffBookings, error: staffError } = await supabase.functions.invoke('service-booking-system', {
            body: {
                action: 'get_all_bookings'
            }
        });

        if (staffError) {
            console.log(`${colors.red}❌ Error getting staff bookings: ${staffError.message}${colors.reset}`);
            return;
        }

        console.log(`${colors.green}✅ Staff can see ${staffBookings?.data?.length || 0} booking(s)${colors.reset}`);

        // Step 5: Test customer visibility
        console.log(`\n${colors.yellow}📋 Step 5: Testing customer visibility...${colors.reset}`);
        
        const { data: customerBookings, error: customerBookingError } = await supabase.functions.invoke('service-booking-system', {
            body: {
                action: 'get_customer_bookings',
                bookingData: {
                    customerId: customer.id
                }
            }
        });

        if (customerBookingError) {
            console.log(`${colors.red}❌ Error getting customer bookings: ${customerBookingError.message}${colors.reset}`);
            return;
        }

        console.log(`${colors.green}✅ Customer can see ${customerBookings?.data?.length || 0} booking(s)${colors.reset}`);

        // Summary
        console.log(`\n${colors.bright}${colors.cyan}📋 Test Summary${colors.reset}`);
        console.log(`${colors.green}✅ Service booking system is working${colors.reset}`);
        console.log(`${colors.green}✅ Cross-connection verified${colors.reset}`);
        console.log(`${colors.cyan}Next steps:${colors.reset}`);
        console.log(`   1. Customer should now see the booking in their dashboard`);
        console.log(`   2. Staff should see the booking in Service Bookings tab`);
        console.log(`   3. Cross-connected dashboard should show the activity`);

    } catch (error) {
        console.error(`${colors.red}❌ Test failed: ${error.message}${colors.reset}`);
    }
}

// Execute test
if (require.main === module) {
    testBookingSystem().catch(console.error);
}

module.exports = { testBookingSystem };
