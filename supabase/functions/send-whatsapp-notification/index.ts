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
        const { phoneNumber, message, templateName, templateParams, customerId, shipmentId } = await req.json();

        if (!phoneNumber || !message) {
            throw new Error('Phone number and message are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
        const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        let notificationStatus = 'demo';
        let errorMessage = null;

        // If WhatsApp credentials are available, send actual message
        if (whatsappToken && whatsappPhoneId) {
            try {
                const whatsappResponse = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${whatsappToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: phoneNumber,
                        type: 'text',
                        text: {
                            body: message
                        }
                    })
                });

                if (whatsappResponse.ok) {
                    notificationStatus = 'sent';
                } else {
                    const errorData = await whatsappResponse.text();
                    notificationStatus = 'failed';
                    errorMessage = `WhatsApp API error: ${errorData}`;
                }
            } catch (error) {
                notificationStatus = 'failed';
                errorMessage = error.message;
            }
        } else {
            // Demo mode - log the message that would be sent
            console.log('=== DEMO WhatsApp Notification ===');
            console.log(`To: ${phoneNumber}`);
            console.log(`Message: ${message}`);
            console.log('=== End Demo Notification ===');
            notificationStatus = 'demo';
        }

        // Log notification in database
        const logResponse = await fetch(`${supabaseUrl}/rest/v1/notification_logs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                customer_id: customerId || null,
                shipment_id: shipmentId || null,
                notification_type: 'shipment_update',
                channel: 'whatsapp',
                recipient: phoneNumber,
                message_content: message,
                status: notificationStatus,
                sent_at: notificationStatus === 'sent' ? new Date().toISOString() : null,
                error_message: errorMessage
            })
        });

        const logData = await logResponse.json();

        return new Response(JSON.stringify({
            data: {
                status: notificationStatus,
                message: notificationStatus === 'demo' 
                    ? 'Demo notification logged - add WhatsApp credentials to enable actual sending'
                    : notificationStatus === 'sent' 
                    ? 'WhatsApp message sent successfully'
                    : 'Failed to send WhatsApp message',
                notificationLog: logData[0]
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('WhatsApp notification error:', error);

        const errorResponse = {
            error: {
                code: 'WHATSAPP_NOTIFICATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});