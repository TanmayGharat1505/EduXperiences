# Tutor Preview Feature

This document explains the new tutor preview functionality added to the EduXperience landing page.

## Overview

The Tutor Preview feature provides visitors with a sneak peek at available tutors before they commit to signing up. It's designed as a clean, minimal teaser that showcases sample tutor profiles with key information.

## Features

### Interactive Preview
- **Collapsible Section**: Starts hidden, expands when "Find Tutors" is clicked
- **Smooth Animations**: Hover effects and transitions for better user experience
- **Responsive Design**: Works seamlessly on all device sizes

### Sample Tutor Cards
Each tutor card displays:
- **Profile Photo**: Avatar with fallback initials
- **Name & Title**: Professional credentials
- **Subject Area**: What they teach
- **Personal Tagline**: Brief description of their teaching approach
- **Rating**: Star rating (sample data)
- **Location**: City and state
- **Experience**: Years of teaching experience
- **Hourly Rate**: Pricing information
- **Action Button**: "View Profile" button for each tutor

### Navigation
- **Hero Button**: "Explore Tutors" button in the hero section scrolls to the preview
- **View More**: "View More Tutors" button redirects to the signup page
- **Hide Preview**: Option to collapse the preview section

## Implementation

### Files Created/Modified

1. **`src/components/TutorPreview.tsx`** - New component for the tutor preview
2. **`src/pages/Home.tsx`** - Updated to include the tutor preview section

### Component Structure

```typescript
interface TutorCard {
  id: string;
  name: string;
  subject: string;
  tagline: string;
  rating: number;
  location: string;
  avatarUrl?: string;
  experience: string;
  price: string;
}
```

### Sample Data

The component includes 3 sample tutors:
- **Dr. Sarah Chen** - Mathematics & Physics
- **Prof. Michael Rodriguez** - English Literature  
- **Dr. Emily Watson** - Chemistry & Biology

## User Experience Flow

1. **Initial State**: Landing page shows "Meet Our Expert Tutors" section with "Find Tutors" button
2. **User Clicks**: Either the hero "Explore Tutors" button or the "Find Tutors" button
3. **Preview Expands**: Shows 3 sample tutor cards with detailed information
4. **User Options**: 
   - Click "View Profile" on individual cards (currently placeholder)
   - Click "View More Tutors" to go to signup page
   - Click "Hide Preview" to collapse the section

## Design Features

### Visual Elements
- **Gradient Backgrounds**: Subtle gradients for visual depth
- **Hover Effects**: Cards lift slightly and show enhanced shadows
- **Smooth Transitions**: 300ms transitions for all interactive elements
- **Professional Layout**: Clean, card-based design that matches the overall theme

### Responsive Behavior
- **Mobile**: Single column layout for small screens
- **Tablet**: Maintains readability on medium screens
- **Desktop**: Three-column grid for optimal space usage

## Customization

### Adding More Tutors
To add more sample tutors, modify the `sampleTutors` array in `TutorPreview.tsx`:

```typescript
const sampleTutors: TutorCard[] = [
  // ... existing tutors
  {
    id: '4',
    name: 'Dr. James Wilson',
    subject: 'Computer Science',
    tagline: 'Teaching programming with real-world projects',
    rating: 4.7,
    location: 'Seattle, WA',
    experience: '5+ years',
    price: '$48/hr'
  }
];
```

### Modifying Card Information
Update the `TutorCard` interface to include additional fields:

```typescript
interface TutorCard {
  // ... existing fields
  specializations?: string[];
  languages?: string[];
  availability?: string;
}
```

### Changing Visual Style
Modify the CSS classes in the component to match your design preferences:
- Background colors and gradients
- Shadow effects and hover animations
- Spacing and typography

## Future Enhancements

### Real Data Integration
- Replace sample data with actual tutor profiles from database
- Add filtering and search capabilities
- Implement pagination for large numbers of tutors

### Enhanced Interactions
- Click to view full tutor profiles
- Book consultation directly from preview
- Save favorite tutors to wishlist

### Analytics
- Track which tutors get the most profile views
- Monitor conversion rates from preview to signup
- A/B test different preview layouts

## Technical Notes

### Performance
- Component uses local state for visibility toggle
- No external API calls in current implementation
- Smooth scrolling with native browser APIs

### Accessibility
- Proper semantic HTML structure
- Keyboard navigation support
- Screen reader friendly content

### Browser Compatibility
- Modern CSS features with fallbacks
- Progressive enhancement approach
- Works on all modern browsers

## Usage Examples

### Basic Implementation
```typescript
import { TutorPreview } from '@/components/TutorPreview';

function LandingPage() {
  return (
    <div>
      {/* Other sections */}
      <TutorPreview />
      {/* More sections */}
    </div>
  );
}
```

### Custom Styling
```typescript
// Override default styles by modifying the component
// or wrapping it in a styled container
<div className="custom-tutor-section">
  <TutorPreview />
</div>
```

## Support

For questions or issues with the Tutor Preview feature:
1. Check the browser console for any JavaScript errors
2. Verify the component is properly imported and rendered
3. Test on different screen sizes for responsive behavior
4. Review the component props and interface definitions
