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
        const { toEmail, subject, htmlContent, textContent, templateType, templateData, customerId, shipmentId } = await req.json();

        if (!toEmail || !subject || (!htmlContent && !textContent)) {
            throw new Error('To email, subject, and content are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const resendApiKey = Deno.env.get('RESEND_API_KEY');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        let notificationStatus = 'demo';
        let errorMessage = null;

        // Generate professional email template if template data is provided
        let finalHtmlContent = htmlContent;
        let finalTextContent = textContent;

        if (templateType && templateData) {
            const template = generateEmailTemplate(templateType, templateData);
            finalHtmlContent = template.html;
            finalTextContent = template.text;
        }

        // If Resend API key is available, send actual email
        if (resendApiKey) {
            try {
                const emailResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'Chrisdan Enterprises <noreply@chrisdanenterprises.com>',
                        to: [toEmail],
                        subject: subject,
                        html: finalHtmlContent,
                        text: finalTextContent
                    })
                });

                if (emailResponse.ok) {
                    notificationStatus = 'sent';
                } else {
                    const errorData = await emailResponse.text();
                    notificationStatus = 'failed';
                    errorMessage = `Email API error: ${errorData}`;
                }
            } catch (error) {
                notificationStatus = 'failed';
                errorMessage = error.message;
            }
        } else {
            // Demo mode - log the email that would be sent
            console.log('=== DEMO Email Notification ===');
            console.log(`To: ${toEmail}`);
            console.log(`Subject: ${subject}`);
            console.log(`HTML Content: ${finalHtmlContent}`);
            console.log(`Text Content: ${finalTextContent}`);
            console.log('=== End Demo Email ===');
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
                notification_type: templateType || 'general',
                channel: 'email',
                recipient: toEmail,
                subject: subject,
                message_content: finalTextContent || finalHtmlContent,
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
                    ? 'Demo email logged - add email service credentials to enable actual sending'
                    : notificationStatus === 'sent' 
                    ? 'Email sent successfully'
                    : 'Failed to send email',
                notificationLog: logData[0]
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Email notification error:', error);

        const errorResponse = {
            error: {
                code: 'EMAIL_NOTIFICATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Generate professional email templates
function generateEmailTemplate(templateType, data) {
    const companyInfo = {
        name: 'Chrisdan Enterprises LLC',
        address: '142-49 Rockaway Blvd, Jamaica, NY 11436',
        phone: '(718) 656-5400',
        website: 'www.chrisdanenterprises.com'
    };

    const baseStyle = `
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8fafc; }
            .footer { background: #64748b; color: white; padding: 15px; text-align: center; font-size: 12px; }
            .status-update { background: #dbeafe; border-left: 4px solid #1e40af; padding: 15px; margin: 15px 0; }
            .tracking-info { background: white; border: 1px solid #e2e8f0; padding: 15px; margin: 10px 0; }
        </style>
    `;

    switch (templateType) {
        case 'shipment_received':
            return {
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>${baseStyle}</head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>${companyInfo.name}</h1>
                                <h2>Package Received Confirmation</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${data.customerName},</p>
                                <div class="status-update">
                                    <h3>✅ Your package has been received!</h3>
                                    <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                                    <p><strong>Received Date:</strong> ${data.receivedDate}</p>
                                    <p><strong>Destination:</strong> ${data.destination}</p>
                                </div>
                                <p>Your package is now in our secure facility and will be processed for shipping soon.</p>
                                <p>Track your shipment anytime at: <a href="${data.trackingUrl}">${data.trackingUrl}</a></p>
                            </div>
                            <div class="footer">
                                <p>${companyInfo.name} | ${companyInfo.address} | ${companyInfo.phone}</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `Package Received Confirmation\n\nDear ${data.customerName},\n\nYour package has been received!\nTracking Number: ${data.trackingNumber}\nReceived Date: ${data.receivedDate}\nDestination: ${data.destination}\n\nTrack your shipment at: ${data.trackingUrl}\n\n${companyInfo.name}\n${companyInfo.address}\n${companyInfo.phone}`
            };

        case 'shipment_shipped':
            return {
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>${baseStyle}</head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>${companyInfo.name}</h1>
                                <h2>Package Shipped</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${data.customerName},</p>
                                <div class="status-update">
                                    <h3>🚢 Your package is on its way!</h3>
                                    <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                                    <p><strong>Ship Date:</strong> ${data.shipDate}</p>
                                    <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
                                    <p><strong>Destination:</strong> ${data.destination}</p>
                                </div>
                                <p>Your package has been shipped and is en route to its destination.</p>
                                <p>Track your shipment anytime at: <a href="${data.trackingUrl}">${data.trackingUrl}</a></p>
                            </div>
                            <div class="footer">
                                <p>${companyInfo.name} | ${companyInfo.address} | ${companyInfo.phone}</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `Package Shipped\n\nDear ${data.customerName},\n\nYour package is on its way!\nTracking Number: ${data.trackingNumber}\nShip Date: ${data.shipDate}\nEstimated Delivery: ${data.estimatedDelivery}\nDestination: ${data.destination}\n\nTrack your shipment at: ${data.trackingUrl}\n\n${companyInfo.name}\n${companyInfo.address}\n${companyInfo.phone}`
            };

        case 'shipment_delivered':
            return {
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>${baseStyle}</head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>${companyInfo.name}</h1>
                                <h2>Package Delivered</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${data.customerName},</p>
                                <div class="status-update">
                                    <h3>📦 Your package has been delivered!</h3>
                                    <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                                    <p><strong>Delivery Date:</strong> ${data.deliveryDate}</p>
                                    <p><strong>Delivered To:</strong> ${data.deliveredTo}</p>
                                    <p><strong>Location:</strong> ${data.destination}</p>
                                </div>
                                <p>Thank you for choosing ${companyInfo.name} for your shipping needs!</p>
                                <p>If you have any questions about your delivery, please contact us.</p>
                            </div>
                            <div class="footer">
                                <p>${companyInfo.name} | ${companyInfo.address} | ${companyInfo.phone}</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `Package Delivered\n\nDear ${data.customerName},\n\nYour package has been delivered!\nTracking Number: ${data.trackingNumber}\nDelivery Date: ${data.deliveryDate}\nDelivered To: ${data.deliveredTo}\nLocation: ${data.destination}\n\nThank you for choosing ${companyInfo.name}!\n\n${companyInfo.name}\n${companyInfo.address}\n${companyInfo.phone}`
            };

        default:
            return {
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>${baseStyle}</head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>${companyInfo.name}</h1>
                            </div>
                            <div class="content">
                                <p>Thank you for choosing ${companyInfo.name}.</p>
                            </div>
                            <div class="footer">
                                <p>${companyInfo.name} | ${companyInfo.address} | ${companyInfo.phone}</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `${companyInfo.name}\n${companyInfo.address}\n${companyInfo.phone}`
            };
    }
}