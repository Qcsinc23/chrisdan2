import { useState, useRef, useEffect } from 'react'
import { Pen, Trash2, Check, X } from 'lucide-react'
import SignaturePad from 'signature_pad'
import toast from 'react-hot-toast'

interface SignatureCaptureProps {
  onSignatureCapture: (signatureData: string, signatureImage: string, recipientName: string, notes: string) => Promise<void>
  onCancel: () => void
  title: string
  recipientName?: string
}

export default function SignatureCapture({ 
  onSignatureCapture, 
  onCancel, 
  title,
  recipientName = '' 
}: SignatureCaptureProps) {
  const [loading, setLoading] = useState(false)
  const [recipient, setRecipient] = useState(recipientName)
  const [notes, setNotes] = useState('')
  const [isEmpty, setIsEmpty] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const signaturePadRef = useRef<SignaturePad | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        velocityFilterWeight: 0.7,
        minWidth: 0.5,
        maxWidth: 2.5,
        throttle: 16,
        minDistance: 5,
      })

      signaturePadRef.current.addEventListener('beginStroke', () => {
        setIsEmpty(false)
      })

      // Resize canvas
      resizeCanvas()
    }

    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off()
      }
    }
  }, [])

  const resizeCanvas = () => {
    if (canvasRef.current && signaturePadRef.current) {
      const canvas = canvasRef.current
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      canvas.getContext('2d')!.scale(ratio, ratio)
      
      signaturePadRef.current.clear()
      setIsEmpty(true)
    }
  }

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear()
      setIsEmpty(true)
    }
  }

  const handleSaveSignature = async () => {
    if (!signaturePadRef.current || isEmpty) {
      toast.error('Please provide a signature')
      return
    }

    if (!recipient.trim()) {
      toast.error('Please enter the recipient name')
      return
    }

    setLoading(true)
    
    try {
      const signatureData = signaturePadRef.current.toData()
      const signatureImage = signaturePadRef.current.toDataURL('image/png')
      
      await onSignatureCapture(
        JSON.stringify(signatureData),
        signatureImage,
        recipient.trim(),
        notes.trim()
      )
      
      // Reset state after successful save
      clearSignature()
      setRecipient('')
      setNotes('')
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
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

        <div className="p-4 space-y-4">
          {/* Recipient Name */}
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Name *
            </label>
            <input
              type="text"
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient's full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Signature Canvas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digital Signature *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
              <canvas
                ref={canvasRef}
                className="w-full h-40 border border-gray-200 rounded cursor-crosshair"
                style={{ touchAction: 'none' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sign above using your finger or stylus
            </p>
          </div>

          {/* Signature Controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={clearSignature}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </button>
            
            <div className="flex items-center text-sm text-gray-500">
              <Pen className="h-4 w-4 mr-1" />
              {isEmpty ? 'Canvas is empty' : 'Signature captured'}
            </div>
          </div>

          {/* Delivery Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about the delivery..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            
            <button
              onClick={handleSaveSignature}
              disabled={loading || isEmpty || !recipient.trim()}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Saving...' : 'Confirm Delivery'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}