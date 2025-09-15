# Auto-Save Implementation Guide for Institution Signup

This guide explains how to implement comprehensive auto-save functionality across all institution signup pages to prevent data loss.

## Overview

The auto-save system automatically saves all form data to localStorage in real-time, ensuring users never lose their progress due to:
- Power outages
- Browser crashes
- Page reloads
- Accidental navigation away
- Network interruptions

## Features

✅ **Real-time Auto-save**: Saves data after 1 second of inactivity  
✅ **Immediate Save for Critical Fields**: Important fields are saved instantly  
✅ **Page Unload Protection**: Saves data when users close browser/tab  
✅ **Data Restoration**: Automatically restores saved data on page reload  
✅ **Visual Feedback**: Shows save status and last saved time  
✅ **Manual Save Button**: Users can explicitly save their progress  
✅ **Error Handling**: Graceful fallback if localStorage fails  

## Implementation Steps

### 1. Create Auto-Save Utility

Create `src/utils/autoSave.ts` with the `AutoSaveManager` class that handles:
- localStorage operations
- Debounced saving
- Page unload protection
- Error handling

### 2. Create React Hook

Create `src/hooks/useAutoSave.ts` with the `useAutoSave` hook that provides:
- Easy integration with React components
- Automatic data restoration
- Save status management

### 3. Create Save Indicator Component

Create `src/components/ui/SaveIndicator.tsx` that shows:
- Current save status (saving/saved/error)
- Last saved timestamp
- Visual indicators with icons

### 4. Integrate with Each Page

For each signup page, add:

```tsx
import { usePageAutoSave } from '@/hooks/useAutoSave'
import { SaveIndicator } from '@/components/ui/SaveIndicator'

export default function YourPage() {
  const [localData, setLocalData] = useState(/* initial data */)
  
  // Auto-save functionality
  const { save, immediateSave, lastSaved, isSaving } = usePageAutoSave(
    pageNumber, 
    localData,
    {
      onDataChange: (savedData) => {
        // Merge saved data with current data
        setLocalData(prev => ({ ...prev, ...savedData }))
      },
      onSave: () => console.log('Data saved successfully'),
      onError: (error) => toast.error('Failed to save progress')
    }
  )

  // Auto-save when data changes
  useEffect(() => {
    if (Object.keys(localData).length > 0) {
      save(localData)
    }
  }, [localData, save])

  // Update input handlers to trigger save
  const handleInputChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    
    // Trigger immediate save for critical fields
    if (['criticalField1', 'criticalField2'].includes(field)) {
      save(newData)
    }
  }

  return (
    <div>
      {/* Save indicator in header */}
      <SaveIndicator 
        isSaving={isSaving} 
        lastSaved={lastSaved} 
        size="md"
      />
      
      {/* Manual save button */}
      <Button onClick={() => save(localData)}>
        <Save className="w-4 h-4 mr-2" />
        Save Progress
      </Button>
    </div>
  )
}
```

## Storage Keys

Each page uses a unique localStorage key:

- Page 1: `institution_signup_page1_basic_info`
- Page 2: `institution_signup_page2_institution_details`
- Page 3: `institution_signup_page3_academic_programs`
- Page 4: `institution_signup_page4_staff_faculty`
- Page 5: `institution_signup_page5_results_achievements`
- Page 6: `institution_signup_page6_fee_policies`
- Page 7: `institution_signup_page7_final_review`

## Data Flow

1. **User Input** → Updates local state
2. **Auto-save Trigger** → Saves to localStorage after 1 second
3. **Critical Fields** → Save immediately
4. **Page Unload** → Final save before leaving
5. **Page Reload** → Restore from localStorage
6. **Context Sync** → Merge with global state

## Benefits

- **No Data Loss**: Users can resume from where they left off
- **Better UX**: No need to re-enter information
- **Reliability**: Works offline and handles interruptions
- **Performance**: Debounced saving prevents excessive writes
- **Transparency**: Users see save status in real-time

## Browser Compatibility

- ✅ Chrome/Edge (localStorage support)
- ✅ Firefox (localStorage support)
- ✅ Safari (localStorage support)
- ⚠️ IE11+ (localStorage support, but limited)

## Error Handling

- Graceful fallback if localStorage is full/disabled
- User notification if save fails
- Automatic retry on next save attempt
- Console logging for debugging

## Testing

Test the auto-save functionality by:
1. Filling out forms partially
2. Refreshing the page
3. Closing and reopening the browser
4. Simulating power loss (close tab)
5. Testing with localStorage disabled

## Future Enhancements

- **Cloud Sync**: Save to backend for cross-device access
- **Compression**: Compress data to save storage space
- **Versioning**: Track data versions for conflict resolution
- **Offline Support**: Queue saves when offline
- **Analytics**: Track save patterns and user behavior
