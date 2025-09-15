// Complete auto-save utility for all institution signup pages
export class CompleteAutoSave {
  private storageKeys: { [key: number]: string } = {
    1: 'institution_signup_page1_basic_info',
    2: 'institution_signup_page2_facilities_details',
    3: 'institution_signup_page3_academic_programs',
    4: 'institution_signup_page4_staff_faculty',
    5: 'institution_signup_page5_results_achievements',
    6: 'institution_signup_page6_fee_policies',
    7: 'institution_signup_page7_final_review'
  }

  // Save data for a specific page
  savePageData(pageNumber: number, data: any): void {
    const storageKey = this.storageKeys[pageNumber]
    if (!storageKey) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(data))
      console.log(`Auto-saved page ${pageNumber} data:`, data)
    } catch (error) {
      console.error(`Error saving page ${pageNumber} data:`, error)
    }
  }

  // Restore data for a specific page
  restorePageData(pageNumber: number): any | null {
    const storageKey = this.storageKeys[pageNumber]
    if (!storageKey) return null

    try {
      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        console.log(`Restored page ${pageNumber} data:`, parsed)
        return parsed
      }
    } catch (error) {
      console.error(`Error restoring page ${pageNumber} data:`, error)
    }
    return null
  }

  // Clear data for a specific page
  clearPageData(pageNumber: number): void {
    const storageKey = this.storageKeys[pageNumber]
    if (!storageKey) return

    try {
      localStorage.removeItem(storageKey)
      console.log(`Cleared page ${pageNumber} data`)
    } catch (error) {
      console.error(`Error clearing page ${pageNumber} data:`, error)
    }
  }

  // Clear all page data
  clearAllData(): void {
    Object.values(this.storageKeys).forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error(`Error clearing ${key}:`, error)
      }
    })
    console.log('Cleared all page data')
  }

  // Get storage key for a page
  getStorageKey(pageNumber: number): string | null {
    return this.storageKeys[pageNumber] || null
  }

  // Setup unload protection for a specific page
  setupPageUnloadProtection(pageNumber: number, data: any): () => void {
    const handleBeforeUnload = () => {
      if (Object.keys(data).length > 0) {
        this.savePageData(pageNumber, data)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && Object.keys(data).length > 0) {
        this.savePageData(pageNumber, data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Final save when component unmounts
      if (Object.keys(data).length > 0) {
        this.savePageData(pageNumber, data)
      }
    }
  }

  // Get all saved data
  getAllSavedData(): { [key: number]: any } {
    const allData: { [key: number]: any } = {}
    
    Object.entries(this.storageKeys).forEach(([pageNum, key]) => {
      const pageNumber = parseInt(pageNum)
      const data = this.restorePageData(pageNumber)
      if (data) {
        allData[pageNumber] = data
      }
    })

    return allData
  }

  // Check if any page has saved data
  hasAnySavedData(): boolean {
    return Object.keys(this.getAllSavedData()).length > 0
  }

  // Get summary of saved data
  getSavedDataSummary(): { [key: number]: { hasData: boolean, dataSize: number } } {
    const summary: { [key: number]: { hasData: boolean, dataSize: number } } = {}
    
    Object.entries(this.storageKeys).forEach(([pageNum, key]) => {
      const pageNumber = parseInt(pageNum)
      const data = this.restorePageData(pageNumber)
      summary[pageNumber] = {
        hasData: !!data,
        dataSize: data ? JSON.stringify(data).length : 0
      }
    })

    return summary
  }
}

// Export singleton instance
export const completeAutoSave = new CompleteAutoSave()

// Convenience functions
export const savePageData = (pageNumber: number, data: any) => 
  completeAutoSave.savePageData(pageNumber, data)

export const restorePageData = (pageNumber: number) => 
  completeAutoSave.restorePageData(pageNumber)

export const clearPageData = (pageNumber: number) => 
  completeAutoSave.clearPageData(pageNumber)

export const clearAllPageData = () => 
  completeAutoSave.clearAllData()

export const getStorageKey = (pageNumber: number) => 
  completeAutoSave.getStorageKey(pageNumber)

export const setupPageUnloadProtection = (pageNumber: number, data: any) => 
  completeAutoSave.setupPageUnloadProtection(pageNumber, data)
