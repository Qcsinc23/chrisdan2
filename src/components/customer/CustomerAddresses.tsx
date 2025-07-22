import { useState, useEffect } from 'react'
import { MapPin, Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getAddressConfig, countries } from '@/lib/countryAddressFields'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface CustomerAddressesProps {
  customerAccount: any
}

interface Address {
  id: string
  address_type: string
  street_address: string
  city: string
  state_province: string
  postal_code: string
  country: string
  is_default: boolean
}

export default function CustomerAddresses({ customerAccount }: CustomerAddressesProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState({
    addressType: 'delivery',
    streetAddress: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    isDefault: false
  })


  useEffect(() => {
    if (customerAccount) {
      loadAddresses()
    }
  }, [customerAccount])

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
      toast.error('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.streetAddress || !formData.city || !formData.country) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      const action = editingAddress ? 'update_address' : 'add_address'
      const accountData = {
        customerId: customerAccount.id,
        addressType: formData.addressType,
        streetAddress: formData.streetAddress,
        city: formData.city,
        stateProvince: formData.stateProvince,
        postalCode: formData.postalCode,
        country: formData.country,
        isDefault: formData.isDefault,
        ...(editingAddress && { addressId: editingAddress.id })
      }

      const { data, error } = await supabase.functions.invoke('manage-customer-account', {
        body: {
          action,
          accountData
        }
      })

      if (error) {
        throw error
      }

      toast.success(editingAddress ? 'Address updated successfully!' : 'Address added successfully!')
      setShowForm(false)
      setEditingAddress(null)
      resetForm()
      loadAddresses()
    } catch (error: any) {
      console.error('Error saving address:', error)
      toast.error(error.message || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      addressType: address.address_type,
      streetAddress: address.street_address,
      city: address.city,
      stateProvince: address.state_province || '',
      postalCode: address.postal_code || '',
      country: address.country,
      isDefault: address.is_default
    })
    setShowForm(true)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      const { error } = await supabase.functions.invoke('manage-customer-account', {
        body: {
          action: 'delete_address',
          accountData: {
            addressId
          }
        }
      })

      if (error) {
        throw error
      }

      toast.success('Address deleted successfully!')
      loadAddresses()
    } catch (error: any) {
      console.error('Error deleting address:', error)
      toast.error(error.message || 'Failed to delete address')
    }
  }

  const resetForm = () => {
    setFormData({
      addressType: 'delivery',
      streetAddress: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: '',
      isDefault: false
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAddress(null)
    resetForm()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear state/province and postal code when country changes
    if (name === 'country') {
      setFormData(prev => ({
        ...prev,
        country: value,
        stateProvince: '',
        postalCode: ''
      }))
    }
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Address Book</h2>
            <p className="text-gray-600">
              Manage your shipping and delivery addresses
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="addressType" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Type
                </label>
                <select
                  id="addressType"
                  name="addressType"
                  value={formData.addressType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="delivery">Delivery</option>
                  <option value="pickup">Pickup</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                id="streetAddress"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter street address"
                required
              />
            </div>
            
            {formData.country && (() => {
              const addressConfig = getAddressConfig(formData.country);
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      {addressConfig.fields.city.label} {addressConfig.fields.city.required ? '*' : ''}
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={addressConfig.fields.city.placeholder}
                      required={addressConfig.fields.city.required}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700 mb-1">
                      {addressConfig.fields.stateProvince.label} {addressConfig.fields.stateProvince.required ? '*' : ''}
                    </label>
                    {addressConfig.fields.stateProvince.options ? (
                      <select
                        id="stateProvince"
                        name="stateProvince"
                        value={formData.stateProvince}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={addressConfig.fields.stateProvince.required}
                      >
                        <option value="">{addressConfig.fields.stateProvince.placeholder}</option>
                        {addressConfig.fields.stateProvince.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="stateProvince"
                        name="stateProvince"
                        value={formData.stateProvince}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={addressConfig.fields.stateProvince.placeholder}
                        required={addressConfig.fields.stateProvince.required}
                      />
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      {addressConfig.fields.postalCode.label} {addressConfig.fields.postalCode.required ? '*' : ''}
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={addressConfig.fields.postalCode.placeholder}
                      required={addressConfig.fields.postalCode.required}
                      pattern={addressConfig.fields.postalCode.pattern}
                    />
                  </div>
                </div>
              );
            })()}

            {!formData.country && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter city"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="stateProvince"
                    name="stateProvince"
                    value={formData.stateProvince}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter state/province"
                  />
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                Set as default address
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="h-4 w-4 mr-2" />
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
                  <Check className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      <div className="bg-white rounded-lg shadow-sm">
        {addresses.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {addresses.map((address) => (
              <div key={address.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {address.address_type} Address
                      </h3>
                      {address.is_default && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <div className="text-gray-600">
                      <p>{address.street_address}</p>
                      <p>
                        {address.city}
                        {address.state_province && `, ${address.state_province}`}
                        {address.postal_code && ` ${address.postal_code}`}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => handleEdit(address)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="inline-flex items-center p-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-500 mb-4">
              Add your shipping and delivery addresses for faster checkout
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
