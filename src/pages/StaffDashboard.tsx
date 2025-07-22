import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { 
  BarChart3, 
  Package, 
  Scan, 
  Users, 
  Settings, 
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  Truck
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import BarcodeScanner from '@/components/BarcodeScanner'
import ShipmentsList from '@/components/ShipmentsList'
import DashboardStats from '@/components/DashboardStats'
import DeliveryManager from '@/components/DeliveryManager'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function StaffDashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const path = location.pathname.split('/').pop()
    if (path && ['overview', 'scanner', 'shipments', 'deliveries', 'customers', 'reports'].includes(path)) {
      setActiveTab(path)
    } else {
      setActiveTab('overview')
    }
  }, [location.pathname])

  const navigation = [
    { id: 'overview', name: 'Overview', icon: BarChart3, href: '/staff/dashboard' },
    { id: 'scanner', name: 'Barcode Scanner', icon: Scan, href: '/staff/dashboard/scanner' },
    { id: 'shipments', name: 'Shipments', icon: Package, href: '/staff/dashboard/shipments' },
    { id: 'deliveries', name: 'Deliveries', icon: Truck, href: '/staff/dashboard/deliveries' },
    { id: 'customers', name: 'Customers', icon: Users, href: '/staff/dashboard/customers' },
    { id: 'reports', name: 'Reports', icon: Download, href: '/staff/dashboard/reports' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <RefreshCw className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/staff/dashboard/scanner"
                  className="flex items-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Scan className="h-4 w-4" />
                  <span>Scan Package</span>
                </Link>
                <button className="flex items-center space-x-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>New Shipment</span>
                </button>
                <button className="flex items-center space-x-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/scanner" element={<ScannerView />} />
              <Route path="/shipments" element={<ShipmentsView />} />
              <Route path="/deliveries" element={<DeliveriesView />} />
              <Route path="/customers" element={<CustomersView />} />
              <Route path="/reports" element={<ReportsView />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Overview Component
function DashboardOverview() {
  return (
    <div className="space-y-8">
      <DashboardStats />
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Shipments</h2>
        <ShipmentsList limit={10} showActions={false} />
      </div>
    </div>
  )
}

// Scanner View Component
function ScannerView() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Barcode Scanner</h2>
        <BarcodeScanner />
      </div>
    </div>
  )
}

// Shipments View Component
function ShipmentsView() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Shipments</h2>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              <span>New Shipment</span>
            </button>
          </div>
        </div>
        <ShipmentsList showActions={true} />
      </div>
    </div>
  )
}

// Customers View Component
function CustomersView() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Management</h2>
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Customer management features coming soon...</p>
        </div>
      </div>
    </div>
  )
}

// Deliveries View Component
function DeliveriesView() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDeliveries = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          id,
          tracking_number,
          customer_name,
          delivery_address,
          package_description,
          destination_country,
          status
        `)
        .in('status', ['shipped', 'out_for_delivery'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setDeliveries(data || [])
    } catch (error) {
      console.error('Error loading deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeliveries()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return <DeliveryManager deliveries={deliveries} onRefresh={loadDeliveries} />
}

// Reports View Component
function ReportsView() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Reports & Analytics</h2>
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Reports and analytics features coming soon...</p>
        </div>
      </div>
    </div>
  )
}