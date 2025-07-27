import { useState, useEffect } from 'react'
import { Package, Truck, CheckCircle, Clock, MapPin, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Link } from 'react-router-dom'

interface CustomerOverviewProps {
  customerAccount: any
}

export default function CustomerOverview({ customerAccount }: CustomerOverviewProps) {
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeShipments: 0,
    deliveredShipments: 0,
    pendingBookings: 0
  })
  const [recentShipments, setRecentShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (customerAccount) {
      loadOverviewData()
    }
  }, [customerAccount])

  const loadOverviewData = async () => {
    try {
      // Get customer email from user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email || !customerAccount) return

      // Load shipments
      const { data: shipments } = await supabase
        .from('shipments')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false })
        .limit(5)

      // Load pending bookings
      let pendingBookingsCount = 0
      try {
        const { data: bookingsData } = await supabase.functions.invoke('service-booking-system', {
          body: {
            action: 'get_customer_bookings',
            bookingData: {
              customerId: customerAccount.id
            }
          }
        })
        
        if (bookingsData?.data) {
          pendingBookingsCount = bookingsData.data.filter((booking: any) => booking.status === 'pending').length
        }
      } catch (bookingsError) {
        console.error('Error loading bookings:', bookingsError)
      }

      if (shipments) {
        setRecentShipments(shipments)
        
        // Calculate stats
        const total = shipments.length
        const active = shipments.filter(s => ['received', 'processing', 'shipped'].includes(s.status)).length
        const delivered = shipments.filter(s => s.status === 'delivered').length
        
        setStats({
          totalShipments: total,
          activeShipments: active,
          deliveredShipments: delivered,
          pendingBookings: pendingBookingsCount
        })
      }
    } catch (error) {
      console.error('Error loading overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />
      case 'received':
      case 'processing':
        return <Package className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50'
      case 'shipped':
        return 'text-blue-600 bg-blue-50'
      case 'received':
      case 'processing':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {customerAccount?.full_name || 'Customer'}!
        </h2>
        <p className="text-gray-600">
          Manage your shipments, track packages, and schedule services all in one place.
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
              <p className="text-sm font-medium text-gray-600">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalShipments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeShipments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.deliveredShipments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Shipments</h3>
          <Link 
            to="/customer/dashboard/shipments" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>
        
        {recentShipments.length > 0 ? (
          <div className="space-y-4">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(shipment.status)}
                    <div>
                      <p className="font-semibold text-gray-900">{shipment.tracking_number}</p>
                      <p className="text-sm text-gray-600">To: {shipment.destination_country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                      {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No shipments yet</p>
            <p className="text-sm text-gray-400">Your packages will appear here once they're processed</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/tracking"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="h-6 w-6 text-blue-600" />
            <span className="font-medium text-gray-900">Track Package</span>
          </Link>
          
          <Link
            to="/customer/dashboard/bookings"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-6 w-6 text-green-600" />
            <span className="font-medium text-gray-900">Book Service</span>
          </Link>
          
          <Link
            to="/customer/dashboard/addresses"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MapPin className="h-6 w-6 text-purple-600" />
            <span className="font-medium text-gray-900">Manage Addresses</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
