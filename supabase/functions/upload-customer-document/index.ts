// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import shared types
import '../_shared/types.ts'

Deno.serve(async (req: Request): Promise<Response> => {
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
        // Get JWT from Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Authorization header is required');
        }

        const jwt = authHeader.replace('Bearer ', '');
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Create client with user's JWT for RLS compliance
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }
        });

        // Validate user authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
        if (authError || !user) {
            throw new Error('Invalid or expired token');
        }

        const { fileData, fileName, documentType, customerId, shipmentId, mimeType: explicitMimeType } = await req.json();

        if (!fileData || !fileName || !documentType || !customerId) {
            throw new Error('File data, filename, document type, and customer ID are required');
        }

        // Verify user has access to this customer account (RLS will handle this)
        const { data: customerAccount, error: customerError } = await supabase
            .from('customer_accounts')
            .select('id')
            .eq('id', customerId)
            .eq('user_id', user.id)
            .single();

        if (customerError || !customerAccount) {
            throw new Error('Access denied: Invalid customer ID or insufficient permissions');
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

        // Upload to Supabase Storage using service role for storage operations only
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/customer-documents/${uniqueFileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': finalMimeType,
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

        // Save document metadata to database using user's JWT (RLS will apply)
        const { data: documentData, error: insertError } = await supabase
            .from('customer_documents')
            .insert({
                customer_id: customerId,
                document_type: documentType,
                document_name: fileName,
                file_url: publicUrl,
                file_size: binaryData.length,
                mime_type: finalMimeType,
                associated_shipment_id: shipmentId || null
            })
            .select()
            .single();

        if (insertError) {
            throw new Error(`Database insert failed: ${insertError.message}`);
        }

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                document: documentData
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
