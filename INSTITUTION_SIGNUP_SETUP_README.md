# 🏫 Institution Signup System Setup Guide

## 📋 Overview
This guide explains how to set up the new 7-step institution signup system with full Supabase backend integration.

## 🗄️ Database Setup

### Step 1: Clean Up Old Tables
First, run the cleanup script to remove old institution-related data:

```sql
-- Run this in Supabase SQL Editor
-- Copy and paste the entire content of: precise_institution_cleanup_fixed.sql
```

### Step 2: Create New Tables
After cleanup, create the new tables:

```sql
-- Run this in Supabase SQL Editor
-- Copy and paste the entire content of: create_institution_tables.sql
```

## 🔧 What Gets Created

### Tables Created:
1. **`institution_signup_steps`** - Stores step-by-step form data
2. **`institutions`** - Main institution records
3. **`institution_verification_logs`** - Tracks verification activities

### Storage Bucket:
- **`institution-documents`** - For file uploads (business license, registration certificate)

### Features:
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic timestamp updates
- ✅ Verification logging
- ✅ Admin verification capabilities
- ✅ Public views for verified institutions

## 🚀 Frontend Integration

### What's Already Done:
1. ✅ **Context Updated** - `InstitutionSignupContext` now includes:
   - Form data storage for all 7 steps
   - Supabase integration functions
   - Validation states
   - Loading states

2. ✅ **Step 1 Updated** - Now includes:
   - Real-time form validation
   - Context data synchronization
   - Supabase save functionality
   - File upload handling
   - Progress indicators

### How It Works:
1. **Form Data Sync**: Local state automatically syncs with context
2. **Real-time Validation**: Form validates as user types
3. **Save to Supabase**: Click "Save Step 1" to persist data
4. **File Uploads**: Documents are uploaded to Supabase Storage
5. **Progress Tracking**: Visual indicators show completion status

## 📱 User Experience

### Step 1 Features:
- **Basic Information**: Institution name, type, year, registration details
- **Contact Details**: Email, phone numbers, website
- **Address Information**: Complete address, city, state, PIN code
- **Legal Information**: Owner details, document uploads, agreements
- **Real-time Validation**: Immediate feedback on field completion
- **Auto-save**: Data is saved to Supabase when user clicks save

### Validation Rules:
- Institution name: Minimum 3 characters, unique
- Email: Must be valid format, unique, educational domain
- Phone: Exactly 10 digits, unique
- PAN: Format ABCDE1234F
- GST: 15-character format (optional)
- Address: Minimum 20 characters
- Documents: PDF/JPG/PNG, max 10MB

## 🔐 Security Features

### Row Level Security (RLS):
- Users can only see their own data
- Admins can view all institutions for verification
- File uploads are restricted to authenticated users

### Data Validation:
- Server-side validation on all fields
- File type and size restrictions
- SQL injection protection via parameterized queries

## 📊 Next Steps

### Ready for Development:
1. ✅ **Step 1 Complete** - Fully integrated with Supabase
2. 🔄 **Steps 2-7** - Ready to implement
3. 🔄 **Admin Panel** - For verification management
4. 🔄 **Email Verification** - For completed signups

### To Implement Step 2:
1. Define Step 2 form fields in context
2. Create Step 2 component
3. Add validation logic
4. Integrate with Supabase
5. Update navigation logic

## 🐛 Troubleshooting

### Common Issues:

#### "Supabase client not found"
- Ensure `src/integrations/supabase/client.ts` exists
- Check environment variables are set

#### "Storage bucket not found"
- Run the `create_institution_tables.sql` script
- Check storage policies are created

#### "RLS policy error"
- Ensure user is authenticated
- Check user role permissions

#### "File upload fails"
- Verify file size < 10MB
- Check file type is PDF/JPG/PNG
- Ensure storage bucket exists

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase tables exist
3. Check RLS policies are enabled
4. Ensure user authentication is working

## 🎯 Success Indicators

You'll know everything is working when:
- ✅ Step 1 form saves to Supabase
- ✅ Files upload to storage bucket
- ✅ Validation works in real-time
- ✅ Progress indicators show correctly
- ✅ No console errors
- ✅ Data persists between page refreshes

---

**Status**: Step 1 Complete ✅ | Steps 2-7 Ready for Development 🚀
