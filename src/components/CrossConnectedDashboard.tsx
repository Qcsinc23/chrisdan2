import { useState, useEffect } from 'react'
import { 
    Package, 
    Users, 
    BarChart3, 
    Clock, 
    DollarSign,
    TrendingUp,
    CheckCircle,
    Eye
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

interface CrossConnectedDashboardProps {
    userType: 'customer' | 'staff' | 'business'
    userId?: string
}

interface DashboardStats {
    total: number
    active: number
    completed: number
    pending: number
    revenue: number
    satisfaction: number
}

interface RecentActivity {
    id: string
    tracking_number: string
    customer_name: string
    status: string
    type: string
    priority: number
    created_at: string
    assigned_staff?: string
    estimated_revenue?: number
}

export default function CrossConnectedDashboard({ userType, userId }: CrossConnectedDashboardProps) {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        total: 0,
        active: 0,
        completed: 0,
        pending: 0,
        revenue: 0,
        satisfaction: 0
    })
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
    const [businessInsights, setBusinessInsights] = useState<any>(null)

    useEffect(() => {
        loadDashboardData()
    }, [userType, userId])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            
            // Load existing shipments data as fallback
            await loadShipmentsData()
            
            // Try to load cross-connected data if available
            await loadCrossConnectedData()
            
        } catch (error) {
            console.error('Error loading dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadShipmentsData = async () => {
        try {
            let query = supabase.from('shipments').select('*')
            
            if (userType === 'customer' && userId) {
                // For customers, filter by their email or customer_id if available
                const { data: { user } } = await supabase.auth.getUser()
                if (user?.email) {
                    query = query.eq('customer_email', user.email)
                }
            }
            
            const { data, error } = await query.order('created_at', { ascending: false }).limit(10)
            
            if (error) {
                console.warn('Shipments query error:', error.message)
                return
            }

            // Calculate stats from shipments
            const total = data?.length || 0
            const active = data?.filter(s => ['received', 'processing', 'shipped'].includes(s.status)).length || 0
            const completed = data?.filter(s => s.status === 'delivered').length || 0
            const pending = data?.filter(s => s.status === 'pending').length || 0
            const revenue = data?.reduce((sum, s) => sum + (s.total_cost || 0), 0) || 0

            setStats({
                total,
                active,
                completed,
                pending,
                revenue,
                satisfaction: 4.5 // Placeholder
            })

            // Map shipments to activity format
            setRecentActivity(data?.map(s => ({
                id: s.id,
                tracking_number: s.tracking_number,
                customer_name: s.customer_name,
                status: s.status,
                type: 'shipment',
                priority: 3, // Default priority
                created_at: s.created_at,
                estimated_revenue: s.total_cost
            })) || [])

        } catch (error) {
            console.warn('Error loading shipments data:', error)
        }
    }

    const loadCrossConnectedData = async () => {
        try {
            // Try to load from workflow_instances if available
            const { data: workflowData, error: workflowError } = await supabase
                .from('workflow_instances')
                .select('*')
                .limit(10)

            if (!workflowError && workflowData) {
                // Update with cross-connected data
                const total = workflowData.length
                const active = workflowData.filter(w => ['intake', 'assigned', 'processing'].includes(w.workflow_status)).length
                const completed = workflowData.filter(w => w.workflow_status === 'completed').length
                const pending = workflowData.filter(w => w.workflow_status === 'pending').length

                setStats(prev => ({
                    ...prev,
                    total: total || prev.total,
                    active: active || prev.active,
                    completed: completed || prev.completed,
                    pending: pending || prev.pending
                }))

                // Map workflow data to activity format
                const workflowActivity = workflowData.map(w => ({
                    id: w.id,
                    tracking_number: w.tracking_number,
                    customer_name: 'Customer', // Would need join for actual name
                    status: w.workflow_status,
                    type: w.workflow_type,
                    priority: w.priority_level,
                    created_at: w.created_at,
                    estimated_revenue: w.estimated_revenue
                }))

                setRecentActivity(prev => workflowActivity.length > 0 ? workflowActivity : prev)
            }

            // Try to load business insights if available
            if (userType === 'business') {
                try {
                    const { data: insights, error: insightsError } = await supabase.functions.invoke('workflow-orchestrator', {
                        body: { action: 'get_business_insights' }
                    })

                    if (!insightsError && insights?.data) {
                        setBusinessInsights(insights.data)
                    }
                } catch (insightsError) {
                    console.warn('Business insights not available yet')
                }
            }

        } catch (error) {
            console.warn('Cross-connected data not available yet:', error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'delivered': return 'text-green-600 bg-green-50'
            case 'processing': return 'text-blue-600 bg-blue-50'
            case 'pending': return 'text-yellow-600 bg-yellow-50'
            case 'intake': return 'text-gray-600 bg-gray-50'
            case 'assigned': return 'text-purple-600 bg-purple-50'
            case 'shipped': return 'text-indigo-600 bg-indigo-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'text-red-600 bg-red-50'
            case 2: return 'text-orange-600 bg-orange-50'
            case 3: return 'text-yellow-600 bg-yellow-50'
            case 4: return 'text-blue-600 bg-blue-50'
            case 5: return 'text-green-600 bg-green-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {userType === 'customer' ? 'My Dashboard' : 
                     userType === 'staff' ? 'Staff Dashboard' : 'Business Dashboard'}
                </h2>
                <p className="text-gray-600">
                    {userType === 'customer' ? 'Track your shipments and manage your account' :
                     userType === 'staff' ? 'Manage customer requests and track performance' :
                     'Monitor business performance and customer insights'}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total {userType === 'business' ? 'Workflows' : 'Shipments'}</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Insights for Business Users */}
            {userType === 'business' && businessInsights && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            Daily Revenue
                        </h3>
                        <div className="space-y-2">
                            {businessInsights.daily_revenue?.slice(0, 7).map((day: any) => (
                                <div key={day.date} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">{day.date}</span>
                                    <span className="text-sm font-semibold">${day.daily_revenue}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Users className="h-5 w-5 mr-2" />
                            Top Staff
                        </h3>
                        <div className="space-y-2">
                            {businessInsights.staff_performance?.slice(0, 5).map((staff: any) => (
                                <div key={staff.staff_email} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 truncate">{staff.staff_email}</span>
                                    <span className="text-sm font-semibold">${staff.total_revenue_generated}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2" />
                            Customer Insights
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Customers</span>
                                <span className="text-sm font-semibold">{businessInsights.summary?.total_customers || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Avg Satisfaction</span>
                                <span className="text-sm font-semibold">{(businessInsights.summary?.avg_satisfaction || 0).toFixed(1)}/5</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Eye className="h-5 w-5 mr-2" />
                        Recent Activity
                    </h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tracking
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentActivity.map((activity) => (
                                <tr key={activity.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {activity.tracking_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {activity.customer_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {activity.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                                            {activity.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(activity.priority)}`}>
                                            P{activity.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(activity.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {recentActivity.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    )
}
