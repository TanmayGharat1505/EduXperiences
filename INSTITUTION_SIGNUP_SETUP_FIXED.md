# 🏛️ Institution Signup Page 2 - FIXED Setup Guide

## 🚨 **IMPORTANT: Database Column Conflicts Fixed**

The previous migration had column name conflicts. This guide provides the corrected setup.

## 🔧 **Step-by-Step Setup**

### **Step 1: Check Current Database State**

First, run this diagnostic script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of: supabase/migrations/check_current_database.sql
```

This will show you:
- What tables currently exist
- What columns they have
- Any conflicts that need to be resolved

### **Step 2: Run the Fixed Migration**

After checking your current database state, run this corrected migration:

```sql
-- Copy and paste the contents of: supabase/migrations/create_simple_institution_system_fixed.sql
```

**What this migration does:**
- ✅ Safely drops any conflicting tables
- ✅ Creates tables with correct column names
- ✅ Sets up proper relationships
- ✅ Creates storage bucket for photos
- ✅ Configures RLS policies

### **Step 3: Verify the Setup**

After running the migration, you should see:
```
✅ Simple Institution Signup System Database Created Successfully!
✅ Tables created: institutions, institution_facilities, institution_photos
✅ Storage bucket: institution-photos
✅ RLS policies and indexes configured
```

## 🗄️ **Database Schema (Fixed)**

### **`institutions` Table**
```sql
- id (UUID, Primary Key)
- institution_name (TEXT, NOT NULL)
- institution_type (TEXT, NOT NULL)
- registration_number (TEXT, UNIQUE, NOT NULL)
- contact_email (TEXT, NOT NULL)        ← FIXED: was 'email'
- contact_phone (TEXT, NOT NULL)        ← FIXED: was 'phone'
- address (TEXT, NOT NULL)
- city (TEXT, NOT NULL)
- state (TEXT, NOT NULL)
- pincode (TEXT, NOT NULL)
- owner_name (TEXT, NOT NULL)
- owner_phone (TEXT, NOT NULL)
- agree_terms (BOOLEAN, NOT NULL)
- agree_background_verification (BOOLEAN, NOT NULL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **`institution_facilities` Table**
```sql
- id (UUID, Primary Key)
- institution_id (UUID, Foreign Key)     ← FIXED: references institutions(id)
- total_classrooms (INTEGER, 1-100)
- classroom_capacity (INTEGER, optional)
- library_available (BOOLEAN)
- computer_lab (BOOLEAN)
- wifi_available (BOOLEAN)
- parking_available (BOOLEAN)
- cafeteria_canteen (BOOLEAN)
- air_conditioning (BOOLEAN)
- cctv_security (BOOLEAN)
- wheelchair_accessible (BOOLEAN)
- projectors_smart_boards (BOOLEAN)
- audio_system (BOOLEAN)
- laboratory_facilities (JSONB array)
- sports_facilities (JSONB array)
- transportation_provided (BOOLEAN)
- hostel_facility (BOOLEAN)
- study_material_provided (BOOLEAN)
- online_classes (BOOLEAN)
- recorded_sessions (BOOLEAN)
- mock_tests_assessments (BOOLEAN)
- career_counseling (BOOLEAN)
- job_placement_assistance (BOOLEAN)
```

### **`institution_photos` Table**
```sql
- id (UUID, Primary Key)
- institution_id (UUID, Foreign Key)     ← FIXED: references institutions(id)
- photo_type (VARCHAR, enum)
- photo_url (TEXT, NOT NULL)
- photo_name (VARCHAR)
- photo_size (INTEGER)
- photo_mime_type (VARCHAR)
- is_primary (BOOLEAN)
- upload_order (INTEGER)
- created_at (TIMESTAMP)
```

## 🚀 **Testing the System**

### **1. Test Database Connection**
Navigate to: `http://localhost:5173/institution-signup/test`

Click "Run System Tests" to verify:
- ✅ Database connection
- ✅ Tables exist and are accessible
- ✅ Storage bucket exists

### **2. Test the Signup Flow**
Navigate to: `http://localhost:5173/institution-signup`

Complete both steps:
1. **Page 1**: Basic Information
2. **Page 2**: Facilities & Photos

## 🐛 **Common Issues & Solutions**

### **Issue: "Column does not exist"**
**Solution**: Run the fixed migration that creates tables with correct column names.

### **Issue: "Table does not exist"**
**Solution**: The migration will create all required tables.

### **Issue: "Foreign key constraint"**
**Solution**: The migration creates tables in the correct order with proper references.

### **Issue: "Storage bucket not found"**
**Solution**: The migration creates the storage bucket automatically.

## 🔍 **Troubleshooting Steps**

### **If Migration Fails:**

1. **Check Supabase Connection**
   - Verify your environment variables
   - Check if you can connect to Supabase dashboard

2. **Check Existing Tables**
   - Run the diagnostic script first
   - Look for any conflicting table names

3. **Check Permissions**
   - Ensure your Supabase user has CREATE permissions
   - Check if RLS is blocking operations

4. **Check SQL Syntax**
   - Copy the migration exactly as shown
   - Don't modify the SQL unless you know what you're doing

### **If Frontend Still Has Issues:**

1. **Check Browser Console**
   - Look for JavaScript errors
   - Check network requests to Supabase

2. **Verify Column Names**
   - Ensure frontend code matches database schema
   - Check the updated InstitutionSignUp.tsx file

3. **Test Database Connection**
   - Use the test component to verify connectivity
   - Check if tables are accessible

## 📋 **Complete Setup Checklist**

- [ ] Run diagnostic script to check current state
- [ ] Run fixed migration to create tables
- [ ] Verify migration success messages
- [ ] Test database connection with test component
- [ ] Test complete signup flow
- [ ] Verify photo uploads work
- [ ] Check data is saved correctly

## 🎯 **Expected Results**

After successful setup:

1. **Database**: 3 new tables created with proper relationships
2. **Storage**: Photo upload bucket configured
3. **Frontend**: Multi-step signup working end-to-end
4. **Data**: Institutions, facilities, and photos saved correctly
5. **Navigation**: Smooth flow between steps with progress indicators

## 📞 **Need Help?**

If you're still experiencing issues:

1. **Run the diagnostic script** and share the output
2. **Check browser console** for specific error messages
3. **Verify Supabase connection** in your environment variables
4. **Ensure you're using the latest migration file**

---

**🎉 With the fixed migration, your institution signup system should work perfectly!**
