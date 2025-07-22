import { useState } from 'react'
import { Search, Package, Clock, MapPin, CheckCircle, AlertCircle, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface TrackingEvent {
  id: string
  event_type: string
  event_description: string
  location: string | null
  staff_member: string | null
  timestamp: string | null
  notes: string | null
}

interface ShipmentInfo {
  id: string
  tracking_number: string
  customer_name: string
  destination_address: string
  destination_country: string
  package_type: string
  service_type: string
  status: string
  created_at: string | null
  estimated_delivery: string | null
}

interface StatusInfo {
  display: string
  description: string
  progress: number
  color: string
}

interface TrackingData {
  shipment: ShipmentInfo
  tracking_events: TrackingEvent[]
  status_info: StatusInfo
  last_updated: string
}

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number')
      return
    }

    setLoading(true)
    setError('')
    setTrackingData(null)

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('Request timed out. Please try again.')
      toast.error('Request timed out. Please try again.')
    }, 15000) // 15 second timeout

    try {
      const { data, error } = await supabase.functions.invoke('track-shipment', {
        body: {
          trackingNumber: trackingNumber.trim()
        }
      })

      clearTimeout(timeoutId)

      if (error) {
        throw error
      }

      if (data?.error) {
        throw new Error(data.error.message)
      }

      if (data?.data) {
        setTrackingData(data.data)
        toast.success('Tracking information found!')
      } else {
        throw new Error('No tracking data received')
      }
    } catch (err: any) {
      clearTimeout(timeoutId)
      console.error('Tracking error:', err)
      const errorMessage = err.message || 'Failed to find tracking information'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'shipped':
        return <Truck className="h-6 w-6 text-blue-500" />
      case 'processing':
      case 'received':
        return <Package className="h-6 w-6 text-yellow-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Package</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your tracking number to get real-time updates on your shipment to the Caribbean or Central America
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleTrack} className="space-y-6">
            <div>
              <label htmlFor="tracking-number" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="tracking-number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter your tracking number (e.g., CD123456789)"
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  disabled={loading}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span>{loading ? 'Tracking...' : 'Track Package'}</span>
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 font-medium">Tracking Error</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        )}

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-8">
            {/* Package Status */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(trackingData.shipment.status)}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {trackingData.status_info.display}
                    </h2>
                    <p className="text-gray-600">{trackingData.status_info.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="text-lg font-mono font-bold text-gray-900">
                    {trackingData.shipment.tracking_number}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-700">
                    {trackingData.status_info.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(trackingData.status_info.progress)}`}
                    style={{ width: `${trackingData.status_info.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Package Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-semibold text-gray-900">{trackingData.shipment.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Destination</p>
                  <p className="font-semibold text-gray-900">{trackingData.shipment.destination_country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Package Type</p>
                  <p className="font-semibold text-gray-900">{trackingData.shipment.package_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Service Type</p>
                  <p className="font-semibold text-gray-900">{trackingData.shipment.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(trackingData.shipment.estimated_delivery)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(trackingData.last_updated)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Clock className="h-6 w-6 text-blue-600" />
                <span>Tracking History</span>
              </h3>
              
              {trackingData.tracking_events.length > 0 ? (
                <div className="space-y-6">
                  {trackingData.tracking_events.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full ${
                          index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        {index < trackingData.tracking_events.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 ml-2 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {event.event_description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(event.timestamp)}
                          </p>
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-1 mt-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <p className="text-sm text-gray-600">{event.location}</p>
                          </div>
                        )}
                        {event.notes && (
                          <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No tracking events available yet. Check back later for updates.
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help?</h3>
              <p className="text-blue-800 mb-4">
                If you have questions about your shipment, contact us:
              </p>
              <div className="space-y-2 text-blue-800">
                <p><strong>Phone:</strong> 718-738-1490</p>
                <p><strong>Email:</strong> chrisdanenterprises@gmail.com</p>
                <p><strong>Hours:</strong> Mon-Fri 10am-6pm, Sat 10am-2pm</p>
              </div>
            </div>
          </div>
        )}

        {/* Sample Tracking Numbers for Demo */}
        {!trackingData && !loading && (
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Sample Tracking</h3>
            <p className="text-blue-800 mb-4">
              Don't have a tracking number? Contact us to get started with your shipment.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-blue-700">
                <strong>Phone:</strong> 718-738-1490 | <strong>Email:</strong> chrisdanenterprises@gmail.com
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}