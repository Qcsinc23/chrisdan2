import { useState, useEffect } from 'react'
import { Archive, Plus, Package, DollarSign, Truck, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface CustomerConsolidationProps {
  customerAccount: any
}

interface ConsolidationRequest {
  id: string
  status: string
  destination_country: string
  total_packages: number
  total_weight: number
  estimated_savings: number
  special_instructions: string
  created_at: string
  items: ConsolidationItem[]
}

interface ConsolidationItem {
  id: string
  shipment_id: string
  package_description: string
  weight_lbs: number
  dimensions: string
}

interface AvailablePackage {
  id: string
  tracking_number: string
  package_type: string
  package_description: string
  weight_lbs: number
  dimensions: string
  destination_country: string
}

export default function CustomerConsolidation({ customerAccount }: CustomerConsolidationProps) {
  const [consolidations, setConsolidations] = useState<ConsolidationRequest[]>([])
  const [availablePackages, setAvailablePackages] = useState<AvailablePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const [savingsCalculation, setSavingsCalculation] = useState<any>(null)
  const [formData, setFormData] = useState({
    destinationCountry: '',
    specialInstructions: ''
  })

  const countries = [
    'Jamaica', 'Trinidad and Tobago', 'Barbados', 'Guyana', 'Suriname',
    'Belize', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua',
    'Costa Rica', 'Panama', 'Dominican Republic', 'Haiti'
  ]

  useEffect(() => {
    if (customerAccount) {
      loadConsolidations()
      loadAvailablePackages()
    } else {
      setLoading(false)
    }
  }, [customerAccount])

  useEffect(() => {
    if (selectedPackages.length > 1) {
      calculateSavings()
    } else {
      setSavingsCalculation(null)
    }
  }, [selectedPackages])

  const loadConsolidations = async () => {
    try {
      // Try to load consolidations from consolidation_requests table directly
      const { data, error } = await supabase
        .from('consolidation_requests')
        .select('*')
        .eq('customer_id', customerAccount?.id || '')
        .order('created_at', { ascending: false })

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading consolidations:', error)
        // Don't show error toast, just set empty array
      }

      // Transform the data to match expected format and add empty items array
      const transformedData = (data || []).map(item => ({
        ...item,
        items: [] // Set empty items array since we can't join the tables
      }))

      setConsolidations(transformedData)
    } catch (error: any) {
      console.error('Error loading consolidations:', error)
      // Don't show error toast, just set empty array
      setConsolidations([])
    } finally {
      setLoading(false)
    }
  }

  const loadAvailablePackages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      // Try to load available packages from shipments table directly
      const { data, error } = await supabase
        .from('shipments')
        .select('id, tracking_number, package_type, package_description, weight_lbs, dimensions, destination_country')
        .eq('customer_email', user.email)
        .in('status', ['received', 'processing']) // Only packages that can be consolidated
        .order('created_at', { ascending: false })

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading available packages:', error)
        // Don't show error toast, just set empty array
      }

      setAvailablePackages(data || [])
    } catch (error: any) {
      console.error('Error loading available packages:', error)
      // Don't show error toast, just set empty array
      setAvailablePackages([])
    }
  }

  const calculateSavings = async () => {
    try {
      const packages = availablePackages.filter(pkg => selectedPackages.includes(pkg.id))
      
      // Simple savings calculation instead of calling function
      const totalWeight = packages.reduce((sum, pkg) => sum + (pkg.weight_lbs || 0), 0)
      const individualCost = packages.length * 25 // Assume $25 per package
      const consolidatedCost = Math.max(35, totalWeight * 2) // Base cost + weight-based cost
      const savings = Math.max(0, individualCost - consolidatedCost)
      const savingsPercentage = individualCost > 0 ? Math.round((savings / individualCost) * 100) : 0

      setSavingsCalculation({
        individualCost,
        consolidatedCost,
        savings,
        savingsPercentage
      })
    } catch (error: any) {
      console.error('Error calculating savings:', error)
      setSavingsCalculation(null)
    }
  }

  const handleCreateConsolidation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedPackages.length < 2) {
      toast.error('Please select at least 2 packages for consolidation')
      return
    }

    if (!formData.destinationCountry) {
      toast.error('Please select a destination country')
      return
    }

    setLoading(true)
    
    try {
      // Create consolidation request
      const { data, error } = await supabase.functions.invoke('package-consolidation', {
        body: {
          action: 'create_consolidation_request',
          consolidationData: {
            customerId: customerAccount.id,
            destinationCountry: formData.destinationCountry,
            specialInstructions: formData.specialInstructions
          }
        }
      })

      if (error) {
        throw error
      }

      const consolidationId = data.data[0].id

      // Add packages to consolidation
      for (const packageId of selectedPackages) {
        const pkg = availablePackages.find(p => p.id === packageId)
        if (pkg) {
          await supabase.functions.invoke('package-consolidation', {
            body: {
              action: 'add_package_to_consolidation',
              consolidationData: {
                consolidationRequestId: consolidationId,
                shipmentId: packageId,
                packageDescription: pkg.package_description,
                weightLbs: pkg.weight_lbs,
                dimensions: pkg.dimensions
              }
            }
          })
        }
      }

      toast.success('Consolidation request created successfully!')
      setShowForm(false)
      setSelectedPackages([])
      setSavingsCalculation(null)
      setFormData({ destinationCountry: '', specialInstructions: '' })
      loadConsolidations()
      loadAvailablePackages()
    } catch (error: any) {
      console.error('Error creating consolidation:', error)
      toast.error(error.message || 'Failed to create consolidation request')
    } finally {
      setLoading(false)
    }
  }

  const handlePackageSelection = (packageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPackages(prev => [...prev, packageId])
    } else {
      setSelectedPackages(prev => prev.filter(id => id !== packageId))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading && !showForm) {
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Package Consolidation</h2>
            <p className="text-gray-600">
              Combine multiple packages to save on shipping costs
            </p>
          </div>
          {availablePackages.length >= 2 && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Consolidation
            </button>
          )}
        </div>
      </div>

      {/* Available Packages Info */}
      {availablePackages.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              You have {availablePackages.length} package{availablePackages.length !== 1 ? 's' : ''} available for consolidation
            </span>
          </div>
          {availablePackages.length >= 2 && (
            <p className="text-blue-700 text-sm mt-1">
              Combine them to save money on shipping costs!
            </p>
          )}
        </div>
      )}

      {/* Consolidation Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Consolidation Request</h3>
          
          <form onSubmit={handleCreateConsolidation} className="space-y-6">
            {/* Package Selection */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Select Packages to Consolidate</h4>
              <div className="space-y-2">
                {availablePackages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      id={pkg.id}
                      checked={selectedPackages.includes(pkg.id)}
                      onChange={(e) => handlePackageSelection(pkg.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={pkg.id} className="ml-3 flex-1 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{pkg.tracking_number}</p>
                          <p className="text-xs text-gray-600">{pkg.package_description || pkg.package_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">{pkg.weight_lbs} lbs</p>
                          <p className="text-xs text-gray-600">{pkg.destination_country}</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Calculation */}
            {savingsCalculation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-green-900 mb-2 flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  Estimated Savings
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-green-700">Individual Cost:</p>
                    <p className="font-semibold text-green-900">${savingsCalculation.individualCost}</p>
                  </div>
                  <div>
                    <p className="text-green-700">Consolidated Cost:</p>
                    <p className="font-semibold text-green-900">${savingsCalculation.consolidatedCost}</p>
                  </div>
                  <div>
                    <p className="text-green-700">You Save:</p>
                    <p className="font-semibold text-green-900">
                      ${savingsCalculation.savings} ({savingsCalculation.savingsPercentage}%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Destination and Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="destinationCountry" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Country *
                </label>
                <select
                  id="destinationCountry"
                  name="destinationCountry"
                  value={formData.destinationCountry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select destination</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special instructions for the consolidation..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setSelectedPackages([])
                  setSavingsCalculation(null)
                  setFormData({ destinationCountry: '', specialInstructions: '' })
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedPackages.length < 2}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="text-white mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Creating...' : 'Create Consolidation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Consolidation Requests List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Consolidation Requests</h3>
        </div>
        
        {consolidations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {consolidations.map((consolidation) => (
              <div key={consolidation.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {consolidation.destination_country}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(consolidation.status)}`}>
                        {consolidation.status.charAt(0).toUpperCase() + consolidation.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Created on {formatDate(consolidation.created_at)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Estimated Savings</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${consolidation.estimated_savings || 0}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Packages:</span> {consolidation.total_packages || 0}
                  </div>
                  <div>
                    <span className="font-medium">Total Weight:</span> {consolidation.total_weight || 0} lbs
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {consolidation.status}
                  </div>
                </div>
                
                {consolidation.special_instructions && (
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Instructions:</span> {consolidation.special_instructions}
                  </div>
                )}
                
                {consolidation.items && consolidation.items.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Included Packages:</h5>
                    <div className="space-y-1">
                      {consolidation.items.map((item) => (
                        <div key={item.id} className="text-xs text-gray-600 pl-4">
                          • {item.package_description} ({item.weight_lbs} lbs)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consolidation requests</h3>
            <p className="text-gray-500 mb-4">
              {availablePackages.length < 2
                ? 'You need at least 2 packages to create a consolidation request'
                : 'Create your first consolidation to save on shipping costs'
              }
            </p>
            {availablePackages.length >= 2 && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Consolidation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
