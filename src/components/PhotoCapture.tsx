import { useState, useRef } from 'react'
import { Camera, Upload, X, Check, RotateCcw } from 'lucide-react'
import Webcam from 'react-webcam'
import toast from 'react-hot-toast'

interface PhotoCaptureProps {
  onPhotoCapture: (photo: string, caption?: string) => Promise<void>
  onCancel: () => void
  title: string
  captionPlaceholder?: string
}

export default function PhotoCapture({ 
  onPhotoCapture, 
  onCancel, 
  title, 
  captionPlaceholder = 'Add a caption...' 
}: PhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedPhoto(imageSrc)
    } else {
      toast.error('Failed to capture photo')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Photo size must be less than 10MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSavePhoto = async () => {
    if (!capturedPhoto) {
      toast.error('No photo to save')
      return
    }

    setLoading(true)
    
    try {
      await onPhotoCapture(capturedPhoto, caption)
      // Reset state after successful upload
      setCapturedPhoto(null)
      setCaption('')
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false)
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    setCaption('')
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {!capturedPhoto ? (
            <div className="space-y-4">
              {/* Camera View */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode,
                    width: 400,
                    height: 400
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Camera Controls */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={switchCamera}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Switch
                </button>
                
                <button
                  onClick={capturePhoto}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </button>
              </div>

              {/* Upload Alternative */}
              <div className="text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload from Gallery
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={capturedPhoto}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Caption Input */}
              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={captionPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Retake
                </button>
                
                <button
                  onClick={handleSavePhoto}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : 'Save Photo'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}