// Auto-save utility for institution signup forms
export interface AutoSaveConfig {
  storageKey: string
  debounceMs?: number
  immediateSaveFields?: string[]
  onSave?: (data: any) => void
  onError?: (error: Error) => void
}

export class AutoSaveManager {
  private config: AutoSaveConfig
  private timeoutId: NodeJS.Timeout | null = null
  private lastSaved: Date | null = null
  private isSaving = false

  constructor(config: AutoSaveConfig) {
    this.config = {
      debounceMs: 1000,
      immediateSaveFields: [],
      ...config
    }
  }

  // Save data to localStorage
  save(data: any): void {
    if (!data || Object.keys(data).length === 0) return

    this.isSaving = true
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(data))
      this.lastSaved = new Date()
      console.log(`Auto-saved to localStorage (${this.config.storageKey}):`, data)
      
      if (this.config.onSave) {
        this.config.onSave(data)
      }
    } catch (error) {
      console.error(`Error saving to localStorage (${this.config.storageKey}):`, error)
      if (this.config.onError) {
        this.config.onError(error as Error)
      }
    } finally {
      this.isSaving = false
    }
  }

  // Debounced save
  debouncedSave(data: any): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(() => {
      this.save(data)
    }, this.config.debounceMs || 1000)
  }

  // Immediate save for critical fields
  immediateSave(data: any, field: string): void {
    if (this.config.immediateSaveFields?.includes(field)) {
      this.save(data)
    } else {
      this.debouncedSave(data)
    }
  }

  // Restore data from localStorage
  restore(): any | null {
    try {
      const savedData = localStorage.getItem(this.config.storageKey)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        console.log(`Restored from localStorage (${this.config.storageKey}):`, parsed)
        return parsed
      }
    } catch (error) {
      console.error(`Error parsing saved data (${this.config.storageKey}):`, error)
    }
    return null
  }

  // Clear saved data
  clear(): void {
    try {
      localStorage.removeItem(this.config.storageKey)
      console.log(`Cleared localStorage (${this.config.storageKey})`)
    } catch (error) {
      console.error(`Error clearing localStorage (${this.config.storageKey}):`, error)
    }
  }

  // Get save status
  getStatus() {
    return {
      isSaving: this.isSaving,
      lastSaved: this.lastSaved,
      storageKey: this.config.storageKey
    }
  }

  // Setup page unload protection
  setupUnloadProtection(data: any): () => void {
    const handleBeforeUnload = () => {
      if (Object.keys(data).length > 0) {
        this.save(data)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && Object.keys(data).length > 0) {
        this.save(data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Return cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // Final save when component unmounts
      if (Object.keys(data).length > 0) {
        this.save(data)
      }
    }
  }
}

// Predefined storage keys for each page
export const STORAGE_KEYS = {
  PAGE_1: 'institution_signup_page1_basic_info',
  PAGE_2: 'institution_signup_page2_institution_details',
  PAGE_3: 'institution_signup_page3_academic_programs',
  PAGE_4: 'institution_signup_page4_staff_faculty',
  PAGE_5: 'institution_signup_page5_results_achievements',
  PAGE_6: 'institution_signup_page6_fee_policies',
  PAGE_7: 'institution_signup_page7_final_review'
}

// Create auto-save managers for each page
export const createPageAutoSave = (pageNumber: number, config?: Partial<AutoSaveConfig>) => {
  const storageKey = Object.values(STORAGE_KEYS)[pageNumber - 1]
  
  return new AutoSaveManager({
    storageKey,
    immediateSaveFields: ['courseCategories', 'totalCurrentStudents', 'averageBatchSize', 'admissionFees'],
    ...config
  })
}
