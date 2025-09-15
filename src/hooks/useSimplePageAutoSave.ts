import { useState, useEffect, useCallback } from 'react'
import { createPageAutoSave, SimplePageAutoSave } from '@/utils/simplePageAutoSave'

export function useSimplePageAutoSave(pageNumber: number, data: any) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [autoSave] = useState(() => createPageAutoSave(pageNumber))

  // Save function
  const save = useCallback((saveData?: any) => {
    const dataToSave = saveData || data
    if (!dataToSave || Object.keys(dataToSave).length === 0) return

    setIsSaving(true)
    autoSave.save(dataToSave)
    setLastSaved(new Date())
    setIsSaving(false)
  }, [data, autoSave])

  // Debounced save function
  const debouncedSave = useCallback((saveData?: any) => {
    const dataToSave = saveData || data
    if (!dataToSave || Object.keys(dataToSave).length === 0) return

    autoSave.debouncedSave(dataToSave)
  }, [data, autoSave])

  // Manual save function
  const manualSave = useCallback(() => {
    save(data)
  }, [save, data])

  // Auto-save when data changes
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      debouncedSave(data)
    }
  }, [data, debouncedSave])

  // Setup unload protection
  useEffect(() => {
    return autoSave.setupUnloadProtection(data)
  }, [autoSave, data])

  // Restore data on mount
  useEffect(() => {
    const savedData = autoSave.restore()
    if (savedData) {
      // Merge saved data with current data
      Object.assign(data, savedData)
    }
  }, [autoSave, data])

  return {
    save,
    debouncedSave,
    manualSave,
    lastSaved,
    isSaving,
    clear: () => autoSave.clear()
  }
}
