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
        const requestData = await req.json();
        console.log('Request data:', requestData);
        
        const { tracking_number, new_status, notes, staff_email, location, device_info } = requestData;

        if (!tracking_number || !new_status || !staff_email) {
            throw new Error('Missing required fields: tracking_number, new_status, staff_email');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Missing Supabase configuration');
        }

        console.log('Finding shipment with tracking number:', tracking_number);

        // First, find the shipment by tracking number
        const shipmentResponse = await fetch(`${supabaseUrl}/rest/v1/shipments?tracking_number=eq.${tracking_number}&select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!shipmentResponse.ok) {
            const errorText = await shipmentResponse.text();
            console.error('Shipment query failed:', errorText);
            throw new Error(`Failed to find shipment: ${errorText}`);
        }

        const shipments = await shipmentResponse.json();
        console.log('Found shipments:', shipments);
        
        if (!shipments || shipments.length === 0) {
            throw new Error('Shipment not found with that tracking number');
        }

        const shipment = shipments[0];
        const shipmentId = shipment.id;
        console.log('Updating shipment ID:', shipmentId);

        // Update shipment status (only fields that exist)
        const updateData = {
            status: new_status
        };

        // Add timestamp fields based on status (only if columns exist)
        if (new_status === 'received') {
            updateData.received_at = new Date().toISOString();
        } else if (new_status === 'shipped') {
            updateData.shipped_at = new Date().toISOString();
        } else if (new_status === 'delivered') {
            updateData.delivered_at = new Date().toISOString();
        }

        console.log('Update data:', updateData);

        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/shipments?id=eq.${shipmentId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('Update shipment failed:', errorText);
            throw new Error(`Failed to update shipment: ${errorText}`);
        }

        console.log('Shipment updated successfully');

        // Generate UUID using crypto
        const eventId = crypto.randomUUID();
        console.log('Generated event ID:', eventId);

        // Create tracking event
        const eventData = {
            id: eventId,
            shipment_id: shipmentId,
            event_type: new_status,
            event_description: `Package ${new_status} by ${staff_email}`,
            location: location || 'Chrisdan Enterprises - Jamaica, NY',
            staff_member: staff_email,
            timestamp: new Date().toISOString(),
            notes: notes || ''
        };

        console.log('Creating tracking event:', eventData);

        const eventResponse = await fetch(`${supabaseUrl}/rest/v1/tracking_events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (!eventResponse.ok) {
            const errorText = await eventResponse.text();
            console.error('Failed to create tracking event:', errorText);
            // Don't throw here, continue with scan log
        } else {
            console.log('Tracking event created successfully');
        }

        // Generate UUID for scan log
        const scanLogId = crypto.randomUUID();
        console.log('Generated scan log ID:', scanLogId);

        // Create scan log
        const scanLogData = {
            id: scanLogId,
            shipment_id: shipmentId,
            barcode: tracking_number,
            scan_type: new_status,
            scanned_by: staff_email,
            scan_timestamp: new Date().toISOString(),
            device_info: device_info || 'Web Scanner',
            location: location || 'Chrisdan Enterprises - Jamaica, NY'
        };

        console.log('Creating scan log:', scanLogData);

        const scanLogResponse = await fetch(`${supabaseUrl}/rest/v1/scan_logs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scanLogData)
        });

        if (!scanLogResponse.ok) {
            const errorText = await scanLogResponse.text();
            console.error('Failed to create scan log:', errorText);
            // Don't throw here, main operation succeeded
        } else {
            console.log('Scan log created successfully');
        }

        console.log('All operations completed successfully');

        return new Response(JSON.stringify({
            data: {
                success: true,
                shipment_id: shipmentId,
                tracking_number: tracking_number,
                new_status: new_status,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Update tracking status error:', error);

        const errorResponse = {
            error: {
                code: 'UPDATE_TRACKING_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});