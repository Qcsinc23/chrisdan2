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

        const { trackingNumber } = await req.json();

        if (!trackingNumber) {
            throw new Error('Tracking number is required');
        }

        // Get shipment details
        const shipmentResponse = await fetch(`${supabaseUrl}/rest/v1/shipments?tracking_number=eq.${trackingNumber}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!shipmentResponse.ok) {
            throw new Error('Failed to fetch shipment');
        }

        const shipments = await shipmentResponse.json();
        
        if (shipments.length === 0) {
            return new Response(JSON.stringify({
                error: {
                    code: 'SHIPMENT_NOT_FOUND',
                    message: 'Tracking number not found. Please check your tracking number and try again.'
                }
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const shipment = shipments[0];

        // Get tracking events
        const eventsResponse = await fetch(`${supabaseUrl}/rest/v1/tracking_events?shipment_id=eq.${shipment.id}&order=timestamp.asc`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        let events = [];
        if (eventsResponse.ok) {
            events = await eventsResponse.json();
        }

        // Add default events if none exist
        if (events.length === 0) {
            events = [
                {
                    id: 'default-1',
                    event_type: 'received',
                    event_description: 'Package received at facility',
                    location: 'Jamaica, NY 11436',
                    staff_member: null,
                    timestamp: shipment.created_at,
                    notes: null
                }
            ];
        }

        // Create status info based on current status
        const getStatusInfo = (status: string) => {
            switch (status) {
                case 'delivered':
                    return {
                        display: 'Delivered',
                        description: 'Package has been delivered successfully',
                        progress: 100,
                        color: 'green'
                    };
                case 'shipped':
                    return {
                        display: 'In Transit',
                        description: 'Package is on its way to destination',
                        progress: 75,
                        color: 'blue'
                    };
                case 'received':
                    return {
                        display: 'Received',
                        description: 'Package received at our facility',
                        progress: 25,
                        color: 'yellow'
                    };
                default:
                    return {
                        display: 'Processing',
                        description: 'Package is being processed',
                        progress: 10,
                        color: 'gray'
                    };
            }
        };

        const result = {
            shipment: {
                id: shipment.id,
                tracking_number: shipment.tracking_number,
                customer_name: shipment.customer_name,
                destination_address: shipment.destination_address,
                destination_country: shipment.destination_country,
                package_type: shipment.package_type,
                service_type: shipment.service_type,
                status: shipment.status || 'received',
                created_at: shipment.created_at,
                estimated_delivery: shipment.estimated_delivery
            },
            tracking_events: events,
            status_info: getStatusInfo(shipment.status || 'received'),
            last_updated: events.length > 0 ? events[events.length - 1].timestamp || shipment.created_at : shipment.created_at
        };

        return new Response(JSON.stringify({
            data: result
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Tracking error:', error);

        const errorResponse = {
            error: {
                code: 'TRACKING_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});