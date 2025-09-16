import React from 'react'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'

interface AutoSaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  hasError?: boolean
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function AutoSaveIndicator({ 
  isSaving, 
  lastSaved, 
  hasError = false, 
  className = '',
  showText = true,
  size = 'md'
}: AutoSaveIndicatorProps) {
  const getIcon = () => {
    if (hasError) {
      return <AlertCircle className="text-destructive h-4 w-4" />
    }
    
    if (isSaving) {
      return <Save className="text-muted-foreground h-4 w-4 animate-pulse" />
    }
    
    if (lastSaved) {
      return <CheckCircle className="text-green-600 h-4 w-4" />
    }
    
    return <Save className="text-muted-foreground h-4 w-4" />
  }

  const getText = () => {
    if (hasError) {
      return 'Save failed'
    }
    
    if (isSaving) {
      return 'Saving...'
    }
    
    if (lastSaved) {
      return `Last saved: ${lastSaved.toLocaleTimeString()}`
    }
    
    return 'Not saved yet'
  }

  const getStatusColor = () => {
    if (hasError) return 'text-destructive'
    if (isSaving) return 'text-muted-foreground'
    if (lastSaved) return 'text-green-600'
    return 'text-muted-foreground'
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs'
      case 'lg':
        return 'text-base'
      default:
        return 'text-sm'
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${getSizeClasses()} ${getStatusColor()} ${className}`}>
      {getIcon()}
      {showText && (
        <span className="font-medium">
          {getText()}
        </span>
      )}
    </div>
  )
}

// Compact version for small spaces
export function CompactAutoSaveIndicator(props: AutoSaveIndicatorProps) {
  return <AutoSaveIndicator {...props} showText={false} size="sm" />
}

// Large version for prominent display
export function LargeAutoSaveIndicator(props: AutoSaveIndicatorProps) {
  return <AutoSaveIndicator {...props} size="lg" />
}
