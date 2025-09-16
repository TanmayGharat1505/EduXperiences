# Verification System Setup Instructions

## 🚨 **IMPORTANT: Database Setup Required**

The verification system requires database tables and storage buckets to be created before it can function. Follow these steps to set up the system:

## 📋 **Step 1: Run the Complete Setup Script**

**Use the new comprehensive script** `setup_verification_system_complete.sql` which handles everything in the correct order:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `setup_verification_system_complete.sql`
4. Click **Run** to execute the script

This single script will:
- ✅ Create the `verification-documents` storage bucket
- ✅ Create `verification_requests` table
- ✅ Create `verification_documents` table
- ✅ Set up proper indexes and RLS policies
- ✅ Add `verified` column to `tutor_profiles` if missing
- ✅ Create storage policies for document uploads

## 🔍 **What the Script Does (In Order):**

1. **Storage Bucket Creation** - Creates `verification-documents` bucket first
2. **Database Tables** - Creates verification tables with proper structure
3. **Indexes** - Adds performance indexes for queries
4. **Row Level Security** - Enables RLS on all tables
5. **RLS Policies** - Creates user and admin access policies
6. **Storage Policies** - Sets up secure document upload policies
7. **Permissions** - Grants necessary access to authenticated users
8. **Schema Updates** - Adds verified column to tutor profiles
9. **Verification** - Confirms all components are working

## 🧪 **Step 2: Test the System**

After running the setup script, test the verification system:

1. **Tutor Dashboard**: Navigate to Verification tab
2. **Upload Documents**: Try uploading a test document (PDF, JPEG, PNG, DOC, DOCX)
3. **Admin Dashboard**: Check if verification requests appear
4. **Status Updates**: Verify that status changes reflect immediately

## 📁 **File Structure Created**

```
verification_requests/
├── id (UUID, Primary Key)
├── user_id (UUID, References auth.users)
├── user_type (tutor | institute)
├── status (pending | verified | rejected)
├── rejection_reason (TEXT, optional)
├── verified_by (UUID, References auth.users)
├── verified_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

verification_documents/
├── id (UUID, Primary Key)
├── verification_request_id (UUID, References verification_requests)
├── document_type (government_id | academic_certificate | etc.)
├── document_name (TEXT)
├── file_url (TEXT)
├── file_size (INTEGER)
├── mime_type (TEXT)
├── is_required (BOOLEAN)
├── is_verified (BOOLEAN)
├── verification_notes (TEXT, optional)
├── uploaded_at (TIMESTAMP)
├── verified_at (TIMESTAMP)
└── verified_by (UUID, References auth.users)

Storage Bucket: verification-documents
├── Private bucket (secure)
├── 10MB file size limit
├── Supported: PDF, JPEG, PNG, DOC, DOCX
└── User-specific folders for security
```

## 🔍 **Troubleshooting Common Errors**

### **Error: "Could not find table 'verification_requests'"**
- **Solution**: Run the `setup_verification_system_complete.sql` script
- **Cause**: Tables don't exist yet

### **Error: "StorageApiError: new row violates row-level security policy"**
- **Solution**: Run the `setup_verification_system_complete.sql` script
- **Cause**: Storage bucket or RLS policies not created properly

### **Error: "400 Bad Request" on file upload**
- **Solution**: Run the `setup_verification_system_complete.sql` script
- **Cause**: Storage bucket doesn't exist

### **Error: "Permission denied"**
- **Solution**: Check that RLS policies were created correctly
- **Verify**: User has proper role in `profiles` table
- **Run**: The setup script again to recreate policies

### **Documents not uploading**
- **Check**: Storage bucket exists in Supabase dashboard
- **Verify**: File size is under 10MB
- **Confirm**: File type is supported (PDF, JPEG, PNG, DOC, DOCX)
- **Run**: Setup script if bucket is missing

## 📊 **Admin Access**

To access the verification review system:

1. **User Role**: Must have `role = 'admin'` in the `profiles` table
2. **Admin Dashboard**: Navigate to the "Verification" tab
3. **Review Requests**: View and approve/reject verification requests
4. **Document Review**: Download and review uploaded documents

## 🔄 **Workflow**

1. **Tutor Uploads Documents** → Creates verification request
2. **Admin Reviews Documents** → Views uploaded files
3. **Admin Approves/Rejects** → Updates verification status
4. **Status Reflects Everywhere** → Dashboard, profile, etc.

## 📝 **Important Notes**

- **File Size Limit**: 10MB per document
- **Supported Formats**: PDF, JPEG, PNG, DOC, DOCX
- **Security**: All documents are private and secure
- **Backup**: Documents are stored in Supabase Storage
- **Compliance**: RLS policies ensure data isolation
- **Order Matters**: Storage bucket must be created before RLS policies

## 🆘 **Need Help?**

If you encounter issues:

1. **First**: Run the complete setup script
2. **Check**: Browser console for error messages
3. **Verify**: All SQL scripts executed successfully
4. **Confirm**: Storage bucket exists in Supabase dashboard
5. **Check**: User has proper permissions

## 🚀 **Quick Fix for Current Error**

The error you're seeing (`StorageApiError: new row violates row-level security policy`) means the storage bucket doesn't exist. 

**Immediate Solution**: Run `setup_verification_system_complete.sql` in your Supabase SQL Editor. This will create everything needed in the correct order.

The verification system is designed to be simple and secure, focusing only on essential document uploads and admin review.
