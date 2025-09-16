import { useState, useEffect, useCallback } from 'react'
import { savePageData, restorePageData, clearPageData, setupPageUnloadProtection } from '@/utils/completeAutoSave'

export function useCompletePageAutoSave(pageNumber: number, data: any, options?: {
  autoSave?: boolean
  debounceMs?: number
  immediateSaveFields?: string[]
  onDataRestored?: (data: any) => void
  onSave?: () => void
  onError?: (error: Error) => void
}) {
  const {
    autoSave = true,
    debounceMs = 1000,
    immediateSaveFields = [],
    onDataRestored,
    onSave,
    onError
  } = options || {}

  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null)

  // Save function
  const save = useCallback((saveData?: any) => {
    const dataToSave = saveData || data
    if (!dataToSave || Object.keys(dataToSave).length === 0) return

    setIsSaving(true)
    try {
      savePageData(pageNumber, dataToSave)
      setLastSaved(new Date())
      if (onSave) onSave()
    } catch (error) {
      console.error(`Error saving page ${pageNumber} data:`, error)
      if (onError) onError(error as Error)
    } finally {
      setIsSaving(false)
    }
  }, [pageNumber, data, onSave, onError])

  // Debounced save function
  const debouncedSave = useCallback((saveData?: any) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    const newTimeout = setTimeout(() => {
      save(saveData)
    }, debounceMs)

    setDebounceTimeout(newTimeout)
  }, [debounceTimeout, debounceMs, save])

  // Immediate save for critical fields
  const immediateSave = useCallback((field: string, saveData?: any) => {
    if (immediateSaveFields.includes(field)) {
      save(saveData)
    } else {
      debouncedSave(saveData)
    }
  }, [immediateSaveFields, save, debouncedSave])

  // Manual save function
  const manualSave = useCallback(() => {
    save(data)
  }, [save, data])

  // Clear saved data
  const clear = useCallback(() => {
    clearPageData(pageNumber)
    setLastSaved(null)
  }, [pageNumber])

  // Auto-save when data changes
  useEffect(() => {
    if (autoSave && Object.keys(data).length > 0) {
      debouncedSave(data)
    }
  }, [data, autoSave, debouncedSave])

  // Restore data on mount
  useEffect(() => {
    try {
      const savedData = restorePageData(pageNumber)
      if (savedData && onDataRestored) {
        onDataRestored(savedData)
      }
    } catch (error) {
      console.error(`Error restoring page ${pageNumber} data:`, error)
    }
  }, [pageNumber, onDataRestored])

  // Setup unload protection
  useEffect(() => {
    return setupPageUnloadProtection(pageNumber, data)
  }, [pageNumber, data])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [debounceTimeout])

  return {
    save,
    debouncedSave,
    immediateSave,
    manualSave,
    clear,
    lastSaved,
    isSaving
  }
}

// Convenience hook for specific page types
export function useBasicInfoAutoSave(data: any, options?: any) {
  return useCompletePageAutoSave(1, data, {
    immediateSaveFields: ['institutionName', 'email', 'phone', 'registrationNumber'],
    ...options
  })
}

export function useFacilitiesAutoSave(data: any, options?: any) {
  return useCompletePageAutoSave(2, data, {
    immediateSaveFields: ['totalClassrooms', 'classroomCapacity'],
    ...options
  })
}

export function useAcademicProgramsAutoSave(data: any, options?: any) {
  return useCompletePageAutoSave(3, data, {
    immediateSaveFields: ['courseCategories', 'totalCurrentStudents', 'averageBatchSize', 'admissionFees'],
    ...options
  })
}

export function useStaffFacultyAutoSave(data: any, options?: any) {
  return useCompletePageAutoSave(4, data, {
    immediateSaveFields: ['totalTeachingStaff', 'principalName', 'principalQualification', 'principalExperience'],
    ...options
  })
}

export function useResultsAchievementsAutoSave(data: any, options?: any) {
  return useCompletePageAutoSave(5, data, {
    immediateSaveFields: ['academicResults', 'boardAffiliationDetails'],
    ...options
  })
}

export function useFeePoliciesAutoSave(data: any, options?: any) {
  return useCompletePageAutoSave(6, data, {
    immediateSaveFields: ['feeStructures', 'paymentModesAccepted', 'paymentSchedule', 'refundPolicy'],
    ...options
  })
}

export function useFinalReviewAutoSave(data: any, options?: any) {
  return useCompletePageAutoSave(7, data, {
    immediateSaveFields: ['agreeTerms', 'agreeBackgroundVerification', 'agreeDataAccuracy', 'agreePrivacyPolicy'],
    ...options
  })
}
