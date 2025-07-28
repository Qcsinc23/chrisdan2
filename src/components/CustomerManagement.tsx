import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface Customer {
  id: string
  user_id: string
  full_name: string
  phone: string
  created_at: string
  updated_at: string
  email?: string
  total_shipments?: number
  total_bookings?: number
  total_spent?: number
  last_activity?: string
  status?: string
}

interface CustomerDetails {
  customer: Customer
  addresses: any[]
  shipments: any[]
  bookings: any[]
  documents: any[]
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      
      // Get customers with their auth user data
      const { data: customersData, error: customersError } = await supabase
        .from('customer_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (customersError) throw customersError

      // Get auth users to get email addresses
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
      
      if (usersError) {
        console.error('Error getting auth users:', usersError)
      }

      // Combine customer data with auth data
      const enrichedCustomers = customersData?.map(customer => {
        const authUser = users?.find(user => user.id === customer.user_id)
        return {
          ...customer,
          email: authUser?.email || 'No email',
          status: authUser ? 'active' : 'inactive'
        }
      }) || []

      // Get additional stats for each customer
      const customersWithStats = await Promise.all(
        enrichedCustomers.map(async (customer) => {
          try {
            // Get shipment count
            const { data: shipments } = await supabase
              .from('shipments')
              .select('id')
              .eq('customer_email', customer.email)

            // Get booking count using service-booking-system function
            const { data: bookingsResult } = await supabase.functions.invoke('service-booking-system', {
              body: {
                action: 'get_customer_bookings',
                bookingData: { customerId: customer.id }
              }
            })

            return {
              ...customer,
              total_shipments: shipments?.length || 0,
              total_bookings: bookingsResult?.data?.length || 0,
              total_spent: (shipments?.length || 0) * 50 + (bookingsResult?.data?.length || 0) * 30, // Estimated
              last_activity: customer.updated_at
            }
          } catch (error) {
            console.error('Error getting customer stats:', error)
            return {
              ...customer,
              total_shipments: 0,
              total_bookings: 0,
              total_spent: 0,
              last_activity: customer.updated_at
            }
          }
        })
      )

      setCustomers(customersWithStats)
    } catch (error: any) {
      console.error('Error loading customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const loadCustomerDetails = async (customer: Customer) => {
    try {
      setLoading(true)

      // Get customer addresses
      const { data: addresses } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', customer.id)

      // Get customer shipments
      const { data: shipments } = await supabase
        .from('shipments')
        .select('*')
        .eq('customer_email', customer.email)
        .order('created_at', { ascending: false })
        .limit(10)

      // Get customer bookings
      const { data: bookingsResult } = await supabase.functions.invoke('service-booking-system', {
        body: {
          action: 'get_customer_bookings',
          bookingData: { customerId: customer.id }
        }
      })

      // Get customer documents
      const { data: documents } = await supabase
        .from('customer_documents')
        .select('*')
        .eq('customer_id', customer.id)
        .order('upload_date', { ascending: false })

      const customerDetails: CustomerDetails = {
        customer,
        addresses: addresses || [],
        shipments: shipments || [],
        bookings: bookingsResult?.data || [],
        documents: documents || []
      }

      setSelectedCustomer(customerDetails)
      setShowDetails(true)
    } catch (error: any) {
      console.error('Error loading customer details:', error)
      toast.error('Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && !showDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
            <p className="text-gray-600">Manage customer accounts, view details, and track activity</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadCustomers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.reduce((sum, c) => sum + (c.total_shipments || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${customers.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {customer.full_name || 'No name'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {customer.id.slice(0, 8)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-2" />
                        {customer.phone || 'No phone'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>{customer.total_shipments || 0} shipments</div>
                      <div>{customer.total_bookings || 0} bookings</div>
                      <div className="text-gray-500">${customer.total_spent || 0} spent</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status || 'inactive')}`}>
                      {customer.status || 'inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => loadCustomerDetails(customer)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 mr-3">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No customers found</p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Customer Details: {selectedCustomer.customer.full_name}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{selectedCustomer.customer.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{selectedCustomer.customer.phone || 'No phone'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Account Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Shipments:</span>
                      <span className="text-sm font-medium">{selectedCustomer.shipments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bookings:</span>
                      <span className="text-sm font-medium">{selectedCustomer.bookings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Documents:</span>
                      <span className="text-sm font-medium">{selectedCustomer.documents.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Addresses ({selectedCustomer.addresses.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCustomer.addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium capitalize">{address.address_type}</span>
                        {address.is_default && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.street_address}<br />
                        {address.city}, {address.state_province} {address.postal_code}<br />
                        {address.country}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Shipments */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Shipments</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCustomer.shipments.slice(0, 5).map((shipment) => (
                      <div key={shipment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium">{shipment.tracking_number}</div>
                          <div className="text-xs text-gray-500">{shipment.destination_country}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          shipment.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {shipment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Bookings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Bookings</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCustomer.bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium capitalize">{booking.service_type?.replace('_', ' ')}</div>
                          <div className="text-xs text-gray-500">{new Date(booking.booking_date).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
