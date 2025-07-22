import { useState, useEffect } from 'react'
import { User, Mail, Phone, Bell, Save, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface CustomerSettingsProps {
  customerAccount: any
  onAccountUpdate: (account: any) => void
}

export default function CustomerSettings({ customerAccount, onAccountUpdate }: CustomerSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    whatsappNotifications: true,
    emailNotifications: true,
    smsNotifications: false
  })

  useEffect(() => {
    if (customerAccount) {
      setFormData({
        fullName: customerAccount.full_name || '',
        phone: customerAccount.phone || '',
        whatsappNotifications: customerAccount.whatsapp_notifications ?? true,
        emailNotifications: customerAccount.email_notifications ?? true,
        smsNotifications: customerAccount.sms_notifications ?? false
      })
    }
  }, [customerAccount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName) {
      toast.error('Full name is required')
      return
    }

    setLoading(true)
    
    try {
      let action = 'update_account'
      let accountData = {
        full_name: formData.fullName,
        phone: formData.phone,
        whatsapp_notifications: formData.whatsappNotifications,
        email_notifications: formData.emailNotifications,
        sms_notifications: formData.smsNotifications
      }

      // If no customer account exists, create one
      if (!customerAccount) {
        action = 'create_account'
        accountData = {
          full_name: formData.fullName,
          phone: formData.phone,
          whatsapp_notifications: formData.whatsappNotifications,
          email_notifications: formData.emailNotifications,
          sms_notifications: formData.smsNotifications
        }
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

      if (data?.data) {
        onAccountUpdate(Array.isArray(data.data) ? data.data[0] : data.data)
        toast.success('Account updated successfully!')
      }
    } catch (error: any) {
      console.error('Error updating account:', error)
      toast.error(error.message || 'Failed to update account')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
        <p className="text-gray-600">
          Manage your personal information and notification preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(xxx) xxx-xxxx"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive updates about your shipments via email</p>
              </div>
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">WhatsApp Notifications</h4>
                <p className="text-sm text-gray-600">Get instant updates on WhatsApp</p>
              </div>
              <input
                type="checkbox"
                id="whatsappNotifications"
                name="whatsappNotifications"
                checked={formData.whatsappNotifications}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                <p className="text-sm text-gray-600">Receive text messages for important updates</p>
              </div>
              <input
                type="checkbox"
                id="smsNotifications"
                name="smsNotifications"
                checked={formData.smsNotifications}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="text-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}