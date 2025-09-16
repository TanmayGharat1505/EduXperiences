import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Upload, FileText, X, CheckCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { supabaseConfig, validateSupabaseConfig } from '@/config/supabase'

interface FileUploadProps {
  onFileUploaded: (fileData: FileData) => void
  docType: 'business_license' | 'registration_certificate'
  error?: string
}

interface FileData {
  file_key: string
  file_name: string
  file_type: string
  file_size: number
}

// Validate Supabase configuration before creating client
if (!validateSupabaseConfig()) {
  throw new Error('Supabase configuration is invalid. Please check your environment variables.')
}

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  docType,
  error
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPEG, JPG, and PNG files are allowed')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploading(true)

    try {
      // Get signed upload URL
      const response = await fetch('/api/institution/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          docType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get upload URL')
      }

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('institution-documents')
        .uploadToSignedUrl(data.file_key, data.upload_url, file)

      if (uploadError) {
        throw new Error('Failed to upload file')
      }

      // File uploaded successfully
      const fileData: FileData = {
        file_key: data.file_key,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      }

      setUploadedFile(fileData)
      onFileUploaded(fileData)
      toast.success('File uploaded successfully!')

    } catch (error) {
      console.error('File upload error:', error)
      toast.error('File upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    onFileUploaded({} as FileData)
  }

  if (uploadedFile) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900 truncate">
              {uploadedFile.file_name}
            </p>
            <p className="text-xs text-green-600">
              {(uploadedFile.file_size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={`file-upload-${docType}`}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          disabled={isUploading}
        />

        <div className="space-y-2">
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-sm text-blue-600">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <label
                    htmlFor={`file-upload-${docType}`}
                    className="cursor-pointer text-blue-600 hover:text-blue-500"
                  >
                    Click to upload
                  </label>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, JPEG, PNG up to 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
