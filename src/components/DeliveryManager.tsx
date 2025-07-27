import { useState } from 'react'
import { Truck, MapPin, CheckCircle, Camera, Edit3, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import SignatureCapture from '@/components/SignatureCapture'
import PhotoCapture from '@/components/PhotoCapture'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface DeliveryItem {
  id: string
  tracking_number: string
  customer_name: string
  delivery_address: string
  package_description: string
  destination_country: string
  status: string
}

interface DeliveryManagerProps {
  deliveries: DeliveryItem[]
  onRefresh: () => void
}

export default function DeliveryManager({ deliveries, onRefresh }: DeliveryManagerProps) {
  const { user } = useAuth()
  const [showSignatureCapture, setShowSignatureCapture] = useState(false)
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDeliveryComplete = (delivery: DeliveryItem) => {
    setSelectedDelivery(delivery)
    setShowSignatureCapture(true)
  }

  const handleSignatureCapture = async (
    signatureData: string,
    signatureImage: string,
    recipientName: string,
    notes: string
  ) => {
    if (!selectedDelivery || !user?.email) {
      toast.error('Missing delivery information or user not authenticated')
      return
    }

    setLoading(true)
    
    try {
      // Save delivery proof to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('delivery-signatures')
        .upload(
          `signatures/${selectedDelivery.tracking_number}_${Date.now()}.png`,
          await fetch(signatureImage).then(res => res.blob()),
          { contentType: 'image/png' }
        )

      if (storageError) {
        throw storageError
      }

      const { data: urlData } = supabase.storage
        .from('delivery-signatures')
        .getPublicUrl(storageData.path)

      // Save delivery proof record
      const { error: dbError } = await supabase
        .from('delivery_proof')
        .insert({
          shipment_id: selectedDelivery.id,
          recipient_name: recipientName,
          signature_data: signatureData,
          signature_image_url: urlData.publicUrl,
          delivery_notes: notes,
          delivered_by: user.email,
          delivery_location: selectedDelivery.delivery_address,
          proof_type: 'digital_signature'
        })

      if (dbError) {
        throw dbError
      }

      // Update shipment status to delivered
      const { error: statusError } = await supabase.functions.invoke('update-tracking-status', {
        body: {
          tracking_number: selectedDelivery.tracking_number,
          new_status: 'delivered',
          notes: `Delivered to ${recipientName}. ${notes}`,
          staff_email: user.email,
          location: selectedDelivery.delivery_address,
          device_info: 'Delivery Scanner'
        }
      })

      if (statusError) {
        throw statusError
      }

      toast.success(`Package ${selectedDelivery.tracking_number} marked as delivered!`)
      setShowSignatureCapture(false)
      setSelectedDelivery(null)
      onRefresh()
    } catch (error: any) {
      console.error('Error completing delivery:', error)
      toast.error(error.message || 'Failed to complete delivery')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleDeliveryPhoto = (delivery: DeliveryItem) => {
    setSelectedDelivery(delivery)
    setShowPhotoCapture(true)
  }

  const handlePhotoCapture = async (photoData: string, caption?: string) => {
    if (!selectedDelivery || !user?.email) {
      toast.error('Missing delivery information or user not authenticated')
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('upload-package-photo', {
        body: {
          photoData,
          trackingNumber: selectedDelivery.tracking_number,
          photoType: 'delivery',
          caption: caption || 'Delivery photo',
          staffEmail: user.email
        }
      })

      if (error) {
        throw error
      }

      toast.success('Delivery photo uploaded successfully!')
      setShowPhotoCapture(false)
      setSelectedDelivery(null)
    } catch (error: any) {
      console.error('Error uploading delivery photo:', error)
      toast.error(error.message || 'Failed to upload photo')
      throw error
    }
  }

  const filteredDeliveries = deliveries.filter(delivery => 
    delivery.status === 'shipped' || delivery.status === 'out_for_delivery'
  )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Management</h2>
            <p className="text-gray-600">
              Manage deliveries with photo documentation and digital signatures
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{filteredDeliveries.length}</div>
            <div className="text-sm text-gray-500">Pending Deliveries</div>
          </div>
        </div>
      </div>

      {filteredDeliveries.length > 0 ? (
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {delivery.tracking_number}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      delivery.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.status === 'shipped' ? 'Ready for Delivery' : 'Out for Delivery'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <div className="flex items-center space-x-1 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Customer:</span>
                      </div>
                      <p>{delivery.customer_name}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-1 mb-1">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium">Destination:</span>
                      </div>
                      <p>{delivery.destination_country}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-1 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Delivery Address:</span>
                      </div>
                      <p>{delivery.delivery_address}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-1 mb-1">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">Package:</span>
                      </div>
                      <p>{delivery.package_description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDeliveryPhoto(delivery)}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </button>
                
                <button
                  onClick={() => handleDeliveryComplete(delivery)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Complete Delivery
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending deliveries</h3>
          <p className="text-gray-500">
            All packages have been delivered or are not yet ready for delivery
          </p>
        </div>
      )}

      {/* Signature Capture Modal */}
      {showSignatureCapture && selectedDelivery && (
        <SignatureCapture
          title={`Complete Delivery - ${selectedDelivery.tracking_number}`}
          recipientName={selectedDelivery.customer_name}
          onSignatureCapture={handleSignatureCapture}
          onCancel={() => {
            setShowSignatureCapture(false)
            setSelectedDelivery(null)
          }}
        />
      )}

      {/* Photo Capture Modal */}
      {showPhotoCapture && selectedDelivery && (
        <PhotoCapture
          title={`Delivery Photo - ${selectedDelivery.tracking_number}`}
          captionPlaceholder="Delivery location, package condition, etc..."
          onPhotoCapture={handlePhotoCapture}
          onCancel={() => {
            setShowPhotoCapture(false)
            setSelectedDelivery(null)
          }}
        />
      )}
    </div>
  )
}