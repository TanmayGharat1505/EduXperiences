import { useState, useEffect, useCallback, useRef } from 'react'
import { AutoSaveManager, AutoSaveConfig } from '@/utils/autoSave'

export interface UseAutoSaveOptions extends AutoSaveConfig {
  data: any
  onDataChange?: (data: any) => void
  onSave?: (data: any) => void
  onError?: (error: Error) => void
  clearOnUnmount?: boolean
}

export function useAutoSave(options: UseAutoSaveOptions) {
  const {
    data,
    onDataChange,
    onSave,
    onError,
    clearOnUnmount = false,
    ...config
  } = options

  const autoSaveManager = useRef<AutoSaveManager>()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize auto-save manager
  useEffect(() => {
    autoSaveManager.current = new AutoSaveManager({
      ...config,
      onSave: (savedData) => {
        setLastSaved(new Date())
        setIsSaving(false)
        if (onSave) onSave(savedData)
      },
      onError: (error) => {
        setIsSaving(false)
        if (onError) onError(error)
      }
    })

    // Restore data on mount
    const savedData = autoSaveManager.current.restore()
    if (savedData && onDataChange) {
      onDataChange(savedData)
    }

    return () => {
      if (clearOnUnmount) {
        autoSaveManager.current?.clear()
      }
    }
  }, [config.storageKey, onDataChange, onSave, onError, clearOnUnmount])

  // Setup unload protection
  useEffect(() => {
    if (!autoSaveManager.current) return

    const cleanup = autoSaveManager.current.setupUnloadProtection(data)
    return cleanup
  }, [data])

  // Save functions
  const save = useCallback((saveData?: any) => {
    if (!autoSaveManager.current) return
    
    const dataToSave = saveData || data
    setIsSaving(true)
    autoSaveManager.current.save(dataToSave)
  }, [data])

  const debouncedSave = useCallback((saveData?: any) => {
    if (!autoSaveManager.current) return
    
    const dataToSave = saveData || data
    autoSaveManager.current.debouncedSave(dataToSave)
  }, [data])

  const immediateSave = useCallback((field: string, saveData?: any) => {
    if (!autoSaveManager.current) return
    
    const dataToSave = saveData || data
    autoSaveManager.current.immediateSave(dataToSave, field)
  }, [data])

  const clear = useCallback(() => {
    if (!autoSaveManager.current) return
    autoSaveManager.current.clear()
    setLastSaved(null)
  }, [])

  // Get save status
  const getStatus = useCallback(() => {
    if (!autoSaveManager.current) return { isSaving, lastSaved, storageKey: config.storageKey }
    return autoSaveManager.current.getStatus()
  }, [isSaving, lastSaved, config.storageKey])

  return {
    save,
    debouncedSave,
    immediateSave,
    clear,
    getStatus,
    lastSaved,
    isSaving
  }
}

// Convenience hook for page-specific auto-save
export function usePageAutoSave(pageNumber: number, data: any, options?: Partial<UseAutoSaveOptions>) {
  const { STORAGE_KEYS } = require('@/utils/autoSave')
  const storageKey = Object.values(STORAGE_KEYS)[pageNumber - 1]
  
  return useAutoSave({
    storageKey,
    data,
    immediateSaveFields: ['courseCategories', 'totalCurrentStudents', 'averageBatchSize', 'admissionFees'],
    ...options
  })
}
