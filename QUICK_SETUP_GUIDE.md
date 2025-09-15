# Quick Setup Guide - Fix Dashboard Errors

## Current Issues Fixed

### 1. ✅ Missing Select Import
- Added `Select` component import to StudentCourses.tsx

### 2. ✅ Database Relationship Issues
- Fixed foreign key query syntax in StudentCourses.tsx
- Removed explicit foreign key constraint references

### 3. ✅ Missing Database Tables
- Created migration for missing tables: `learning_records`, `classes`, `messages`

## Setup Steps

### Step 1: Run the Missing Tables Migration
Copy and paste this SQL into your Supabase SQL Editor:

```sql
-- Run this migration to create missing tables
-- Copy from: supabase/migrations/fix_missing_dashboard_tables.sql
```

### Step 2: Run the Course Enrollments Migration
```sql
-- Run this migration to create course enrollments table
-- Copy from: supabase/migrations/fix_course_enrollments_table.sql
```

### Step 3: Verify Tables Exist
After running migrations, check that these tables exist:
- `courses` (should already exist)
- `course_enrollments` (new)
- `learning_records` (new)
- `classes` (new)
- `messages` (new)

## Expected Results

After running the migrations:

1. **No more 404 errors** for missing tables
2. **No more 400 errors** for foreign key relationships
3. **StudentCourses component** should load without errors
4. **Dashboard overview** should display properly
5. **Course enrollment** should work correctly

## Testing

1. **Refresh your browser** after running migrations
2. **Navigate to Courses tab** - should load without errors
3. **Check browser console** - should have no more database errors
4. **Test course enrollment** - should work end-to-end

## If Issues Persist

1. **Check Supabase logs** for any migration errors
2. **Verify table structure** using the verification queries in migrations
3. **Check RLS policies** are properly applied
4. **Ensure user authentication** is working correctly

## Next Steps

Once the migrations are successful:
1. Create some sample courses as a tutor
2. Test the student enrollment flow
3. Verify dashboard functionality
4. Test search and filtering features

The dashboard should now work smoothly without any database errors!
