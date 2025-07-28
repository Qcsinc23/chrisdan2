import { useState, useEffect } from 'react'
import { 
    Package, 
    Users, 
    BarChart3, 
    MessageCircle, 
    Clock, 
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Eye
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

interface UnifiedDashboardProps {
    userType: 'customer' | 'staff' | 'business'
    userId?: string
}

interface WorkflowStats {
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
    workflow_status: string
    workflow_type: string
    priority_level: number
    created_at: string
    assigned_staff?: string
    estimated_revenue?: number
}

interface BusinessInsight {
    daily_revenue: any[]
    staff_performance: any[]
    customer_insights: any[]
    summary: {
        total_workflows: number
        total_revenue: number
        avg_satisfaction: number
        total_customers: number
    }
}

export default function UnifiedDashboard({ userType, userId }: UnifiedDashboardProps) {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<WorkflowStats>({
        total: 0,
        active: 0,
        completed: 0,
        pending: 0,
        revenue: 0,
        satisfaction: 0
    })
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
    const [businessInsights, setBusinessInsights] = useState<BusinessInsight | null>(null)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        loadDashboardData()
    }, [userType, userId])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            
            // Load workflow data based on user type
            await loadWorkflowData()
            
            // Load business insights for business users
            if (userType === 'business') {
                await loadBusinessInsights()
            }
            
        } catch (error) {
            console.error('Error loading dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadWorkflowData = async () => {
        let query = supabase
            .from('workflow_instances')
            .select(`
                *,
                customer_accounts!inner(full_name, email),
                staff_users!inner(email)
            `)
            .order('created_at', { ascending: false })
            .limit(10)

        if (userType === 'customer' && userId) {
            query = query.eq('customer_id', userId)
        } else if (userType === 'staff' && userId) {
            query = query.eq('assigned_staff_id', userId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error loading workflow data:', error)
            return
        }

        // Calculate stats
        const total = data?.length || 0
        const active = data?.filter(w => ['intake', 'assigned', 'processing'].includes(w.workflow_status)).length || 0
        const completed = data?.filter(w => w.workflow_status === 'completed').length || 0
        const pending = data?.filter(w => w.workflow_status === 'pending').length || 0
        const revenue = data?.reduce((sum, w) => sum + (w.actual_revenue || 0), 0) || 0

        setStats({
            total,
            active,
            completed,
            pending,
            revenue,
            satisfaction: 4.5 // Placeholder - would come from business_metrics
        })

        setRecentActivity(data?.map(w => ({
            id: w.id,
            tracking_number: w.tracking_number,
            customer_name: w.customer_accounts?.full_name || 'Unknown',
            workflow_status: w.workflow_status,
            workflow_type: w.workflow_type,
            priority_level: w.priority_level,
            created_at: w.created_at,
            assigned_staff: w.staff_users?.email,
            estimated_revenue: w.estimated_revenue
        })) || [])
    }

    const loadBusinessInsights = async () => {
        const { data, error } = await supabase.functions.invoke('workflow-orchestrator', {
            body: {
                action: 'get_business_insights'
            }
        })

        if (error) {
            console.error('Error loading business insights:', error)
            return
        }

        setBusinessInsights(data.data)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50'
            case 'processing': return 'text-blue-600 bg-blue-50'
            case 'pending': return 'text-yellow-600 bg-yellow-50'
            case 'intake': return 'text-gray-600 bg-gray-50'
            case 'assigned': return 'text-purple-600 bg-purple-50'
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

                {userType === 'business' && (
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
                )}
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
                            {businessInsights.daily_revenue.slice(0, 7).map((day: any) => (
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
                            {businessInsights.staff_performance.slice(0, 5).map((staff: any) => (
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
                                <span className="text-sm font-semibold">{businessInsights.summary.total_customers}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Avg Satisfaction</span>
                                <span className="text-sm font-semibold">{businessInsights.summary.avg_satisfaction.toFixed(1)}/5</span>
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
                                        {activity.workflow_type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.workflow_status)}`}>
                                            {activity.workflow_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(activity.priority_level)}`}>
                                            P{activity.priority_level}
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
