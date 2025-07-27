import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Package, 
  MapPin, 
  Calendar, 
  FileText, 
  MessageCircle,
  Settings,
  Bell,
  CreditCard,
  Archive,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

// Sub-components for different dashboard sections
import CustomerShipments from '@/components/customer/CustomerShipments'
import CustomerAddresses from '@/components/customer/CustomerAddresses'
import CustomerBookings from '@/components/customer/CustomerBookings'
import CustomerDocuments from '@/components/customer/CustomerDocuments'
import CustomerConsolidation from '@/components/customer/CustomerConsolidation'
import CustomerSettings from '@/components/customer/CustomerSettings'
import CustomerOverview from '@/components/customer/CustomerOverview'

export default function CustomerDashboard() {
  const { user, customerAccount, customerLoading, isCustomer } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const path = location.pathname.split('/').pop()
    if (path && ['overview', 'shipments', 'addresses', 'bookings', 'documents', 'consolidation', 'settings'].includes(path)) {
      setActiveTab(path)
    } else {
      setActiveTab('overview')
    }
  }, [location.pathname])

  // Show message if user exists but customer account doesn't, but don't auto-redirect
  useEffect(() => {
    if (user && !customerLoading && !isCustomer && activeTab !== 'settings') {
      toast('Complete your profile to access all customer features', {
        icon: '💡',
        duration: 4000,
      })
    }
  }, [user, isCustomer, customerLoading, activeTab])

  const navigation = [
    { id: 'overview', name: 'Overview', icon: Package, href: '/customer/dashboard' },
    { id: 'shipments', name: 'My Shipments', icon: Package, href: '/customer/dashboard/shipments' },
    { id: 'addresses', name: 'Address Book', icon: MapPin, href: '/customer/dashboard/addresses' },
    { id: 'bookings', name: 'Service Bookings', icon: Calendar, href: '/customer/dashboard/bookings' },
    { id: 'documents', name: 'Documents', icon: FileText, href: '/customer/dashboard/documents' },
    { id: 'consolidation', name: 'Package Consolidation', icon: Archive, href: '/customer/dashboard/consolidation' },
    { id: 'settings', name: 'Account Settings', icon: Settings, href: '/customer/dashboard/settings' }
  ]

  if (customerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show account setup required message
  if (!isCustomer && activeTab !== 'settings') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Setup Required</h2>
              <p className="text-gray-600 mb-6">Please complete your customer profile to access all features</p>
              <Link
                to="/customer/dashboard/settings"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {customerAccount?.full_name || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <MessageCircle className="h-5 w-5" />
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
            
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Shipments</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {customerAccount ? customerAccount.active_shipments || 0 : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Packages</span>
                  <span className="text-sm font-semibold text-green-600">
                    {customerAccount ? customerAccount.total_packages || 0 : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Saved Addresses</span>
                  <span className="text-sm font-semibold text-purple-600">
                    {customerAccount ? customerAccount.saved_addresses || 0 : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<CustomerOverview customerAccount={customerAccount} />} />
              <Route path="/shipments" element={<CustomerShipments customerAccount={customerAccount} />} />
              <Route path="/addresses" element={<CustomerAddresses customerAccount={customerAccount} />} />
              <Route path="/bookings" element={<CustomerBookings customerAccount={customerAccount} />} />
              <Route path="/documents" element={<CustomerDocuments customerAccount={customerAccount} />} />
              <Route path="/consolidation" element={<CustomerConsolidation customerAccount={customerAccount} />} />
              <Route path="/settings" element={<CustomerSettings customerAccount={customerAccount} onAccountUpdate={() => {}} />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}
