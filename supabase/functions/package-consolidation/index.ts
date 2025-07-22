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

        const { action, consolidationData } = await req.json();

        if (!action) {
            throw new Error('Action is required');
        }

        let result = {};

        switch (action) {
            case 'create_consolidation_request':
                // Create new consolidation request
                const createResponse = await fetch(`${supabaseUrl}/rest/v1/consolidation_requests`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        customer_id: consolidationData.customerId,
                        destination_country: consolidationData.destinationCountry,
                        special_instructions: consolidationData.specialInstructions
                    })
                });

                if (!createResponse.ok) {
                    const errorText = await createResponse.text();
                    throw new Error(`Failed to create consolidation request: ${errorText}`);
                }

                result = await createResponse.json();
                break;

            case 'add_package_to_consolidation':
                // Add package to consolidation request
                const addPackageResponse = await fetch(`${supabaseUrl}/rest/v1/consolidation_items`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        consolidation_request_id: consolidationData.consolidationRequestId,
                        shipment_id: consolidationData.shipmentId,
                        package_description: consolidationData.packageDescription,
                        weight_lbs: consolidationData.weightLbs,
                        dimensions: consolidationData.dimensions
                    })
                });

                if (!addPackageResponse.ok) {
                    const errorText = await addPackageResponse.text();
                    throw new Error(`Failed to add package to consolidation: ${errorText}`);
                }

                // Update consolidation request totals
                await updateConsolidationTotals(consolidationData.consolidationRequestId, supabaseUrl, serviceRoleKey);

                result = await addPackageResponse.json();
                break;

            case 'remove_package_from_consolidation':
                // Remove package from consolidation
                const removeResponse = await fetch(`${supabaseUrl}/rest/v1/consolidation_items?id=eq.${consolidationData.itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!removeResponse.ok) {
                    const errorText = await removeResponse.text();
                    throw new Error(`Failed to remove package from consolidation: ${errorText}`);
                }

                // Update consolidation request totals
                await updateConsolidationTotals(consolidationData.consolidationRequestId, supabaseUrl, serviceRoleKey);

                result = { success: true };
                break;

            case 'get_customer_consolidations':
                // Get customer's consolidation requests with items
                const consolidationsResponse = await fetch(`${supabaseUrl}/rest/v1/consolidation_requests?customer_id=eq.${consolidationData.customerId}&order=created_at.desc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (consolidationsResponse.ok) {
                    const consolidations = await consolidationsResponse.json();
                    
                    // Get items for each consolidation
                    for (let consolidation of consolidations) {
                        const itemsResponse = await fetch(`${supabaseUrl}/rest/v1/consolidation_items?consolidation_request_id=eq.${consolidation.id}`, {
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey
                            }
                        });
                        
                        if (itemsResponse.ok) {
                            consolidation.items = await itemsResponse.json();
                        } else {
                            consolidation.items = [];
                        }
                    }
                    
                    result = consolidations;
                } else {
                    result = [];
                }
                break;

            case 'get_available_packages':
                // Get customer's packages available for consolidation
                const packagesResponse = await fetch(`${supabaseUrl}/rest/v1/shipments?customer_email=eq.${consolidationData.customerEmail}&status=eq.received&order=created_at.desc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (packagesResponse.ok) {
                    let packages = await packagesResponse.json();
                    
                    // Filter out packages already in consolidation
                    const consolidatedPackagesResponse = await fetch(`${supabaseUrl}/rest/v1/consolidation_items?select=shipment_id`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    });
                    
                    if (consolidatedPackagesResponse.ok) {
                        const consolidatedPackages = await consolidatedPackagesResponse.json();
                        const consolidatedIds = consolidatedPackages.map(item => item.shipment_id);
                        packages = packages.filter(pkg => !consolidatedIds.includes(pkg.id));
                    }
                    
                    result = packages;
                } else {
                    result = [];
                }
                break;

            case 'calculate_savings':
                // Calculate potential savings from consolidation
                const { packages } = consolidationData;
                
                // Individual shipping costs (estimated)
                const individualCost = packages.length * 45; // $45 per package
                
                // Consolidated shipping cost (estimated)
                const totalWeight = packages.reduce((sum, pkg) => sum + (pkg.weight_lbs || 5), 0);
                const consolidatedCost = Math.max(35, totalWeight * 3); // $35 minimum or $3 per lb
                
                const savings = individualCost - consolidatedCost;
                
                result = {
                    individualCost,
                    consolidatedCost,
                    savings,
                    savingsPercentage: Math.round((savings / individualCost) * 100)
                };
                break;

            case 'update_consolidation_status':
                // Update consolidation status (for staff)
                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/consolidation_requests?id=eq.${consolidationData.consolidationId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        status: consolidationData.status,
                        consolidated_shipment_id: consolidationData.consolidatedShipmentId,
                        updated_at: new Date().toISOString()
                    })
                });

                if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    throw new Error(`Failed to update consolidation status: ${errorText}`);
                }

                result = await updateResponse.json();
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
        console.error('Package consolidation error:', error);

        const errorResponse = {
            error: {
                code: 'CONSOLIDATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to update consolidation totals
async function updateConsolidationTotals(consolidationId, supabaseUrl, serviceRoleKey) {
    try {
        // Get all items in this consolidation
        const itemsResponse = await fetch(`${supabaseUrl}/rest/v1/consolidation_items?consolidation_request_id=eq.${consolidationId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });
        
        if (itemsResponse.ok) {
            const items = await itemsResponse.json();
            const totalPackages = items.length;
            const totalWeight = items.reduce((sum, item) => sum + (item.weight_lbs || 0), 0);
            
            // Calculate estimated savings
            const individualCost = totalPackages * 45;
            const consolidatedCost = Math.max(35, totalWeight * 3);
            const estimatedSavings = individualCost - consolidatedCost;
            
            // Update consolidation request
            await fetch(`${supabaseUrl}/rest/v1/consolidation_requests?id=eq.${consolidationId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    total_packages: totalPackages,
                    total_weight: totalWeight,
                    estimated_savings: estimatedSavings,
                    updated_at: new Date().toISOString()
                })
            });
        }
    } catch (error) {
        console.error('Error updating consolidation totals:', error);
    }
}