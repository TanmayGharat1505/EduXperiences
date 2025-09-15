import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { supabaseConfig, validateSupabaseConfig } from '@/config/supabase'

// Validate Supabase configuration before creating client
if (!validateSupabaseConfig()) {
  throw new Error('Supabase configuration is invalid. Please check your environment variables.')
}

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phone, otp, purpose } = req.body

    // Validate input
    if (!phone || !otp || !purpose) {
      return res.status(400).json({
        error: 'Phone, OTP, and purpose are required',
        field: !phone ? 'phone' : !otp ? 'otp' : 'purpose',
        code: 'MISSING_FIELD'
      })
    }

    // Validate phone format
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        error: 'Phone must be 10 digits',
        field: 'phone',
        code: 'INVALID_PHONE_FORMAT'
      })
    }

    // Validate purpose
    if (!['institution_primary_contact', 'institution_owner_contact'].includes(purpose)) {
      return res.status(400).json({
        error: 'Invalid purpose',
        field: 'purpose',
        code: 'INVALID_PURPOSE'
      })
    }

    // Find the most recent unexpired OTP for this phone and purpose
    const { data: otpData, error: fetchError } = await supabase
      .from('phone_otps')
      .select('*')
      .eq('phone', phone)
      .eq('purpose', purpose)
      .is('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !otpData) {
      return res.status(400).json({
        error: 'Invalid or expired OTP',
        field: 'otp',
        code: 'INVALID_OTP'
      })
    }

    // Check if too many attempts
    if (otpData.attempts >= 3) {
      return res.status(400).json({
        error: 'Too many failed attempts. Please request a new OTP.',
        field: 'otp',
        code: 'TOO_MANY_ATTEMPTS'
      })
    }

    // Verify OTP
    const isValidOTP = await bcrypt.compare(otp, otpData.otp_hash)

    if (!isValidOTP) {
      // Increment attempt counter
      await supabase
        .from('phone_otps')
        .update({ attempts: otpData.attempts + 1 })
        .eq('id', otpData.id)

      return res.status(400).json({
        error: 'Invalid OTP',
        field: 'otp',
        code: 'INVALID_OTP'
      })
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('phone_otps')
      .update({ 
        verified_at: new Date().toISOString(),
        attempts: otpData.attempts + 1
      })
      .eq('id', otpData.id)

    if (updateError) {
      console.error('OTP verification update error:', updateError)
      return res.status(500).json({
        error: 'Failed to verify OTP',
        code: 'VERIFICATION_FAILED'
      })
    }

    return res.status(200).json({
      message: 'OTP verified successfully',
      phone,
      purpose,
      verified_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('OTP verification error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    })
  }
}
