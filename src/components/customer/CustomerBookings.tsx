import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, MapPin, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface CustomerBookingsProps {
  customerAccount: any
}

interface Booking {
  id: string
  service_type: string
  booking_date: string
  time_slot: string
  status: string
  confirmation_number: string
  estimated_cost: number
  special_instructions: string
}

export default function CustomerBookings({ customerAccount }: CustomerBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [formData, setFormData] = useState({
    serviceType: 'pickup',
    bookingDate: '',
    timeSlot: '',
    pickupAddressId: '',
    deliveryAddressId: '',
    specialInstructions: ''
  })

  const serviceTypes = [
    { value: 'pickup', label: 'Package Pickup', cost: 25 },
    { value: 'delivery', label: 'Local Delivery', cost: 30 },
    { value: 'express_pickup', label: 'Express Pickup', cost: 40 },
    { value: 'express_delivery', label: 'Express Delivery', cost: 50 },
    { value: 'barrel_service', label: 'Barrel Service', cost: 35 },
    { value: 'consolidation', label: 'Consolidation Service', cost: 15 }
  ]

  useEffect(() => {
    if (customerAccount) {
      loadBookings()
      loadAddresses()
    }
  }, [customerAccount])

  useEffect(() => {
    if (formData.bookingDate) {
      loadAvailableSlots(formData.bookingDate)
    }
  }, [formData.bookingDate])

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('service-booking-system', {
        body: {
          action: 'get_customer_bookings',
          bookingData: {
            customerId: customerAccount.id
          }
        }
      })

      if (error) {
        throw error
      }

      setBookings(data?.data || [])
    } catch (error: any) {
      console.error('Error loading bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const loadAddresses = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-customer-account', {
        body: {
          action: 'get_addresses',
          accountData: {
            customerId: customerAccount.id
          }
        }
      })

      if (error) {
        throw error
      }

      setAddresses(data?.data || [])
    } catch (error: any) {
      console.error('Error loading addresses:', error)
    }
  }

  const loadAvailableSlots = async (date: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('service-booking-system', {
        body: {
          action: 'get_available_slots',
          bookingData: {
            date,
            serviceType: formData.serviceType
          }
        }
      })

      if (error) {
        throw error
      }

      setAvailableSlots(data?.data?.availableSlots || [])
    } catch (error: any) {
      console.error('Error loading available slots:', error)
      toast.error('Failed to load available time slots')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.serviceType || !formData.bookingDate || !formData.timeSlot) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('service-booking-system', {
        body: {
          action: 'create_booking',
          bookingData: {
            customerId: customerAccount.id,
            serviceType: formData.serviceType,
            bookingDate: formData.bookingDate,
            timeSlot: formData.timeSlot,
            pickupAddressId: formData.pickupAddressId || null,
            deliveryAddressId: formData.deliveryAddressId || null,
            specialInstructions: formData.specialInstructions
          }
        }
      })

      if (error) {
        throw error
      }

      toast.success('Service booking created successfully!')
      setShowForm(false)
      resetForm()
      loadBookings()
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error(error.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      serviceType: 'pickup',
      bookingDate: '',
      timeSlot: '',
      pickupAddressId: '',
      deliveryAddressId: '',
      specialInstructions: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Bookings</h2>
            <p className="text-gray-600">
              Schedule pickup and delivery services for your packages
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Book Service
          </button>
        </div>
      </div>

      {/* Booking Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Book New Service</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type *
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {serviceTypes.map(service => (
                    <option key={service.value} value={service.value}>
                      {service.label} - ${service.cost}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  id="bookingDate"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  min={getMinDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            {formData.bookingDate && (
              <div>
                <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">
                  Available Time Slots *
                </label>
                <select
                  id="timeSlot"
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a time slot</option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            )}
            
            {addresses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pickupAddressId" className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Address
                  </label>
                  <select
                    id="pickupAddressId"
                    name="pickupAddressId"
                    value={formData.pickupAddressId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select pickup address</option>
                    {addresses.map(address => (
                      <option key={address.id} value={address.id}>
                        {address.street_address}, {address.city}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="deliveryAddressId" className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address
                  </label>
                  <select
                    id="deliveryAddressId"
                    name="deliveryAddressId"
                    value={formData.deliveryAddressId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select delivery address</option>
                    {addresses.map(address => (
                      <option key={address.id} value={address.id}>
                        {address.street_address}, {address.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
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
                placeholder="Any special instructions for the service..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="text-white mr-2" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Booking...' : 'Book Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm">
        {bookings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {booking.service_type.replace('_', ' ')}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(booking.booking_date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {booking.time_slot}
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span> ${booking.estimated_cost}
                      </div>
                    </div>
                    
                    {booking.confirmation_number && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Confirmation:</span> {booking.confirmation_number}
                      </div>
                    )}
                    
                    {booking.special_instructions && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Instructions:</span> {booking.special_instructions}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service bookings</h3>
            <p className="text-gray-500 mb-4">
              Schedule pickup and delivery services for your convenience
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Book Your First Service
            </button>
          </div>
        )}
      </div>
    </div>
  )
}