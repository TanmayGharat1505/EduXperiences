# 🏛️ Institution Signup Page 2 - Complete Setup Guide

## 📋 Overview

This is **Page 2** of the Institution Signup process, which collects detailed information about:
- **Infrastructure Details** (classrooms, facilities, amenities)
- **Teaching Facilities** (projectors, labs, sports)
- **Additional Services** (transportation, hostel, counseling)
- **Institution Photos** (building, classrooms, facilities)

## 🚀 Quick Start

### 1. Database Setup

Run this SQL migration in your Supabase dashboard:

```sql
-- Copy and paste the contents of: supabase/migrations/create_simple_institution_system.sql
```

This creates:
- `institutions` table (basic info from Page 1)
- `institution_facilities` table (facilities and services)
- `institution_photos` table (photo metadata)
- Storage bucket for photo uploads

### 2. Test the System

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to institution signup:**
   ```
   http://localhost:5173/institution-signup
   ```

3. **Complete Page 1** (Basic Information)
4. **Automatically proceed to Page 2** (Facilities & Details)
5. **Complete Page 2** and see success message

## 🏗️ System Architecture

### Multi-Step Flow

```
Page 1: Basic Information → Page 2: Facilities & Details → Success Page
     ↓                              ↓                        ↓
Basic Info                    Infrastructure           Registration
- Name                       - Classrooms            Complete!
- Type                       - Facilities            - Review Process
- Contact                    - Services              - Next Steps
- Address                    - Photos                - Contact Info
```

### Database Tables

#### `institutions` (Page 1 Data)
- Basic institution information
- Contact details
- Address information
- Terms agreement

#### `institution_facilities` (Page 2 Data)
- Infrastructure details (classrooms, capacity)
- Facility availability (library, lab, WiFi, etc.)
- Teaching facilities (projectors, audio)
- Laboratory and sports facilities
- Additional services

#### `institution_photos` (Page 2 Data)
- Photo metadata and storage URLs
- Categorized by type (building, classroom, lab, etc.)
- Upload order and primary photo designation

## 📝 Form Fields

### Infrastructure Details
- **Total Classrooms**: Number input (1-100, required)
- **Classroom Capacity**: Optional number input
- **Facilities**: Radio buttons (Yes/No) for:
  - Library, Computer Lab, WiFi, Parking
  - Cafeteria, Air Conditioning, CCTV, Wheelchair Access

### Teaching Facilities
- **Projectors/Smart Boards**: Radio (Yes/No)
- **Audio System**: Radio (Yes/No)
- **Laboratory Facilities**: Checkboxes for:
  - Physics, Chemistry, Biology, Computer, Language Lab
- **Sports Facilities**: Checkboxes for:
  - Indoor Games, Outdoor Playground, Gymnasium, Swimming Pool

### Additional Services
- **Transportation**: Radio (Yes/No)
- **Hostel Facility**: Radio (Yes/No)
- **Study Material**: Radio (Yes/No)
- **Online Classes**: Radio (Yes/No)
- **Recorded Sessions**: Radio (Yes/No)
- **Mock Tests**: Radio (Yes/No)
- **Career Counseling**: Radio (Yes/No)
- **Job Placement**: Radio (Yes/No)

### Photo Uploads
- **Main Building Photo**: Required, single upload
- **Classroom Photos**: Optional, max 10 photos
- **Laboratory Photos**: Optional, multiple
- **Facilities Photos**: Optional, multiple
- **Achievement Photos**: Optional, multiple

## 🔧 Technical Implementation

### Frontend Components

- **`InstitutionSignUp.tsx`**: Page 1 - Basic information form
- **`InstitutionDetailsPage2.tsx`**: Page 2 - Facilities and photos
- **`InstitutionSignupComplete.tsx`**: Success page after completion

### Backend Integration

- **Supabase Client**: Direct database integration
- **Storage Bucket**: Photo uploads to `institution-photos`
- **Real-time Validation**: Form validation and error handling
- **Progress Tracking**: Upload progress for photos

### File Upload System

- **Drag & Drop**: Intuitive photo upload interface
- **Preview**: Thumbnail previews with delete functionality
- **Type Categorization**: Photos automatically categorized
- **Size Limits**: 10MB per photo, multiple formats supported

## 🎨 UI Features

### Progress Indicators
- Step counter (Step 1 of 2, Step 2 of 2)
- Visual progress bars
- Clear navigation between steps

### Form Design
- Responsive grid layouts
- Logical field grouping
- Clear labels and validation
- Helpful placeholder text

### Photo Management
- Visual photo grid
- Hover effects for actions
- Type badges on thumbnails
- Easy deletion with confirmation

## 🚨 Important Notes

### ⚠️ Requirements
- **Main Building Photo**: Required to proceed
- **Total Classrooms**: Must be 1-100
- **Database Setup**: Must run migration first
- **Supabase Config**: Environment variables must be set

### 🔒 Security
- RLS policies enabled on all tables
- Photo storage with proper access controls
- Input validation on all fields
- File type and size restrictions

### 📱 Responsiveness
- Mobile-first design
- Touch-friendly photo uploads
- Responsive grid layouts
- Optimized for all screen sizes

## 🐛 Troubleshooting

### Common Issues

1. **"Table doesn't exist" Error**
   - Run the database migration first
   - Check Supabase connection

2. **Photo Upload Fails**
   - Verify storage bucket exists
   - Check file size limits (10MB)
   - Ensure proper file types

3. **Navigation Issues**
   - Clear browser cache
   - Check routing configuration
   - Verify component imports

4. **Form Validation Errors**
   - Check required field completion
   - Verify data types (numbers, booleans)
   - Ensure photo uploads complete

### Debug Steps

1. **Check Browser Console** for JavaScript errors
2. **Verify Database Tables** exist in Supabase
3. **Test Supabase Connection** with simple queries
4. **Check Environment Variables** are properly set

## 🚀 Next Steps

After successful implementation:

1. **Customize Validation Rules** as needed
2. **Add Admin Review Interface** for submissions
3. **Implement Email Notifications** for new registrations
4. **Add Analytics Dashboard** for signup metrics
5. **Integrate with Payment System** if required

## 📞 Support

For technical support or questions:
- Check the browser console for error messages
- Verify all database tables are created
- Ensure Supabase environment variables are set
- Review the migration file for any syntax errors

---

**🎉 Congratulations!** You now have a fully functional, multi-step institution signup system with comprehensive facilities management and photo uploads.
