import { useState } from 'react'
import { Package, Users, BarChart3, Settings, Bell, Calendar } from 'lucide-react'
import DashboardStats from '@/components/DashboardStats'
import ShipmentsList from '@/components/ShipmentsList'
import BarcodeScanner from '@/components/BarcodeScanner'
import { useAuth } from '@/contexts/AuthContext'

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const { user } = useAuth()

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'shipments', label: 'All Shipments', icon: Package },
    { id: 'scanner', label: 'Barcode Scanner', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <DashboardStats />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Shipments</h3>
              <ShipmentsList limit={10} showActions={true} />
            </div>
          </div>
        )
      case 'shipments':
        return <ShipmentsList showActions={true} />
      case 'scanner':
        return <BarcodeScanner />
      case 'customers':
        return (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Management</h3>
            <p className="text-gray-500 mb-4">Customer management features coming soon</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View Customer Database
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.email || 'Staff Member'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Calendar className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  )
}
