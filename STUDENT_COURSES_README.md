# Student Courses Functionality

## Overview
This guide explains the student courses functionality that allows students to browse and enroll in available courses from tutors.

## Features Implemented

### 1. Student Courses Component
- **`src/components/StudentCourses.tsx`** - Main component for browsing and enrolling in courses
- Displays all active courses with comprehensive information
- Search and filter functionality by subject and level
- Working enrollment system with confirmation dialog

### 2. Database Tables
- **`courses`** table (already created) - Stores course information
- **`course_enrollments`** table - Tracks student enrollments with status tracking

### 3. Student Dashboard Integration
- New "Courses" tab in the sidebar navigation
- Course overview section in the main dashboard
- Quick access buttons to browse courses

## Database Setup

### Required Migrations

#### 1. Courses Table (Already Created)
```sql
-- Run the migration from:
supabase/migrations/create_courses_table.sql
```

#### 2. Course Enrollments Table
```sql
-- Run the migration from:
supabase/migrations/create_course_enrollments_table.sql
```

## Features

### Course Browsing
- **Course Cards**: Display title, description, subject, level, duration, price, and max students
- **Tutor Information**: Shows tutor name, profile photo, location, rating, and experience
- **Search & Filters**: Search by title/description/subject, filter by subject and level
- **Responsive Design**: Works on all device sizes

### Course Enrollment
- **Enroll Button**: Working enrollment system for each course
- **Confirmation Dialog**: Shows course details and tutor information before enrollment
- **Duplicate Prevention**: Students cannot enroll in the same course twice
- **Status Tracking**: Enrollment status (enrolled, completed, cancelled, dropped)

### Dashboard Integration
- **Courses Tab**: Dedicated courses page accessible from sidebar
- **Overview Section**: Course discovery cards in main dashboard
- **Quick Navigation**: Easy access to courses from dashboard

## Component Structure

```
StudentCourses.tsx
├── Course browsing interface
├── Search and filtering
├── Course grid display
├── Enrollment confirmation dialog
└── Error handling and loading states
```

## API Operations

### Course Loading
```typescript
// Load active courses with tutor information
const { data } = await supabase
  .from('courses')
  .select(`
    *,
    tutor_profile:profiles!courses_tutor_id_fkey(
      full_name, profile_photo_url, city, area
    ),
    tutor_details:tutor_profiles!courses_tutor_id_fkey(
      rating, total_reviews, experience_years
    )
  `)
  .eq('is_active', true)
  .order('created_at', { ascending: false });
```

### Course Enrollment
```typescript
// Create enrollment record
const { error } = await supabase
  .from('course_enrollments')
  .insert({
    course_id: selectedCourse.id,
    student_id: user.id,
    status: 'enrolled',
    enrolled_at: new Date().toISOString()
  });
```

## Security Features

### Row Level Security (RLS)
- **Students**: Can view active courses and manage their own enrollments
- **Tutors**: Can view enrollments for their own courses
- **Data Isolation**: Proper separation between user data

### Enrollment Validation
- **Authentication Check**: Only logged-in students can enroll
- **Duplicate Prevention**: Unique constraint on (course_id, student_id)
- **Status Management**: Proper enrollment status tracking

## User Experience

### Course Discovery
1. Students navigate to "Courses" tab
2. Browse available courses with search and filters
3. View detailed course information and tutor profiles
4. Make informed enrollment decisions

### Enrollment Process
1. Click "Enroll Now" button on desired course
2. Review course details and tutor information
3. Confirm enrollment in dialog
4. Receive success confirmation
5. Course appears in "My Classes" tab

### Dashboard Integration
- **Quick Access**: Course overview cards in main dashboard
- **Navigation**: Seamless movement between dashboard sections
- **Context**: Relevant information displayed at appropriate locations

## Future Enhancements

### 1. Course Management
- Course reviews and ratings
- Progress tracking within courses
- Course completion certificates

### 2. Advanced Features
- Course materials and resources
- Interactive assignments and quizzes
- Live class scheduling integration

### 3. Analytics
- Course popularity metrics
- Student engagement tracking
- Learning outcome analysis

## Troubleshooting

### Common Issues

1. **Courses not loading**
   - Check RLS policies on courses table
   - Verify course_enrollments table exists
   - Check database connection

2. **Enrollment errors**
   - Ensure user is authenticated
   - Check foreign key constraints
   - Verify enrollment table structure

3. **Tutor information missing**
   - Check profiles and tutor_profiles tables
   - Verify foreign key relationships
   - Ensure proper data joins

### Debug Steps

1. Check browser console for errors
2. Verify Supabase logs
3. Test database queries directly
4. Check component state and props

## Testing

### Manual Testing Steps

1. **Course Browsing**
   - Navigate to Courses tab
   - Test search functionality
   - Apply subject and level filters
   - Verify course information display

2. **Course Enrollment**
   - Select a course to enroll
   - Review enrollment dialog
   - Complete enrollment process
   - Verify enrollment success

3. **Dashboard Integration**
   - Check course overview cards
   - Test navigation between tabs
   - Verify quick access functionality

## Support

If you encounter issues:
1. Check the console logs for errors
2. Verify database setup and migrations
3. Test with sample course data
4. Review RLS policies and permissions

The student courses functionality is now fully integrated and ready for use!
