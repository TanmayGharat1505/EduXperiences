# Course Management Setup Guide

## Overview
This guide explains how to set up the course management functionality for tutors in the EduXperience platform.

## Features Added

### 1. Database Table
- **`courses`** table with the following fields:
  - `id` (UUID, Primary Key)
  - `tutor_id` (UUID, Foreign Key to auth.users)
  - `title` (Text, Required)
  - `description` (Text)
  - `subject` (Text, Required)
  - `level` (Text: beginner, intermediate, advanced, all_levels)
  - `duration_hours` (Integer, Default: 1)
  - `price` (Decimal)
  - `currency` (Text, Default: 'INR')
  - `max_students` (Integer, Default: 1)
  - `is_active` (Boolean, Default: true)
  - `created_at` (Timestamp)
  - `updated_at` (Timestamp)

### 2. Tutor Dashboard Integration
- New "Courses" tab in the sidebar navigation
- Course management interface with CRUD operations
- Course overview section in the main dashboard
- Course count displayed in quick stats

### 3. Course Management Component
- Create new courses with comprehensive form
- Edit existing courses
- Delete courses with confirmation
- Toggle course active/inactive status
- View all courses in a clean list format

## Setup Instructions

### Step 1: Run Database Migration
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the content from `supabase/migrations/create_courses_table.sql`
4. Click "Run" to execute the migration

### Step 2: Verify Table Creation
1. Go to Table Editor in Supabase
2. You should see the new `courses` table
3. Verify that RLS policies are enabled
4. Check that indexes are created for performance

### Step 3: Test the Functionality
1. Log in as a tutor
2. Navigate to the "Courses" tab
3. Try creating a new course
4. Test editing and deleting courses
5. Verify that courses appear in the dashboard overview

## Security Features

### Row Level Security (RLS)
- Tutors can only view, create, edit, and delete their own courses
- Students can view active courses for browsing
- Automatic `updated_at` timestamp updates

### Data Validation
- Required fields: title, subject
- Level validation: beginner, intermediate, advanced, all_levels
- Numeric constraints for duration, price, and max students

## API Endpoints

The courses functionality uses these Supabase operations:
- `SELECT` - Load tutor's courses
- `INSERT` - Create new course
- `UPDATE` - Edit existing course
- `DELETE` - Remove course
- Real-time subscriptions for live updates

## Component Structure

```
CourseManagement.tsx
├── Course creation dialog
├── Course editing dialog
├── Course list display
├── Course status management
└── Form validation and error handling
```

## Integration Points

### Dashboard Home
- Displays course count in stats
- Shows course overview cards
- Links to course management

### Navigation
- New "Courses" tab in sidebar
- Proper routing and state management

### State Management
- Courses state in main TutorDashboard component
- Refresh function for real-time updates
- Proper prop passing to child components

## Future Enhancements

1. **Course Analytics**
   - Student enrollment tracking
   - Course completion rates
   - Revenue analytics

2. **Advanced Features**
   - Course materials upload
   - Student progress tracking
   - Course scheduling integration

3. **Student Interface**
   - Course browsing and enrollment
   - Course reviews and ratings
   - Payment integration

## Troubleshooting

### Common Issues

1. **Courses not loading**
   - Check RLS policies
   - Verify user authentication
   - Check database connection

2. **Permission errors**
   - Ensure user has tutor role
   - Check foreign key constraints
   - Verify RLS policy setup

3. **Form validation errors**
   - Check required fields
   - Validate data types
   - Ensure proper error handling

### Debug Steps

1. Check browser console for errors
2. Verify Supabase logs
3. Test database queries directly
4. Check component state and props

## Support

If you encounter issues:
1. Check the console logs
2. Verify database setup
3. Test with sample data
4. Review RLS policies

The courses functionality is now fully integrated into the Tutor Dashboard and ready for use!
