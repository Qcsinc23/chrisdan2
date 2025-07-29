// Cross-connected workflow orchestrator
// Unifies customer, staff, and business operations in real-time

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
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const { 
            action, 
            trackingNumber, 
            customerId, 
            staffId, 
            workflowType = 'shipment',
            priorityLevel = 3,
            estimatedRevenue = 0,
            sourceChannel = 'customer_portal',
            messageContent,
            messageType = 'status_update',
            channel = 'in_app'
        } = await req.json();

        let result;
        
        switch (action) {
            case 'create_workflow':
                result = await createWorkflow({
                    trackingNumber,
                    customerId,
                    workflowType,
                    priorityLevel,
                    estimatedRevenue,
                    sourceChannel,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'assign_staff':
                result = await assignStaff({
                    trackingNumber,
                    staffId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'update_status':
                result = await updateWorkflowStatus({
                    trackingNumber,
                    newStatus: messageContent,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'send_communication':
                result = await sendCommunication({
                    trackingNumber,
                    participantType: 'customer',
                    participantId: customerId,
                    messageContent,
                    messageType,
                    channel,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'get_unified_timeline':
                result = await getUnifiedTimeline({
                    trackingNumber,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'get_business_insights':
                result = await getBusinessInsights({
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            default:
                throw new Error('Invalid action specified');
        }

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Workflow orchestrator error:', error);

        const errorResponse = {
            error: {
                code: 'WORKFLOW_ORCHESTRATOR_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Create new workflow instance
async function createWorkflow({ trackingNumber, customerId, workflowType, priorityLevel, estimatedRevenue, sourceChannel, supabaseUrl, serviceRoleKey }) {
    const response = await fetch(`${supabaseUrl}/rest/v1/workflow_instances`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            tracking_number: trackingNumber,
            customer_id: customerId,
            workflow_type: workflowType,
            priority_level: priorityLevel,
            estimated_revenue: estimatedRevenue,
            source_channel: sourceChannel,
            workflow_status: 'intake',
            intake_at: new Date().toISOString(),
            is_customer_notified: true,
            is_staff_notified: false,
            is_business_updated: false
        })
    });

    if (!response.ok) {
        throw new Error('Failed to create workflow instance');
    }

    const workflow = await response.json();

    // Send initial customer notification
    await sendCommunication({
        trackingNumber,
        participantType: 'customer',
        participantId: customerId,
        messageContent: `Your ${workflowType} request has been received. Tracking: ${trackingNumber}`,
        messageType: 'status_update',
        channel: 'email',
        supabaseUrl,
        serviceRoleKey
    });

    return {
        data: {
            workflow: workflow[0],
            message: 'Workflow created successfully with cross-connection'
        }
    };
}

// Assign staff to workflow
async function assignStaff({ trackingNumber, staffId, supabaseUrl, serviceRoleKey }) {
    // Update workflow instance
    const response = await fetch(`${supabaseUrl}/rest/v1/workflow_instances?tracking_number=eq.${trackingNumber}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            assigned_staff_id: staffId,
            assigned_at: new Date().toISOString(),
            workflow_status: 'assigned',
            is_staff_notified: true
        })
    });

    if (!response.ok) {
        throw new Error('Failed to assign staff');
    }

    // Get workflow details
    const workflowResponse = await fetch(`${supabaseUrl}/rest/v1/workflow_instances?tracking_number=eq.${trackingNumber}`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const workflow = await workflowResponse.json();

    // Send staff notification
    await sendCommunication({
        trackingNumber,
        participantType: 'staff',
        participantId: staffId,
        messageContent: `New ${workflow[0].workflow_type} assigned: ${trackingNumber}`,
        messageType: 'alert',
        channel: 'in_app',
        supabaseUrl,
        serviceRoleKey
    });

    return {
        data: {
            workflow: workflow[0],
            message: 'Staff assigned successfully'
        }
    };
}

// Update workflow status
async function updateWorkflowStatus({ trackingNumber, newStatus, supabaseUrl, serviceRoleKey }) {
    const response = await fetch(`${supabaseUrl}/rest/v1/workflow_instances?tracking_number=eq.${trackingNumber}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            workflow_status: newStatus,
            updated_at: new Date().toISOString()
        })
    });

    if (!response.ok) {
        throw new Error('Failed to update workflow status');
    }

    const workflow = await response.json();

    // Send status update communication
    await sendCommunication({
        trackingNumber,
        participantType: 'customer',
        participantId: workflow[0].customer_id,
        messageContent: `Status updated to: ${newStatus}`,
        messageType: 'status_update',
        channel: 'email',
        supabaseUrl,
        serviceRoleKey
    });

    return {
        data: {
            workflow: workflow[0],
            message: 'Status updated successfully'
        }
    };
}

// Send cross-platform communication
async function sendCommunication({ trackingNumber, participantType, participantId, messageContent, messageType, channel, supabaseUrl, serviceRoleKey }) {
    // Get workflow ID
    const workflowResponse = await fetch(`${supabaseUrl}/rest/v1/workflow_instances?tracking_number=eq.${trackingNumber}`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const workflow = await workflowResponse.json();
    const workflowId = workflow[0].id;

    // Create communication thread
    const response = await fetch(`${supabaseUrl}/rest/v1/communication_threads`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            workflow_id: workflowId,
            participant_type: participantType,
            participant_id: participantId,
            message_content: messageContent,
            message_type: messageType,
            channel: channel,
            delivery_status: 'sent',
            created_at: new Date().toISOString()
        })
    });

    if (!response.ok) {
        throw new Error('Failed to send communication');
    }

    const communication = await response.json();

    // Update sync status
    const syncField = participantType === 'customer' ? 'is_customer_synced' : 
                     participantType === 'staff' ? 'is_staff_synced' : 'is_business_synced';

    await fetch(`${supabaseUrl}/rest/v1/workflow_instances?id=eq.${workflowId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            [syncField]: true
        })
    });

    return {
        data: {
            communication: communication[0],
            message: 'Communication sent successfully'
        }
    };
}

// Get unified timeline for all stakeholders
async function getUnifiedTimeline({ trackingNumber, supabaseUrl, serviceRoleKey }) {
    const response = await fetch(`${supabaseUrl}/rest/v1/unified_communication_timeline?tracking_number=eq.${trackingNumber}`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to get unified timeline');
    }

    const timeline = await response.json();

    return {
        data: {
            timeline,
            count: timeline.length
        }
    };
}

// Get business insights dashboard
async function getBusinessInsights({ supabaseUrl, serviceRoleKey }) {
    const [dailyRevenue, staffPerformance, customerInsights] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/daily_revenue_summary`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }).then(r => r.json()),
        
        fetch(`${supabaseUrl}/rest/v1/staff_performance_summary`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }).then(r => r.json()),
        
        fetch(`${supabaseUrl}/rest/v1/customer_insights`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }).then(r => r.json())
    ]);

    return {
        data: {
            daily_revenue: dailyRevenue,
            staff_performance: staffPerformance,
            customer_insights: customerInsights,
            summary: {
                total_workflows: dailyRevenue.reduce((sum, day) => sum + day.total_workflows, 0),
                total_revenue: dailyRevenue.reduce((sum, day) => sum + day.daily_revenue, 0),
                avg_satisfaction: dailyRevenue.reduce((sum, day) => sum + day.avg_satisfaction, 0) / dailyRevenue.length,
                total_customers: customerInsights.length
            }
        }
    };
}
