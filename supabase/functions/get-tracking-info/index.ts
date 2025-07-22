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
        const { tracking_number } = await req.json();

        if (!tracking_number) {
            throw new Error('Tracking number is required');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Missing Supabase configuration');
        }

        // Get shipment details
        const shipmentResponse = await fetch(`${supabaseUrl}/rest/v1/shipments?tracking_number=eq.${tracking_number}&select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!shipmentResponse.ok) {
            const errorText = await shipmentResponse.text();
            throw new Error(`Failed to get shipment: ${errorText}`);
        }

        const shipments = await shipmentResponse.json();
        if (!shipments || shipments.length === 0) {
            throw new Error('Tracking number not found');
        }

        const shipment = shipments[0];
        const shipmentId = shipment.id;

        // Get tracking events
        const eventsResponse = await fetch(`${supabaseUrl}/rest/v1/tracking_events?shipment_id=eq.${shipmentId}&select=*&order=timestamp.desc`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        let trackingEvents = [];
        if (eventsResponse.ok) {
            trackingEvents = await eventsResponse.json();
        }

        // Calculate estimated delivery if not set
        let estimatedDelivery = shipment.estimated_delivery;
        if (!estimatedDelivery && shipment.destination_country) {
            const createdDate = new Date(shipment.created_at || shipment.received_at);
            const deliveryDays = getDeliveryDays(shipment.destination_country);
            estimatedDelivery = new Date(createdDate.getTime() + (deliveryDays * 24 * 60 * 60 * 1000)).toISOString();
        }

        // Get status display and progress
        const statusInfo = getStatusInfo(shipment.status);

        const result = {
            data: {
                shipment: {
                    ...shipment,
                    estimated_delivery: estimatedDelivery
                },
                tracking_events: trackingEvents,
                status_info: statusInfo,
                last_updated: trackingEvents.length > 0 ? trackingEvents[0].timestamp : shipment.created_at
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get tracking info error:', error);

        const errorResponse = {
            error: {
                code: 'TRACKING_INFO_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to get delivery days based on destination country
function getDeliveryDays(country) {
    const deliveryTimes = {
        'Jamaica': 7,
        'Guyana': 10,
        'Trinidad and Tobago': 8,
        'Barbados': 9,
        'Suriname': 12,
        'French Guiana': 14,
        'Belize': 11,
        'Costa Rica': 10,
        'Panama': 9,
        'Nicaragua': 12,
        'Honduras': 13,
        'Guatemala': 11
    };
    
    return deliveryTimes[country] || 10; // Default 10 days
}

// Helper function to get status information
function getStatusInfo(status) {
    const statusMap = {
        'received': {
            display: 'Package Received',
            description: 'Your package has been received at our facility and is being processed.',
            progress: 25,
            color: 'blue'
        },
        'processing': {
            display: 'Processing',
            description: 'Your package is being processed and prepared for shipment.',
            progress: 50,
            color: 'yellow'
        },
        'shipped': {
            display: 'Shipped',
            description: 'Your package has been shipped and is on its way to the destination.',
            progress: 75,
            color: 'indigo'
        },
        'delivered': {
            display: 'Delivered',
            description: 'Your package has been successfully delivered.',
            progress: 100,
            color: 'green'
        },
        'pending': {
            display: 'Pending',
            description: 'Your shipment request is being reviewed.',
            progress: 10,
            color: 'gray'
        }
    };
    
    return statusMap[status] || {
        display: status.charAt(0).toUpperCase() + status.slice(1),
        description: `Package status: ${status}`,
        progress: 0,
        color: 'gray'
    };
}