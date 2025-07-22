Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const { action, bookingData } = await req.json();

        if (!action) {
            throw new Error('Action is required');
        }

        let result = {};

        switch (action) {
            case 'get_available_slots':
                // Get available time slots for a specific date
                const { date, serviceType } = bookingData;
                
                // Define available time slots
                const allSlots = [
                    '9:00 AM - 10:00 AM',
                    '10:00 AM - 11:00 AM',
                    '11:00 AM - 12:00 PM',
                    '1:00 PM - 2:00 PM',
                    '2:00 PM - 3:00 PM',
                    '3:00 PM - 4:00 PM',
                    '4:00 PM - 5:00 PM'
                ];

                // Get existing bookings for the date
                const existingBookingsResponse = await fetch(`${supabaseUrl}/rest/v1/service_bookings?booking_date=eq.${date}&select=time_slot`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                let bookedSlots = [];
                if (existingBookingsResponse.ok) {
                    const bookings = await existingBookingsResponse.json();
                    bookedSlots = bookings.map(booking => booking.time_slot);
                }

                // Filter available slots
                const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
                
                result = { availableSlots, bookedSlots };
                break;

            case 'create_booking':
                // Create new service booking
                const confirmationNumber = generateConfirmationNumber();
                
                const createBookingResponse = await fetch(`${supabaseUrl}/rest/v1/service_bookings`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        customer_id: bookingData.customerId,
                        service_type: bookingData.serviceType,
                        booking_date: bookingData.bookingDate,
                        time_slot: bookingData.timeSlot,
                        pickup_address_id: bookingData.pickupAddressId,
                        delivery_address_id: bookingData.deliveryAddressId,
                        special_instructions: bookingData.specialInstructions,
                        estimated_cost: calculateEstimatedCost(bookingData.serviceType),
                        confirmation_number: confirmationNumber,
                        status: 'pending'
                    })
                });

                if (!createBookingResponse.ok) {
                    const errorText = await createBookingResponse.text();
                    throw new Error(`Failed to create booking: ${errorText}`);
                }

                result = await createBookingResponse.json();
                break;

            case 'get_customer_bookings':
                // Get customer's bookings
                const customerBookingsResponse = await fetch(`${supabaseUrl}/rest/v1/service_bookings?customer_id=eq.${bookingData.customerId}&order=booking_date.desc,created_at.desc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (customerBookingsResponse.ok) {
                    result = await customerBookingsResponse.json();
                } else {
                    result = [];
                }
                break;

            case 'update_booking_status':
                // Update booking status (for staff)
                const updateBookingResponse = await fetch(`${supabaseUrl}/rest/v1/service_bookings?id=eq.${bookingData.bookingId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        status: bookingData.status,
                        updated_at: new Date().toISOString()
                    })
                });

                if (!updateBookingResponse.ok) {
                    const errorText = await updateBookingResponse.text();
                    throw new Error(`Failed to update booking: ${errorText}`);
                }

                result = await updateBookingResponse.json();
                break;

            case 'cancel_booking':
                // Cancel booking
                const cancelBookingResponse = await fetch(`${supabaseUrl}/rest/v1/service_bookings?id=eq.${bookingData.bookingId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        status: 'cancelled',
                        updated_at: new Date().toISOString()
                    })
                });

                if (!cancelBookingResponse.ok) {
                    const errorText = await cancelBookingResponse.text();
                    throw new Error(`Failed to cancel booking: ${errorText}`);
                }

                result = await cancelBookingResponse.json();
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({
            data: result
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Service booking error:', error);

        const errorResponse = {
            error: {
                code: 'SERVICE_BOOKING_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to generate confirmation number
function generateConfirmationNumber() {
    const prefix = 'CE';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

// Helper function to calculate estimated cost
function calculateEstimatedCost(serviceType) {
    const baseCosts = {
        'pickup': 25.00,
        'delivery': 30.00,
        'express_pickup': 40.00,
        'express_delivery': 50.00,
        'barrel_service': 35.00,
        'consolidation': 15.00
    };
    
    return baseCosts[serviceType] || 25.00;
}