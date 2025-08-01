import { useState, useEffect } from 'react'
import { FileText, Upload, Download, Trash2, Check, X, Eye, ZoomIn, ZoomOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'

interface CustomerDocumentsProps {
  customerAccount: any
}

interface Document {
  id: string
  document_type: string
  document_name: string
  file_url: string
  file_size: number
  mime_type: string
  upload_date: string
  is_verified: boolean
  notes: string
}

export default function CustomerDocuments({ customerAccount }: CustomerDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadData, setUploadData] = useState({
    documentType: 'customs_form',
    associatedShipmentId: ''
  })
  const [shipments, setShipments] = useState<any[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)

  const documentTypes = [
    { value: 'customs_form', label: 'Customs Form' },
    { value: 'invoice', label: 'Commercial Invoice' },
    { value: 'packing_list', label: 'Packing List' },
    { value: 'id_document', label: 'ID Document' },
    { value: 'insurance', label: 'Insurance Document' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    if (customerAccount) {
      loadDocuments()
      loadShipments()
    } else {
      setLoading(false)
    }
  }, [customerAccount])

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_documents')
        .select('*')
        .eq('customer_id', customerAccount?.id || '')
        .order('upload_date', { ascending: false })

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading documents:', error)
        // Don't show error toast, just set empty array
      }

      setDocuments(data || [])
    } catch (error: any) {
      console.error('Error loading documents:', error)
      // Don't show error toast, just set empty array
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const loadShipments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data, error } = await supabase
        .from('shipments')
        .select('id, tracking_number, destination_country')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false })

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading shipments:', error)
        // Don't show error toast, just set empty array
      }

      setShipments(data || [])
    } catch (error: any) {
      console.error('Error loading shipments:', error)
      // Don't show error toast, just set empty array
      setShipments([])
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('Please select a valid file')
      return
    }

    const file = acceptedFiles[0]
    
    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    // Validate file type - be more flexible with PDF detection
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isImage = file.type.startsWith('image/')
    const isWord = file.type.includes('word') || file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')
    
    if (!isPDF && !isImage && !isWord) {
      toast.error('Please upload PDF, Word document, or image files only')
      return
    }

    setUploading(true)
    
    try {
      // Convert file to base64 with better error handling
      const fileDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          if (!result) {
            reject(new Error('Failed to read file'))
            return
          }
          resolve(result)
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })

      // Ensure we have the correct MIME type for PDFs
      let mimeType = file.type
      if (isPDF && (!mimeType || mimeType === '')) {
        mimeType = 'application/pdf'
      }

      const { data, error } = await supabase.functions.invoke('upload-customer-document', {
        body: {
          fileData: fileDataUrl,
          fileName: file.name,
          documentType: uploadData.documentType,
          customerId: customerAccount.id,
          shipmentId: uploadData.associatedShipmentId || null,
          mimeType: mimeType // Pass the MIME type explicitly
        }
      })

      if (error) {
        throw error
      }

      toast.success('Document uploaded successfully!')
      setShowUploadForm(false)
      setUploadData({ documentType: 'customs_form', associatedShipmentId: '' })
      loadDocuments()
    } catch (error: any) {
      console.error('Error uploading document:', error)
      toast.error(error.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  })

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('customer_documents')
        .delete()
        .eq('id', documentId)
        .eq('customer_id', customerAccount.id)

      if (error) {
        throw error
      }

      toast.success('Document deleted successfully!')
      loadDocuments()
    } catch (error: any) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return '📄'
    } else if (mimeType.includes('image')) {
      return '🖼️'
    } else if (mimeType.includes('word')) {
      return '📝'
    }
    return '📁'
  }

  const handleViewDocument = (document: Document) => {
    // Use universal document viewer for ALL document types - no new windows/tabs
    setSelectedDocument(document)
    setShowDocumentViewer(true)
  }

  const closeDocumentViewer = () => {
    setShowDocumentViewer(false)
    setSelectedDocument(null)
  }

  if (loading) {
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents</h2>
            <p className="text-gray-600">
              Upload and manage your shipping documents
            </p>
          </div>
          <button
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Document</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  id="documentType"
                  value={uploadData.documentType}
                  onChange={(e) => setUploadData(prev => ({ ...prev, documentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="associatedShipmentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Shipment (Optional)
                </label>
                <select
                  id="associatedShipmentId"
                  value={uploadData.associatedShipmentId}
                  onChange={(e) => setUploadData(prev => ({ ...prev, associatedShipmentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No associated shipment</option>
                  {shipments.map(shipment => (
                    <option key={shipment.id} value={shipment.id}>
                      {shipment.tracking_number} - {shipment.destination_country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* File Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 font-medium mb-2">Drag & drop a file here, or click to select</p>
                  <p className="text-sm text-gray-500">
                    Supported: PDF, Word documents, Images (max 50MB)
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm">
        {documents.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {documents.map((document) => (
              <div key={document.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getDocumentIcon(document.mime_type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {document.document_name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="capitalize">
                          {document.document_type.replace('_', ' ')}
                        </span>
                        <span>{formatFileSize(document.file_size)}</span>
                        <span>{formatDate(document.upload_date)}</span>
                        {document.is_verified && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDocument(document)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <a
                      href={document.file_url}
                      download
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      className="inline-flex items-center p-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {document.notes && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {document.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
            <p className="text-gray-500 mb-4">
              Upload your shipping documents for faster processing
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Loading Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <LoadingSpinner size="md" />
            <span className="text-lg font-medium text-gray-900">Uploading document...</span>
          </div>
        </div>
      )}

      {/* Universal Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeDocumentViewer}
        >
          <div 
            className="bg-white rounded-lg max-w-6xl max-h-[95vh] w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDocument.document_name}
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {selectedDocument.document_type.replace('_', ' ')} • {formatFileSize(selectedDocument.file_size)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={selectedDocument.file_url}
                  download
                  className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={closeDocumentViewer}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Document Content Container */}
            <div className="p-4 bg-gray-50 max-h-[calc(95vh-120px)] overflow-auto">
              {selectedDocument.mime_type.includes('image') ? (
                // Image Viewer
                <div className="flex justify-center items-center min-h-[400px]">
                  <img
                    src={selectedDocument.file_url}
                    alt={selectedDocument.document_name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      console.error('Error loading image:', e)
                      toast.error('Failed to load image')
                      closeDocumentViewer()
                    }}
                  />
                </div>
              ) : selectedDocument.mime_type.includes('pdf') ? (
                // PDF Viewer - Embedded iframe (safe, no new window)
                <div className="w-full h-[70vh] bg-white rounded-lg shadow-lg">
                  <iframe
                    src={selectedDocument.file_url}
                    className="w-full h-full rounded-lg"
                    title={selectedDocument.document_name}
                    onError={() => {
                      toast.error('Failed to load PDF. Please download to view.')
                    }}
                  />
                </div>
              ) : (
                // Other document types - Show preview info and download option
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="text-6xl mb-4">
                    {getDocumentIcon(selectedDocument.mime_type)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedDocument.document_name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This document type cannot be previewed in the browser.
                  </p>
                  <a
                    href={selectedDocument.file_url}
                    download
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </a>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  <span className="font-medium">Uploaded:</span> {formatDate(selectedDocument.upload_date)}
                  {selectedDocument.is_verified && (
                    <span className="ml-3 inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Click outside or press ESC to close
                </div>
              </div>
              {selectedDocument.notes && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Notes:</span> {selectedDocument.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
