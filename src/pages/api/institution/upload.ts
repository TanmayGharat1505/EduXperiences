import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { supabaseConfig, validateSupabaseConfig } from '@/config/supabase'

// Validate Supabase configuration before creating client
if (!validateSupabaseConfig()) {
  throw new Error('Supabase configuration is invalid. Please check your environment variables.')
}

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { fileName, fileType, fileSize, docType } = req.body

    // Validate input
    if (!fileName || !fileType || !fileSize || !docType) {
      return res.status(400).json({
        error: 'All file details are required',
        field: !fileName ? 'fileName' : !fileType ? 'fileType' : !fileSize ? 'fileSize' : 'docType',
        code: 'MISSING_FIELD'
      })
    }

    // Validate document type
    if (!['business_license', 'registration_certificate'].includes(docType)) {
      return res.status(400).json({
        error: 'Invalid document type',
        field: 'docType',
        code: 'INVALID_DOC_TYPE'
      })
    }

    // Validate file size (max 10MB)
    if (fileSize > 10 * 1024 * 1024) {
      return res.status(400).json({
        error: 'File size must be less than 10MB',
        field: 'fileSize',
        code: 'FILE_TOO_LARGE'
      })
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        error: 'Only PDF, JPEG, JPG, and PNG files are allowed',
        field: 'fileType',
        code: 'INVALID_FILE_TYPE'
      })
    }

    // Generate unique file key
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileKey = `institution-documents/${timestamp}-${randomId}-${fileName}`

    // Generate signed upload URL
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('institution-documents')
      .createSignedUploadUrl(fileKey)

    if (uploadError) {
      console.error('Signed URL generation error:', uploadError)
      return res.status(500).json({
        error: 'Failed to generate upload URL',
        code: 'UPLOAD_URL_GENERATION_FAILED'
      })
    }

    return res.status(200).json({
      message: 'Upload URL generated successfully',
      upload_url: uploadData.signedUrl,
      file_key: fileKey,
      expires_in: '1 hour'
    })

  } catch (error) {
    console.error('File upload API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    })
  }
}
