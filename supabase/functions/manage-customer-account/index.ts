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

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Authorization header required');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;
        const userEmail = userData.email;

        const { action, accountData } = await req.json();

        if (!action) {
            throw new Error('Action is required');
        }

        let result = {};

        switch (action) {
            case 'create_account':
                // Create customer account profile
                const createResponse = await fetch(`${supabaseUrl}/rest/v1/customer_accounts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        full_name: accountData.fullName,
                        phone: accountData.phone,
                        whatsapp_notifications: accountData.whatsappNotifications ?? true,
                        email_notifications: accountData.emailNotifications ?? true,
                        sms_notifications: accountData.smsNotifications ?? false
                    })
                });

                if (!createResponse.ok) {
                    const errorText = await createResponse.text();
                    throw new Error(`Failed to create account: ${errorText}`);
                }

                result = await createResponse.json();
                break;

            case 'get_account':
                // Get customer account details
                const getResponse = await fetch(`${supabaseUrl}/rest/v1/customer_accounts?user_id=eq.${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (getResponse.ok) {
                    const accounts = await getResponse.json();
                    result = accounts[0] || null;
                } else {
                    result = null;
                }
                break;

            case 'update_account':
                // Update customer account
                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/customer_accounts?user_id=eq.${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        ...accountData,
                        updated_at: new Date().toISOString()
                    })
                });

                if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    throw new Error(`Failed to update account: ${errorText}`);
                }

                result = await updateResponse.json();
                break;

            case 'get_addresses':
                // Get customer addresses
                const addressResponse = await fetch(`${supabaseUrl}/rest/v1/customer_addresses?customer_id=eq.${accountData.customerId}&order=is_default.desc,created_at.desc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (addressResponse.ok) {
                    result = await addressResponse.json();
                } else {
                    result = [];
                }
                break;

            case 'add_address':
                // Add new address
                const addAddressResponse = await fetch(`${supabaseUrl}/rest/v1/customer_addresses`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        customer_id: accountData.customerId,
                        address_type: accountData.addressType || 'delivery',
                        street_address: accountData.streetAddress,
                        city: accountData.city,
                        state_province: accountData.stateProvince,
                        postal_code: accountData.postalCode,
                        country: accountData.country,
                        is_default: accountData.isDefault || false
                    })
                });

                if (!addAddressResponse.ok) {
                    const errorText = await addAddressResponse.text();
                    throw new Error(`Failed to add address: ${errorText}`);
                }

                result = await addAddressResponse.json();
                break;

            case 'update_address':
                // Update address
                const updateAddressResponse = await fetch(`${supabaseUrl}/rest/v1/customer_addresses?id=eq.${accountData.addressId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        ...accountData,
                        updated_at: new Date().toISOString()
                    })
                });

                if (!updateAddressResponse.ok) {
                    const errorText = await updateAddressResponse.text();
                    throw new Error(`Failed to update address: ${errorText}`);
                }

                result = await updateAddressResponse.json();
                break;

            case 'delete_address':
                // Delete address
                const deleteAddressResponse = await fetch(`${supabaseUrl}/rest/v1/customer_addresses?id=eq.${accountData.addressId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!deleteAddressResponse.ok) {
                    const errorText = await deleteAddressResponse.text();
                    throw new Error(`Failed to delete address: ${errorText}`);
                }

                result = { success: true };
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
        console.error('Customer account management error:', error);

        const errorResponse = {
            error: {
                code: 'ACCOUNT_MANAGEMENT_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});