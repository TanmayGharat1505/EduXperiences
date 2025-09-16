import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Send, CheckCircle, XCircle } from 'lucide-react'

interface OTPVerificationProps {
  phone: string
  purpose: 'institution_primary_contact' | 'institution_owner_contact'
  onVerified: () => void
  isVerified: boolean
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  phone,
  purpose,
  onVerified,
  isVerified
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/institution/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose })
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        toast.success('OTP sent successfully!')
        if (data.otp) {
          console.log(`📱 OTP for ${phone}: ${data.otp}`)
        }
      } else {
        toast.error(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error('Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch('/api/institution/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, purpose })
      })

      const data = await response.json()

      if (response.ok) {
        onVerified()
        toast.success('Phone number verified successfully!')
      } else {
        toast.error(data.error || 'OTP verification failed')
      }
    } catch (error) {
      toast.error('OTP verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerified) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Verified</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-2">
      {!otpSent ? (
        <Button
          type="button"
          onClick={handleSendOTP}
          disabled={isLoading || !phone || phone.length !== 10}
          size="sm"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      ) : (
        <div className="flex space-x-2">
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="OTP"
            maxLength={6}
            className="w-20 text-center"
          />
          <Button
            type="button"
            onClick={handleVerifyOTP}
            disabled={isVerifying || !otp || otp.length !== 6}
            size="sm"
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Verify'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
