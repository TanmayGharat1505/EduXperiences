// Simple auto-save utility for institution signup forms
export class SimpleAutoSave {
  private storageKey: string
  private debounceTimeout: NodeJS.Timeout | null = null

  constructor(storageKey: string) {
    this.storageKey = storageKey
  }

  // Save data to localStorage
  save(data: any): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
      console.log(`Auto-saved to localStorage (${this.storageKey}):`, data)
    } catch (error) {
      console.error(`Error saving to localStorage (${this.storageKey}):`, error)
    }
  }

  // Debounced save (1 second delay)
  debouncedSave(data: any): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }

    this.debounceTimeout = setTimeout(() => {
      this.save(data)
    }, 1000)
  }

  // Restore data from localStorage
  restore(): any | null {
    try {
      const savedData = localStorage.getItem(this.storageKey)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        console.log(`Restored from localStorage (${this.storageKey}):`, parsed)
        return parsed
      }
    } catch (error) {
      console.error(`Error parsing saved data (${this.storageKey}):`, error)
    }
    return null
  }

  // Clear saved data
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey)
      console.log(`Cleared localStorage (${this.storageKey})`)
    } catch (error) {
      console.error(`Error clearing localStorage (${this.storageKey}):`, error)
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

// Storage keys for each page
export const STORAGE_KEYS = {
  PAGE_1: 'institution_signup_page1_basic_info',
  PAGE_2: 'institution_signup_page2_facilities_details',
  PAGE_3: 'institution_signup_page3_academic_programs',
  PAGE_4: 'institution_signup_page4_staff_faculty',
  PAGE_5: 'institution_signup_page5_results_achievements',
  PAGE_6: 'institution_signup_page6_fee_policies',
  PAGE_7: 'institution_signup_page7_final_review'
}

// Create auto-save instance for a specific page
export const createPageAutoSave = (pageNumber: number): SimpleAutoSave => {
  const storageKey = Object.values(STORAGE_KEYS)[pageNumber - 1]
  return new SimpleAutoSave(storageKey)
}
