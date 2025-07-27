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
        const { status_filter, search_term, limit = 50, offset = 0 } = await req.json();

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Missing Supabase configuration');
        }

        // Build query URL
        let queryUrl = `${supabaseUrl}/rest/v1/shipments?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`;
        
        // Add status filter if provided
        if (status_filter && status_filter !== 'all') {
            queryUrl += `&status=eq.${status_filter}`;
        }

        // Add search filter if provided
        if (search_term && search_term.trim()) {
            const searchTerm = search_term.trim();
            queryUrl += `&or=(tracking_number.ilike.*${searchTerm}*,customer_name.ilike.*${searchTerm}*,customer_email.ilike.*${searchTerm}*)`;
        }

        const shipmentsResponse = await fetch(queryUrl, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!shipmentsResponse.ok) {
            const errorText = await shipmentsResponse.text();
            throw new Error(`Failed to get shipments: ${errorText}`);
        }

        const shipments = await shipmentsResponse.json();

        // Get counts by status for dashboard stats
        const statsResponse = await fetch(`${supabaseUrl}/rest/v1/shipments?select=status&status=not.eq.delivered`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        let stats = {
            total: 0,
            pending: 0,
            received: 0,
            processing: 0,
            shipped: 0,
            delivered: 0
        };

        if (statsResponse.ok) {
            const allShipments = await statsResponse.json();
            stats.total = allShipments.length;
            
            allShipments.forEach(shipment => {
                stats[shipment.status] = (stats[shipment.status] || 0) + 1;
            });
        }

        const result = {
            data: {
                shipments: shipments,
                stats: stats,
                pagination: {
                    limit: limit,
                    offset: offset,
                    total: shipments.length
                }
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get staff shipments error:', error);

        const errorResponse = {
            error: {
                code: 'GET_SHIPMENTS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});