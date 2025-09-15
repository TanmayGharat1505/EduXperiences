# 🏛️ Institution Signup System - Complete Setup Guide

## 📋 Overview
This is a comprehensive, fully working Institution Signup System that includes:
- **Frontend**: Complete signup form with all required fields
- **Backend**: API endpoints for OTP, file upload, and registration
- **Database**: Supabase tables with RLS policies
- **File Storage**: Supabase storage bucket for documents
- **Validation**: Comprehensive server-side and client-side validation
- **OTP System**: Phone verification for primary and owner contacts

## 🚀 Quick Start

### 1. Database Setup
Run the SQL migration in your Supabase dashboard:
```sql
-- Copy and paste the contents of: supabase/migrations/create_institution_system.sql
```

### 2. Environment Variables
Ensure these are set in your `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Install Dependencies
```bash
npm install bcryptjs @types/bcryptjs
```

### 4. Build and Test
```bash
npm run build
npm run dev
```

## 🏗️ System Architecture

### Frontend Components
- **`InstitutionSignupForm`**: Main form component with all fields
- **`OTPVerification`**: Phone verification component
- **`FileUpload`**: Document upload with drag-and-drop
- **`LocationPicker`**: Manual coordinate input
- **`CityAutocomplete`**: Indian cities with state mapping

### Backend APIs
- **`/api/institution/otp/send`**: Send OTP for phone verification
- **`/api/institution/otp/verify`**: Verify OTP
- **`/api/institution/upload`**: Generate signed upload URLs
- **`/api/institution/register`**: Complete registration

### Database Tables
- **`institutions`**: Main institution data
- **`institution_documents`**: Document metadata
- **`phone_otps`**: OTP storage and verification

## 📝 Form Fields

### Basic Information
- Institution Name (unique)
- Institution Type (dropdown)
- Establishment Year (1950-current)
- Registration Number (unique)
- PAN Number (10-char validation)
- GST Number (optional, 15-char validation)
- Official Email (unique, domain validation)
- Website URL (optional, URL validation)

### Contact Information
- Primary Contact (10 digits, OTP verified)
- Secondary Contact (optional, 10 digits)

### Address Information
- Complete Address
- City (autocomplete with Indian cities)
- State (dropdown)
- Pincode (6 digits)
- Landmark (optional)
- Coordinates (optional, manual input)

### Legal Information
- Owner/Director Name
- Owner Contact (10 digits, OTP verified)
- Business License Upload (PDF/JPG/PNG)
- Registration Certificate Upload (PDF/JPG/PNG)

### Terms & Conditions
- Agree to Terms (required)
- Agree to Background Verification (required)

## 🔐 Security Features

### Row Level Security (RLS)
- Public can view approved institutions only
- Institution owners can manage their own data
- Phone-based authentication

### File Upload Security
- Signed URLs for direct upload
- File type validation (PDF, JPG, PNG)
- File size limits (10MB max)
- Secure storage bucket

### OTP System
- Rate limiting (3 OTPs per hour per phone)
- 10-minute expiration
- Hashed storage with bcrypt
- Purpose-based verification

## 📱 OTP Flow

1. **Send OTP**: User enters phone number and clicks send
2. **Verification**: User enters 6-digit OTP
3. **Success**: Phone number marked as verified
4. **Registration**: Both primary and owner contacts must be verified

## 📁 File Upload Flow

1. **Request URL**: Frontend requests signed upload URL
2. **Upload**: File uploaded directly to Supabase storage
3. **Metadata**: File details saved to database
4. **Registration**: File keys included in final submission

## ✅ Validation Rules

### PAN Format
- 10 characters: `AAAAA9999A`
- Regex: `/^[A-Z]{5}[0-9]{4}[A-Z]$/i`

### GST Format
- 15 characters: `12ABCDE1234F1Z5`
- Regex: `/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/i`

### Phone Numbers
- 10 digits only
- Regex: `/^\d{10}$/`

### Pincode
- 6 digits only
- Regex: `/^\d{6}$/`

### Email
- Valid email format
- Disposable domain blocking
- Domain validation

## 🎯 Usage

### For Users
1. Navigate to `/institution-signup-new`
2. Fill out all required fields
3. Verify phone numbers via OTP
4. Upload required documents
5. Submit registration
6. Receive confirmation with Institution ID

### For Developers
- All components are modular and reusable
- TypeScript interfaces for type safety
- Comprehensive error handling
- Responsive design with Tailwind CSS

## 🔧 Customization

### Adding New Institution Types
Update the `institutionTypes` array in `InstitutionSignupForm.tsx`

### Adding New Cities
Update the `indianCities` array in `CityAutocomplete.tsx`

### Modifying Validation Rules
Update validation functions in the form component and API endpoints

### Styling Changes
All styling uses Tailwind CSS classes for easy customization

## 🐛 Troubleshooting

### Common Issues
1. **OTP not sending**: Check Supabase service role key
2. **File upload fails**: Verify storage bucket permissions
3. **Database errors**: Ensure RLS policies are correctly set
4. **Build errors**: Check TypeScript types and imports

### Debug Mode
In development, OTPs are logged to console for testing

## 📊 Testing

### Manual Testing
1. Fill out form with valid data
2. Test OTP verification
3. Upload test documents
4. Submit registration
5. Verify success page

### API Testing
Use tools like Postman to test individual endpoints

## 🚀 Production Deployment

### Environment Setup
- Set production environment variables
- Configure production Supabase instance
- Set up proper email/SMS services for OTP

### Security Considerations
- Enable HTTPS
- Set up proper CORS policies
- Monitor API usage and rate limiting
- Regular security audits

## 📞 Support

For technical support or questions:
- Check the console for error messages
- Verify all environment variables are set
- Ensure Supabase permissions are correct
- Review the validation rules and requirements

---

**🎉 Your Institution Signup System is now ready to use!**
