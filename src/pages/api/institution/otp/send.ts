import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
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
    const { phone, purpose } = req.body

    // Validate input
    if (!phone || !purpose) {
      return res.status(400).json({
        error: 'Phone and purpose are required',
        field: !phone ? 'phone' : 'purpose',
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

    // Check rate limiting (max 3 OTPs per hour per phone)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const { count: recentOTPs } = await supabase
      .from('phone_otps')
      .select('*', { count: 'exact', head: true })
      .eq('phone', phone)
      .gte('created_at', oneHourAgo.toISOString())

    if (recentOTPs && recentOTPs >= 3) {
      return res.status(429).json({
        error: 'Too many OTP requests. Please wait before requesting another.',
        field: 'phone',
        code: 'RATE_LIMIT_EXCEEDED'
      })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpHash = await bcrypt.hash(otp, 10)

    // Set expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('phone_otps')
      .insert({
        phone,
        otp_hash: otpHash,
        purpose,
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('OTP storage error:', insertError)
      return res.status(500).json({
        error: 'Failed to generate OTP',
        code: 'OTP_GENERATION_FAILED'
      })
    }

    // In production, you would send SMS here
    // For now, we'll return the OTP in development
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment) {
      console.log(`📱 OTP for ${phone} (${purpose}): ${otp}`)
    }

    return res.status(200).json({
      message: 'OTP sent successfully',
      phone,
      purpose,
      expires_in: '10 minutes',
      // Only include OTP in development
      ...(isDevelopment && { otp })
    })

  } catch (error) {
    console.error('OTP send error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    })
  }
}
