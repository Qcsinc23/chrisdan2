import { useState, useRef, useEffect } from 'react'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, Keyboard, CheckCircle, AlertCircle, Package, ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import PhotoCapture from '@/components/PhotoCapture'
import toast from 'react-hot-toast'

interface ScanResult {
  tracking_number: string
  success: boolean
  message: string
}

export default function BarcodeScanner() {
  const { user } = useAuth()
  const [isScanning, setIsScanning] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('received')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null)
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [captureForTracking, setCaptureForTracking] = useState('')
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerElementRef = useRef<HTMLDivElement>(null)

  const statusOptions = [
    { value: 'received', label: 'Package Received', color: 'blue' },
    { value: 'processing', label: 'Processing', color: 'yellow' },
    { value: 'shipped', label: 'Shipped', color: 'indigo' },
    { value: 'delivered', label: 'Delivered', color: 'green' }
  ]

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [])

  const startScanning = () => {
    if (!scannerElementRef.current) return

    setIsScanning(true)
    setManualMode(false)

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    }

    scannerRef.current = new Html5QrcodeScanner('qr-scanner', config, false)
    
    scannerRef.current.render(
      (decodedText) => {
        handleScan(decodedText)
        stopScanning()
      },
      (error) => {
        // Ignore errors, they happen frequently during scanning
      }
    )
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleScan = async (scannedText: string) => {
    if (!scannedText.trim()) {
      toast.error('No barcode detected')
      return
    }

    await updateTrackingStatus(scannedText.trim())
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!manualInput.trim()) {
      toast.error('Please enter a tracking number')
      return
    }

    await updateTrackingStatus(manualInput.trim())
  }

  const updateTrackingStatus = async (trackingNumber: string) => {
    if (!user?.email) {
      toast.error('User not authenticated')
      return
    }

    // For 'received' status, offer photo capture option
    if (selectedStatus === 'received') {
      const shouldTakePhoto = confirm('Would you like to take a photo of the package?')
      if (shouldTakePhoto) {
        setCaptureForTracking(trackingNumber)
        setShowPhotoCapture(true)
        return
      }
    }

    await performStatusUpdate(trackingNumber)
  }

  const performStatusUpdate = async (trackingNumber: string) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('update-tracking-status', {
        body: {
          tracking_number: trackingNumber,
          new_status: selectedStatus,
          notes: notes.trim() || undefined,
          staff_email: user.email,
          location: 'Chrisdan Enterprises - Jamaica, NY',
          device_info: 'Web Scanner'
        }
      })

      if (error) {
        throw error
      }

      if (data?.error) {
        throw new Error(data.error.message)
      }

      const result = {
        tracking_number: trackingNumber,
        success: true,
        message: `Successfully updated status to ${selectedStatus}`
      }

      setLastScanResult(result)
      setManualInput('')
      setNotes('')
      
      toast.success(`Package ${trackingNumber} status updated to ${selectedStatus}`)

    } catch (err: any) {
      console.error('Update error:', err)
      const result = {
        tracking_number: trackingNumber,
        success: false,
        message: err.message || 'Failed to update tracking status'
      }
      
      setLastScanResult(result)
      toast.error(err.message || 'Failed to update tracking status')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoCapture = async (photoData: string, caption?: string) => {
    try {
      // Upload the photo first
      const { data, error } = await supabase.functions.invoke('upload-package-photo', {
        body: {
          photoData,
          trackingNumber: captureForTracking,
          photoType: 'received',
          caption: caption || 'Package received',
          staffEmail: user?.email
        }
      })

      if (error) {
        throw error
      }

      toast.success('Photo uploaded successfully!')
      
      // Now update the tracking status
      await performStatusUpdate(captureForTracking)
      
      setShowPhotoCapture(false)
      setCaptureForTracking('')
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      toast.error(error.message || 'Failed to upload photo')
      throw error
    }
  }

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option?.color || 'gray'
  }

  return (
    <div className="space-y-6">
      {/* Scanner Mode Toggle */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {
            if (isScanning) stopScanning()
            setManualMode(false)
          }}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            !manualMode && !isScanning
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Camera className="h-5 w-5" />
          <span>Camera Scanner</span>
        </button>
        
        <button
          onClick={() => {
            if (isScanning) stopScanning()
            setManualMode(true)
          }}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            manualMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Keyboard className="h-5 w-5" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Status Selection */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Update Status To:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedStatus === option.value
                  ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Notes Input */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add any additional notes about this status update..."
        />
      </div>

      {/* Camera Scanner */}
      {!manualMode && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8">
          {!isScanning ? (
            <div className="text-center">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Scanner</h3>
              <p className="text-gray-600 mb-6">
                Click start to begin scanning barcodes with your camera
              </p>
              <button
                onClick={startScanning}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
              >
                <Camera className="h-5 w-5" />
                <span>Start Camera</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Scanning...</h3>
                <button
                  onClick={stopScanning}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <CameraOff className="h-4 w-4" />
                  <span>Stop</span>
                </button>
              </div>
              <div id="qr-scanner" ref={scannerElementRef} className="w-full"></div>
            </div>
          )}
        </div>
      )}

      {/* Manual Input */}
      {manualMode && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center mb-6">
            <Keyboard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Manual Entry</h3>
            <p className="text-gray-600">
              Enter the tracking number manually
            </p>
          </div>
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="manual-input" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                id="manual-input"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter tracking number (e.g., CD123456789)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !manualInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                <Package className="h-5 w-5" />
              )}
              <span>{loading ? 'Updating...' : 'Update Status'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Last Scan Result */}
      {lastScanResult && (
        <div className={`p-4 rounded-lg border ${
          lastScanResult.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {lastScanResult.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${
                lastScanResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {lastScanResult.success ? 'Status Updated Successfully' : 'Update Failed'}
              </h4>
              <p className={`text-sm mt-1 ${
                lastScanResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                <strong>Tracking:</strong> {lastScanResult.tracking_number}
              </p>
              <p className={`text-sm ${
                lastScanResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {lastScanResult.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Scanner Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use camera scanner for quick barcode scanning</li>
          <li>• Use manual entry if barcode is damaged or camera isn't available</li>
          <li>• Select the appropriate status before scanning</li>
          <li>• Add notes for additional context if needed</li>
          <li>• Photo capture available for 'received' status updates</li>
        </ul>
      </div>

      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <PhotoCapture
          title="Package Received - Take Photo"
          captionPlaceholder="Package condition, size, etc..."
          onPhotoCapture={handlePhotoCapture}
          onCancel={() => {
            setShowPhotoCapture(false)
            setCaptureForTracking('')
          }}
        />
      )}
    </div>
  )
}