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
        const { fileData, fileName, documentType, customerId, shipmentId, mimeType: explicitMimeType } = await req.json();

        if (!fileData || !fileName || !documentType || !customerId) {
            throw new Error('File data, filename, document type, and customer ID are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Extract base64 data from data URL
        const base64Data = fileData.split(',')[1];
        // Use explicit MIME type if provided, otherwise extract from data URL
        const mimeType = explicitMimeType || fileData.split(';')[0].split(':')[1];
        
        // Ensure PDF MIME type is correct
        const finalMimeType = fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : mimeType;

        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Generate unique filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const uniqueFileName = `${customerId}/${documentType}/${timestamp}-${fileName}`;

        // Upload to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/customer-documents/${uniqueFileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/customer-documents/${uniqueFileName}`;

        // Save document metadata to database
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/customer_documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                customer_id: customerId,
                document_type: documentType,
                document_name: fileName,
                file_url: publicUrl,
                file_size: binaryData.length,
                mime_type: mimeType,
                associated_shipment_id: shipmentId || null
            })
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const documentData = await insertResponse.json();

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                document: documentData[0]
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Document upload error:', error);

        const errorResponse = {
            error: {
                code: 'DOCUMENT_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
