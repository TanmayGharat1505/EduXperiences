# 🏛️ Complete Institution Registration Implementation Guide

## 📋 Overview
This guide will help you implement the complete 7-step institution registration system that properly saves all form data to Supabase and displays it on the dashboard.

## 🚀 Implementation Steps

### Step 1: Update Database Schema
1. **Open Supabase SQL Editor**
2. **Run the complete schema migration:**
   ```sql
   -- Copy and paste the contents of: create_complete_institution_profiles_schema.sql
   ```

### Step 2: Test Database Schema
1. **Run the test script:**
   ```sql
   -- Copy and paste the contents of: test_institution_registration.sql
   ```

### Step 3: Update Frontend Code
The following files have been updated:
- ✅ `src/lib/profile-creation.ts` - Updated to map all 7-step form fields
- ✅ `src/hooks/useInstitutionDashboard.ts` - Updated to load all fields
- ✅ TypeScript interfaces updated

### Step 4: Test the Complete Flow

#### 4.1 Test Registration
1. Go to `/institution-signup`
2. Complete all 7 steps of the form
3. Submit the form
4. Check email verification

#### 4.2 Test Login & Dashboard
1. Login with institution credentials
2. Go to `/institution-dashboard`
3. Verify all registration data is displayed
4. Check "Welcome back, {Institution Name}" message

## 🔍 What's Fixed

### ✅ Database Schema
- **Complete table structure** with all 7-step form fields
- **Proper column types** (TEXT, INTEGER, JSONB, etc.)
- **JSONB fields** for Steps 2-6 (flexible data storage)
- **Individual columns** for Step 1 and Step 7 (structured data)
- **Proper indexes** for performance
- **RLS policies** for security

### ✅ Frontend Integration
- **Form data mapping** from 7-step form to database fields
- **Profile creation** after email verification
- **Dashboard data loading** with all registration details
- **TypeScript types** updated to match schema

### ✅ Data Flow
```
7-Step Form → localStorage → Email Verification → Login → Database Insert → Dashboard Display
```

## 📊 Database Schema Details

### Step 1: Basic Information (Individual Columns)
- `institution_name`, `institution_type`, `established_year`
- `registration_number`, `pan_number`, `gst_number`
- `official_email`, `primary_contact_number`, `secondary_contact_number`
- `website_url`, `complete_address`, `city`, `state`, `pin_code`
- `landmark`, `map_location`, `owner_director_name`, `owner_contact_number`
- `business_license`, `registration_certificate`

### Step 2-6: Complex Data (JSONB Columns)
- `step2_data` - Infrastructure details, facilities, photos
- `step3_data` - Academic programs, courses
- `step4_data` - Staff & faculty information
- `step5_data` - Results & achievements
- `step6_data` - Fee structure, policies

### Step 7: Contact & Verification (Individual Columns)
- `primary_contact_person`, `contact_designation`, `contact_phone_number`
- `contact_email_address`, `whatsapp_number`, `best_time_to_contact`
- Social media URLs: `facebook_page_url`, `instagram_account_url`, etc.
- Emergency contacts: `emergency_contact_person`, `local_police_station_contact`, etc.
- Document uploads: `business_registration_certificate`, `education_board_affiliation_certificate`, etc.

## 🧪 Testing Checklist

### ✅ Registration Form
- [ ] All 7 steps collect data correctly
- [ ] Form validation works
- [ ] File uploads work
- [ ] Form submission stores data in localStorage

### ✅ Email Verification
- [ ] User receives verification email
- [ ] Email verification link works
- [ ] Profile creation happens after verification

### ✅ Database Storage
- [ ] All Step 1 fields saved to individual columns
- [ ] Steps 2-6 data saved to JSONB columns
- [ ] Step 7 fields saved to individual columns
- [ ] No null/empty values for required fields

### ✅ Dashboard Display
- [ ] "Welcome back, {Institution Name}" shows correctly
- [ ] All registration data displays on dashboard
- [ ] Profile completion percentage shows
- [ ] Institution details section shows all data

## 🐛 Troubleshooting

### Issue: Data not saving to database
**Solution:** Check if the new schema was applied correctly
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'institution_profiles' 
ORDER BY ordinal_position;
```

### Issue: Dashboard shows empty data
**Solution:** Check if profile creation is working
```sql
SELECT * FROM institution_profiles WHERE user_id = 'your-user-id';
```

### Issue: TypeScript errors
**Solution:** Restart TypeScript server and check if all interfaces are updated

## 📈 Next Steps

1. **Test thoroughly** with real data
2. **Add file upload handling** for documents
3. **Implement profile editing** functionality
4. **Add admin approval workflow**
5. **Create institution listing page**

## 🎉 Success Criteria

✅ **Registration Form**: Collects all 7-step data  
✅ **Database Storage**: Saves all data to Supabase  
✅ **Dashboard Display**: Shows all registration data  
✅ **User Experience**: Smooth flow from signup to dashboard  

The institution registration system now works exactly like the tutor registration system - collecting comprehensive data, storing it properly in the database, and displaying it on the dashboard!
