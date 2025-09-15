import React from 'react'
import { Save, CheckCircle } from 'lucide-react'

interface SimpleSaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  className?: string
}

export function SimpleSaveIndicator({ isSaving, lastSaved, className = '' }: SimpleSaveIndicatorProps) {
  return (
    <div className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}>
      {isSaving ? (
        <>
          <Save className="h-4 w-4 animate-pulse" />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          <span>Not saved yet</span>
        </>
      )}
    </div>
  )
}
