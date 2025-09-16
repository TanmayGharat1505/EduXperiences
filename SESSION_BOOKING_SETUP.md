# Session Booking System Setup Guide

## Overview
The session booking system allows students to browse tutor availability and book one-on-one sessions within available time slots. This system integrates with the existing tutor availability management and course enrollment systems.

## Features Implemented

### 🎯 **Student Side**
- **Browse Available Tutors**: View tutors with their availability, courses, and pricing
- **Search & Filter**: Search by tutor name/bio and filter by subject
- **View Available Slots**: See upcoming 2 weeks of available time slots
- **Book Sessions**: Select a course, date, time, and add special requirements
- **Session Management**: View all booked sessions in the "My Classes" tab

### 🎯 **Tutor Side**
- **Availability Management**: Set weekly schedule with time slots
- **Session Tracking**: View all upcoming sessions in the Schedule section
- **Student Management**: See students enrolled in courses and booked sessions

## Database Changes Required

### 1. Run the Availability Migration
```sql
-- Run this migration first to add availability columns to tutor_profiles
-- File: supabase/migrations/add_availability_to_tutor_profiles.sql
```

### 2. Run the Classes Table Enhancement
```sql
-- Run this migration to ensure proper session booking structure
-- File: supabase/migrations/enhance_classes_table_for_bookings.sql
```

## Navigation Updates

### Student Dashboard
- Added "Book Sessions" tab between "My Classes" and "Find Tutors"
- Updated "My Classes" to show both enrolled courses and booked sessions

### Tutor Dashboard
- Enhanced Schedule section with weekly calendar view
- Added availability management with timezone support
- Integrated session management with course actions

## Component Structure

### New Components Created
1. **`SessionBooking.tsx`** - Main component for browsing and booking sessions
2. **Enhanced `MyClasses.tsx`** - Shows both enrolled courses and booked sessions
3. **Enhanced `TutorDashboard.tsx`** - Availability management and session tracking

### Key Features
- **Real-time Availability**: Tutors can set and update their weekly schedule
- **Smart Booking**: Students can only book within available time slots
- **Course Integration**: Sessions are linked to specific courses and tutors
- **Status Management**: Track session status (scheduled, in_progress, completed, cancelled)
- **Timezone Support**: Proper timezone handling for availability and bookings

## Usage Flow

### For Students
1. Navigate to "Book Sessions" tab
2. Browse available tutors with their availability
3. Filter by subject or search by name
4. Select an available time slot
5. Choose a course and add special requirements
6. Confirm booking
7. View booked sessions in "My Classes" tab

### For Tutors
1. Set weekly availability in Schedule section
2. Choose timezone and available days
3. Add specific time slots for each day
4. View upcoming sessions and student bookings
5. Manage session status (complete, cancel, reschedule)

## Data Flow

```
Tutor Sets Availability → Student Browses Availability → Student Books Session → 
Session Created in Classes Table → Appears in Both Student and Tutor Dashboards
```

## Technical Implementation

### State Management
- Local state for availability data in tutor dashboard
- Real-time updates for immediate UI feedback
- Proper error handling and loading states

### Database Queries
- Efficient joins between tutor_profiles, profiles, and courses
- RLS policies for data security
- Proper indexing for performance

### UI/UX Features
- Responsive design for mobile and desktop
- Intuitive time slot selection
- Clear status indicators and progress tracking
- Search and filtering capabilities

## Testing Checklist

### Database
- [ ] Run availability migration
- [ ] Run classes table enhancement
- [ ] Verify RLS policies work correctly
- [ ] Test data insertion and retrieval

### Student Features
- [ ] Can browse available tutors
- [ ] Can filter by subject
- [ ] Can search by tutor name
- [ ] Can view available time slots
- [ ] Can book a session
- [ ] Can see booked sessions in My Classes

### Tutor Features
- [ ] Can set weekly availability
- [ ] Can manage time slots
- [ ] Can see upcoming sessions
- [ ] Can manage session status

### Integration
- [ ] Sessions appear in both dashboards
- [ ] Availability updates immediately
- [ ] Course integration works correctly
- [ ] Error handling works properly

## Troubleshooting

### Common Issues
1. **Availability not showing**: Check if tutor has set weekly schedule
2. **Booking fails**: Verify classes table structure and RLS policies
3. **Time display issues**: Check timezone settings and formatting
4. **Sessions not loading**: Verify user authentication and permissions

### Debug Steps
1. Check browser console for errors
2. Verify database migrations have been run
3. Check RLS policies are active
4. Verify user has proper permissions

## Next Steps

### Potential Enhancements
1. **Payment Integration**: Add payment processing for paid sessions
2. **Video Conferencing**: Integrate with Zoom/Google Meet
3. **Reminder System**: Email/SMS notifications for upcoming sessions
4. **Rescheduling**: Allow students to reschedule sessions
5. **Rating System**: Post-session feedback and ratings

### Performance Optimizations
1. **Caching**: Cache tutor availability data
2. **Pagination**: Handle large numbers of tutors/sessions
3. **Real-time Updates**: WebSocket integration for live availability
4. **Search Optimization**: Full-text search for tutor profiles

## Support

For technical issues or questions about the session booking system, refer to:
- Database schema documentation
- Component API documentation
- Error logs and debugging guides
- User feedback and feature requests
