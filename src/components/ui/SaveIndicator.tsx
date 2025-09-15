import React from 'react'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  hasError?: boolean
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function SaveIndicator({ 
  isSaving, 
  lastSaved, 
  hasError = false, 
  className,
  showText = true,
  size = 'md'
}: SaveIndicatorProps) {
  const getIcon = () => {
    if (hasError) {
      return <AlertCircle className={cn(
        "text-destructive",
        size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4"
      )} />
    }
    
    if (isSaving) {
      return <Save className={cn(
        "text-muted-foreground animate-pulse",
        size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4"
      )} />
    }
    
    if (lastSaved) {
      return <CheckCircle className={cn(
        "text-green-600",
        size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4"
      )} />
    }
    
    return <Save className={cn(
      "text-muted-foreground",
      size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4"
    )} />
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

  return (
    <div className={cn(
      "flex items-center space-x-2",
      size === 'sm' ? "text-xs" : size === 'lg' ? "text-base" : "text-sm",
      getStatusColor(),
      className
    )}>
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
export function CompactSaveIndicator(props: SaveIndicatorProps) {
  return <SaveIndicator {...props} showText={false} size="sm" />
}

// Large version for prominent display
export function LargeSaveIndicator(props: SaveIndicatorProps) {
  return <SaveIndicator {...props} size="lg" />
}
