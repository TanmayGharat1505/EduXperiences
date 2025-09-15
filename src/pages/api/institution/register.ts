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
    const {
      // Basic Information
      name,
      type,
      establishment_year,
      registration_number,
      pan,
      gst,
      official_email,
      primary_contact,
      secondary_contact,
      website,
      
      // Address
      complete_address,
      city,
      state,
      pincode,
      landmark,
      latitude,
      longitude,
      
      // Legal
      owner_name,
      owner_contact,
      business_license_file,
      registration_certificate_file,
      agree_terms,
      agree_background_verification
    } = req.body

    // Validate required fields
    const requiredFields = [
      'name', 'type', 'establishment_year', 'registration_number', 'pan',
      'official_email', 'primary_contact', 'complete_address', 'city', 'state',
      'pincode', 'owner_name', 'owner_contact', 'business_license_file',
      'registration_certificate_file', 'agree_terms', 'agree_background_verification'
    ]

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `${field} is required`,
          field,
          code: 'MISSING_FIELD'
        })
      }
    }

    // Validate agreement checkboxes
    if (!agree_terms || !agree_background_verification) {
      return res.status(400).json({
        error: 'You must agree to all terms and conditions',
        field: !agree_terms ? 'agree_terms' : 'agree_background_verification',
        code: 'TERMS_NOT_AGREED'
      })
    }

    // Validate institution type
    const validTypes = ['Coaching', 'Training', 'Language', 'Music Academy', 'Dance School', 'Sports Academy', 'Computer Training', 'Professional', 'Arts & Crafts', 'Other']
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Invalid institution type',
        field: 'type',
        code: 'INVALID_INSTITUTION_TYPE'
      })
    }

    // Validate establishment year (1950 to current year)
    const currentYear = new Date().getFullYear()
    const establishmentYear = parseInt(establishment_year)
    if (isNaN(establishmentYear) || establishmentYear < 1950 || establishmentYear > currentYear) {
      return res.status(400).json({
        error: `Establishment year must be between 1950 and ${currentYear}`,
        field: 'establishment_year',
        code: 'INVALID_ESTABLISHMENT_YEAR'
      })
    }

    // Validate PAN format (10 characters)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(pan)) {
      return res.status(400).json({
        error: 'PAN must be 10 characters in format AAAAA9999A',
        field: 'pan',
        code: 'INVALID_PAN_FORMAT'
      })
    }

    // Validate GST format if provided (15 characters)
    if (gst && !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/i.test(gst)) {
      return res.status(400).json({
        error: 'GST must be 15 characters',
        field: 'gst',
        code: 'INVALID_GST_FORMAT'
      })
    }

    // Validate email format and domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(official_email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        field: 'official_email',
        code: 'INVALID_EMAIL_FORMAT'
      })
    }

    // Check for disposable email domains
    const disposableDomains = ['10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org', 'throwaway.email', 'fakeinbox.com']
    const domain = official_email.split('@')[1]?.toLowerCase()
    if (disposableDomains.includes(domain)) {
      return res.status(400).json({
        error: 'Disposable email domains are not allowed',
        field: 'official_email',
        code: 'DISPOSABLE_EMAIL_NOT_ALLOWED'
      })
    }

    // Validate phone numbers (10 digits)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(primary_contact)) {
      return res.status(400).json({
        error: 'Primary contact must be 10 digits',
        field: 'primary_contact',
        code: 'INVALID_PHONE_FORMAT'
      })
    }

    if (secondary_contact && !phoneRegex.test(secondary_contact)) {
      return res.status(400).json({
        error: 'Secondary contact must be 10 digits',
        field: 'secondary_contact',
        code: 'INVALID_PHONE_FORMAT'
      })
    }

    if (!phoneRegex.test(owner_contact)) {
      return res.status(400).json({
        error: 'Owner contact must be 10 digits',
        field: 'owner_contact',
        code: 'INVALID_PHONE_FORMAT'
      })
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        error: 'Pincode must be 6 digits',
        field: 'pincode',
        code: 'INVALID_PINCODE_FORMAT'
      })
    }

    // Validate website URL if provided
    if (website) {
      try {
        new URL(website)
      } catch {
        return res.status(400).json({
          error: 'Invalid website URL',
          field: 'website',
          code: 'INVALID_WEBSITE_URL'
        })
      }
    }

    // Validate coordinates if provided
    if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
      return res.status(400).json({
        error: 'Invalid latitude value',
        field: 'latitude',
        code: 'INVALID_LATITUDE'
      })
    }

    if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
      return res.status(400).json({
        error: 'Invalid longitude value',
        field: 'longitude',
        code: 'INVALID_LONGITUDE'
      })
    }

    // Check if primary contact is verified via OTP
    const { data: primaryOTP, error: primaryOTPError } = await supabase
      .from('phone_otps')
      .select('*')
      .eq('phone', primary_contact)
      .eq('purpose', 'institution_primary_contact')
      .not('verified_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (primaryOTPError || !primaryOTP || primaryOTP.length === 0) {
      return res.status(400).json({
        error: 'Primary contact phone number must be verified via OTP',
        field: 'primary_contact',
        code: 'PHONE_NOT_VERIFIED'
      })
    }

    // Check if owner contact is verified via OTP
    const { data: ownerOTP, error: ownerOTPError } = await supabase
      .from('phone_otps')
      .select('*')
      .eq('phone', owner_contact)
      .eq('purpose', 'institution_owner_contact')
      .not('verified_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (ownerOTPError || !ownerOTP || ownerOTP.length === 0) {
      return res.status(400).json({
        error: 'Owner contact phone number must be verified via OTP',
        field: 'owner_contact',
        code: 'PHONE_NOT_VERIFIED'
      })
    }

    // Check for duplicate institution
    const { data: existingInstitution, error: checkError } = await supabase
      .from('institutions')
      .select('id')
      .or(`registration_number.eq.${registration_number},official_email.eq.${official_email}`)
      .limit(1)

    if (checkError) {
      console.error('Institution check error:', checkError)
      return res.status(500).json({
        error: 'Failed to check existing institution',
        code: 'CHECK_FAILED'
      })
    }

    if (existingInstitution && existingInstitution.length > 0) {
      return res.status(400).json({
        error: 'Institution with this registration number or email already exists',
        code: 'INSTITUTION_EXISTS'
      })
    }

    // Create institution record
    const { data: institution, error: createError } = await supabase
      .from('institutions')
      .insert({
        name,
        type,
        establishment_year: establishmentYear,
        registration_number,
        pan,
        gst: gst || null,
        official_email,
        primary_contact,
        secondary_contact: secondary_contact || null,
        website: website || null,
        complete_address,
        city,
        state,
        pincode,
        landmark: landmark || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        owner_name,
        owner_contact,
        status: 'pending',
        agree_terms,
        agree_background_verification,
        primary_contact_verified: true,
        owner_contact_verified: true
      })
      .select('id')
      .single()

    if (createError) {
      console.error('Institution creation error:', createError)
      return res.status(500).json({
        error: 'Failed to create institution record',
        code: 'CREATION_FAILED'
      })
    }

    // Create document records
    const documentRecords = [
      {
        institution_id: institution.id,
        file_key: business_license_file.file_key,
        file_name: business_license_file.file_name,
        file_type: business_license_file.file_type,
        file_size: business_license_file.file_size,
        doc_type: 'business_license'
      },
      {
        institution_id: institution.id,
        file_key: registration_certificate_file.file_key,
        file_name: registration_certificate_file.file_name,
        file_type: registration_certificate_file.file_type,
        file_size: registration_certificate_file.file_size,
        doc_type: 'registration_certificate'
      }
    ]

    const { error: docError } = await supabase
      .from('institution_documents')
      .insert(documentRecords)

    if (docError) {
      console.error('Document creation error:', docError)
      // Try to clean up the institution record
      await supabase
        .from('institutions')
        .delete()
        .eq('id', institution.id)

      return res.status(500).json({
        error: 'Failed to save document records',
        code: 'DOCUMENT_SAVE_FAILED'
      })
    }

    // Success response
    return res.status(201).json({
      message: 'Institution registration submitted successfully',
      institution_id: institution.id,
      status: 'pending',
      next_steps: [
        'Your registration is under review',
        'We will contact you within 2-3 business days',
        'Keep your documents ready for verification'
      ]
    })

  } catch (error) {
    console.error('Institution registration error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    })
  }
}
