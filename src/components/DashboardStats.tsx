import { useState, useEffect } from 'react'
import { Package, TrendingUp, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface Stats {
  total_shipments: number
  pending_shipments: number
  shipped_today: number
  delivered_this_week: number
  active_customers: number
  average_delivery_time: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    
    try {
      // Get basic shipment stats
      const { data, error } = await supabase.functions.invoke('get-staff-shipments', {
        body: {
          status_filter: 'all',
          search_term: '',
          limit: 1000,
          offset: 0
        }
      })

      if (error) {
        throw error
      }

      if (data?.error) {
        throw new Error(data.error.message)
      }

      const shipmentStats = data.data.stats || {}
      
      // Calculate additional stats
      const today = new Date()
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      // For demo purposes, we'll calculate some basic stats
      // In a real app, these would come from the backend
      const calculatedStats: Stats = {
        total_shipments: shipmentStats.total || 0,
        pending_shipments: (shipmentStats.pending || 0) + (shipmentStats.received || 0) + (shipmentStats.processing || 0),
        shipped_today: Math.floor((shipmentStats.shipped || 0) * 0.1), // Estimate
        delivered_this_week: shipmentStats.delivered || 0,
        active_customers: Math.floor((shipmentStats.total || 0) * 0.7), // Estimate
        average_delivery_time: 8 // Estimated days
      }

      setStats(calculatedStats)

    } catch (err: any) {
      console.error('Load stats error:', err)
      toast.error('Failed to load dashboard statistics')
      
      // Fallback stats
      setStats({
        total_shipments: 0,
        pending_shipments: 0,
        shipped_today: 0,
        delivered_this_week: 0,
        active_customers: 0,
        average_delivery_time: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 font-medium">Unable to load statistics</span>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Shipments',
      value: stats.total_shipments.toLocaleString(),
      icon: Package,
      color: 'blue',
      description: 'All time shipments'
    },
    {
      title: 'Pending Shipments',
      value: stats.pending_shipments.toLocaleString(),
      icon: Clock,
      color: 'yellow',
      description: 'Awaiting processing'
    },
    {
      title: 'Shipped Today',
      value: stats.shipped_today.toLocaleString(),
      icon: TrendingUp,
      color: 'indigo',
      description: 'Packages sent today'
    },
    {
      title: 'Delivered This Week',
      value: stats.delivered_this_week.toLocaleString(),
      icon: CheckCircle,
      color: 'green',
      description: 'Completed deliveries'
    },
    {
      title: 'Active Customers',
      value: stats.active_customers.toLocaleString(),
      icon: Users,
      color: 'purple',
      description: 'Regular customers'
    },
    {
      title: 'Avg. Delivery Time',
      value: `${stats.average_delivery_time} days`,
      icon: Clock,
      color: 'gray',
      description: 'Average transit time'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          icon: 'text-blue-600',
          text: 'text-blue-900'
        }
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          icon: 'text-yellow-600',
          text: 'text-yellow-900'
        }
      case 'indigo':
        return {
          bg: 'bg-indigo-50',
          icon: 'text-indigo-600',
          text: 'text-indigo-900'
        }
      case 'green':
        return {
          bg: 'bg-green-50',
          icon: 'text-green-600',
          text: 'text-green-900'
        }
      case 'purple':
        return {
          bg: 'bg-purple-50',
          icon: 'text-purple-600',
          text: 'text-purple-900'
        }
      default:
        return {
          bg: 'bg-gray-50',
          icon: 'text-gray-600',
          text: 'text-gray-900'
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <button
          onClick={loadStats}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Package className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          const colors = getColorClasses(card.color)
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className={`text-3xl font-bold ${colors.text}`}>
                    {card.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {card.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${colors.bg}`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group">
            <Package className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
            <span className="text-gray-600 group-hover:text-blue-600 font-medium">Scan Package</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group">
            <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
            <span className="text-gray-600 group-hover:text-green-600 font-medium">View Reports</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group">
            <Users className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
            <span className="text-gray-600 group-hover:text-purple-600 font-medium">Manage Customers</span>
          </button>
        </div>
      </div>
    </div>
  )
}