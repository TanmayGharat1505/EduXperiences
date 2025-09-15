import { useState, useEffect, useCallback } from 'react'
import { createWorkingPageAutoSave, WorkingAutoSave } from '@/utils/workingAutoSave'

export function useWorkingPageAutoSave(pageNumber: number, data: any) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [autoSave] = useState(() => createWorkingPageAutoSave(pageNumber))

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
    if (savedData && Object.keys(savedData).length > 0) {
      // Don't mutate the data object - let the component handle restoration
      // The component should call restore() manually if needed
    }
  }, [autoSave])

  return {
    save,
    debouncedSave,
    manualSave,
    lastSaved,
    isSaving,
    restore: () => autoSave.restore(),
    clear: () => autoSave.clear()
  }
}
