# Step 3 Backend Integration - Complete Setup Guide

## 🎯 **Overview**
This guide will help you set up the complete backend infrastructure for Steps 1, 2, and 3 of the institution signup form. All three steps are now integrated and ready to save data to Supabase.

## 📋 **Prerequisites**
- Supabase project set up and running
- Access to Supabase SQL editor
- Supabase client configured in your frontend

## 🗄️ **Database Setup**

### **Option 1: Complete Table Creation (Recommended)**
Run the complete table creation script that includes all fields for Steps 1, 2, and 3:

```sql
-- Run this script in your Supabase SQL editor
\i create_complete_institution_profiles.sql
```

This script will:
- Drop any existing `institution_profiles` table
- Create a new table with all 3 steps' fields
- Set up proper indexes, triggers, and RLS policies
- Add comprehensive column comments

### **Option 2: Add Step 3 Fields to Existing Table**
If you already have a table with Steps 1 and 2, run this to add Step 3 fields:

```sql
-- Run this script in your Supabase SQL editor
\i add_step3_fields.sql
```

## 🗂️ **Storage Buckets Setup**
Create the necessary storage buckets for file uploads:

```sql
-- Run this script in your Supabase SQL editor
\i create_storage_buckets.sql
```

This creates:
- `institution-photos` bucket (50MB limit, images only)
- `institution-documents` bucket (10MB limit, PDFs and images)
- Proper RLS policies for authenticated users

## 🔧 **Frontend Integration Status**

### **✅ Step 1: Institution Basic Information**
- **Fields**: Institution name, type, establishment year, registration number, PAN, GST, contact info, address, legal documents
- **Storage**: Business license and registration certificate uploads
- **Database**: All fields mapped to `institution_profiles` table
- **Status**: Fully integrated with Supabase

### **✅ Step 2: Institution Details & Facilities**
- **Fields**: Infrastructure details, teaching facilities, laboratory facilities, sports facilities, additional services, photos
- **Storage**: Main building photo, classroom photos, laboratory photos, facilities photos, achievement photos
- **Database**: All fields mapped to `institution_profiles` table
- **Status**: Fully integrated with Supabase

### **✅ Step 3: Courses & Programs Offered**
- **Fields**: Course categories, detailed course information, batch information, admission process
- **Storage**: No file uploads (text-based data only)
- **Database**: All fields mapped to `institution_profiles` table
- **Status**: Fully integrated with Supabase

## 🚀 **How to Use**

### **1. Save Progress Locally**
Each step has a "Save Progress (Local)" button that saves data to `localStorage`:
- Data persists across browser sessions
- No network calls required
- Instant feedback

### **2. Submit to Supabase**
Each step has a "Submit to Supabase" button that:
- Uploads files to Supabase Storage (if applicable)
- Saves all form data to the database
- Provides real-time feedback
- Handles errors gracefully

### **3. Final Submission**
The main form has a "Submit All Steps" function that:
- Validates all required fields across all steps
- Submits data for all completed steps
- Ensures data consistency

## 📊 **Database Schema**

### **Step 1 Fields**
```sql
-- Basic Information
institution_name, institution_type, established_year, registration_number
pan_number, gst_number, official_email, primary_contact_number
secondary_contact_number, website_url

-- Address Information
address, city, state, pin_code, landmark, google_maps_location

-- Legal Information
owner_name, owner_contact_number, business_license
registration_certificate, agree_to_terms, agree_to_background_verification
```

### **Step 2 Fields**
```sql
-- Infrastructure Details
total_classrooms, classroom_capacity, library_available
computer_lab_available, wifi_available, parking_available
cafeteria_available, air_conditioning_available
cctv_security_available, wheelchair_accessible

-- Teaching Facilities
projectors_smart_boards, audio_system
physics_lab, chemistry_lab, biology_lab, computer_lab, language_lab

-- Sports Facilities
indoor_games, outdoor_playground, gymnasium, swimming_pool

-- Additional Services
transportation_provided, hostel_facility, study_material_provided
online_classes, recorded_sessions, mock_tests_assessments
career_counseling, job_placement_assistance

-- Institution Photos
main_building_photo, classroom_photos[], laboratory_photos[]
facilities_photos[], achievement_photos[]
```

### **Step 3 Fields**
```sql
-- Academic Courses
course_categories (JSONB), course_details (JSONB)

-- Batch Information
total_current_students, average_batch_size
student_teacher_ratio, class_timings (JSONB)

-- Admission Process
admission_test_required, minimum_qualification
age_restrictions, admission_fees, security_deposit
refund_policy
```

## 🔐 **Security & Permissions**

### **Row Level Security (RLS)**
- All operations require authentication
- Users can only access their own institution profiles
- Public read access for verified institutions only

### **Storage Policies**
- Authenticated users can upload files
- Files are organized by type and user
- Proper file size and type restrictions

## 🧪 **Testing the Integration**

### **1. Test File Uploads**
- Try uploading a business license (PDF/JPG)
- Try uploading institution photos
- Verify files appear in Supabase Storage

### **2. Test Database Operations**
- Fill out Step 1 and submit to Supabase
- Check the `institution_profiles` table
- Verify all fields are populated correctly

### **3. Test Data Persistence**
- Fill out multiple steps
- Save progress locally
- Refresh the page and verify data restoration

## 🚨 **Common Issues & Solutions**

### **Issue: "Table doesn't exist" Error**
**Solution**: Run the database creation scripts first

### **Issue: "Storage bucket not found" Error**
**Solution**: Run the storage bucket creation script

### **Issue: "Permission denied" Error**
**Solution**: Check that RLS policies are properly configured

### **Issue: "File upload failed" Error**
**Solution**: Verify file size and type restrictions

## 📝 **Next Steps**

### **Immediate Actions Required**
1. Run the database creation script in Supabase
2. Run the storage bucket creation script
3. Test the integration with sample data

### **Future Enhancements**
- Add data validation triggers
- Implement data export functionality
- Add admin dashboard for institution management
- Set up automated email notifications

## 🔗 **File References**

- `create_complete_institution_profiles.sql` - Complete table structure
- `add_step3_fields.sql` - Add Step 3 fields to existing table
- `create_storage_buckets.sql` - Storage bucket setup
- `src/contexts/InstitutionSignupContext.tsx` - Frontend integration logic
- `src/components/institution-signup/Step3.tsx` - Step 3 component

## ✅ **Integration Checklist**

- [ ] Database table created with all fields
- [ ] Storage buckets configured
- [ ] RLS policies set up
- [ ] Frontend context updated
- [ ] Step 3 component integrated
- [ ] File upload functionality tested
- [ ] Database operations tested
- [ ] Error handling verified

## 🎉 **Success Indicators**

When everything is working correctly, you should see:
- ✅ Files uploading to Supabase Storage
- ✅ Data saving to the database
- ✅ Success messages in the UI
- ✅ Data persisting across sessions
- ✅ No console errors related to Supabase

---

**Need Help?** Check the console for detailed error messages and verify that all SQL scripts have been executed successfully in your Supabase project.
