import { supabase } from "@/integrations/supabase/client";

export async function createTutorProfileAfterVerification(userId: string, formData: any) {
  try {
    console.log('Creating tutor profile after email verification...');
    console.log('User ID:', userId);
    console.log('Form data keys:', Object.keys(formData));

    // First, try to create the basic profile
    console.log('Attempting to create basic profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: formData.fullName || 'Tutor',
        city: formData.city || 'Unknown',
        area: formData.area || 'Unknown',
        role: 'tutor',
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    } else {
      console.log('Basic profile created successfully');
    }

    // Then, try to create the tutor profile
    console.log('Attempting to create tutor profile...');
    const { error: tutorProfileError } = await supabase
      .from('tutor_profiles')
      .insert({
        user_id: userId,
        bio: formData.teachingMethodology || formData.profileHeadline || 'Experienced tutor',
        experience_years: parseInt(formData.teachingExperience?.split('-')[0]) || 0,
        hourly_rate_min: parseInt(formData.individualFee) || 0,
        hourly_rate_max: parseInt(formData.groupFee) || 0,
        teaching_mode: formData.classType || 'online',
        qualifications: {
          highest_qualification: formData.highestQualification,
          university: formData.universityName,
          year_of_passing: formData.yearOfPassing,
          percentage: formData.percentage,
          subjects: formData.subjects || [],
          student_levels: formData.studentLevels || [],
          curriculum: formData.curriculum || [],
        },
        availability: {
          available_days: formData.availableDays || [],
          time_slots: formData.timeSlots || {},
          max_travel_distance: formData.maxTravelDistance || 10,
        },
        verified: false,
      });

    if (tutorProfileError) {
      console.error('Tutor profile creation error:', tutorProfileError);
      return { 
        success: false, 
        error: `Tutor profile creation failed: ${tutorProfileError.message}` 
      };
    } else {
      console.log('Tutor profile created successfully');
    }

    // Upload profile photo if provided
    if (formData.profilePhoto) {
      try {
        const fileExt = formData.profilePhoto.name.split('.').pop();
        const fileName = `${userId}-profile.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, formData.profilePhoto);

        if (!uploadError) {
          // Update profile with photo URL
          const { data: photoData } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);

          await supabase
            .from('profiles')
            .update({ profile_photo_url: photoData.publicUrl })
            .eq('user_id', userId);
        }
      } catch (uploadError) {
        console.warn('Profile photo upload failed after verification:', uploadError);
      }
    }

    return { 
      success: true, 
      message: 'Tutor profile created successfully' 
    };
  } catch (error) {
    console.error('Profile creation after verification failed:', error);
    return { success: false, error };
  }
}

export function getPendingTutorProfile() {
  const pending = localStorage.getItem('pendingTutorProfile');
  if (pending) {
    try {
      const data = JSON.parse(pending);
      // Check if data is not too old (24 hours)
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data;
      } else {
        localStorage.removeItem('pendingTutorProfile');
      }
    } catch (error) {
      console.error('Error parsing pending tutor profile:', error);
      localStorage.removeItem('pendingTutorProfile');
    }
  }
  return null;
}

export function clearPendingTutorProfile() {
  localStorage.removeItem('pendingTutorProfile');
}

export async function createStudentProfileAfterVerification(userId: string, formData: any) {
  try {
    console.log('Creating student profile after email verification...');
    console.log('User ID:', userId);
    console.log('Form data keys:', Object.keys(formData));

    // First, try to create the basic profile
    console.log('Attempting to create basic profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: formData.fullName || 'Student',
        city: formData.city || 'Unknown',
        area: formData.area || 'Unknown',
        role: 'student',
        primary_language: formData.primaryLanguage || 'English',
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    } else {
      console.log('Basic profile created successfully');
    }

    // Then, try to create the student profile
    console.log('Attempting to create student profile...');
    const { error: studentProfileError } = await supabase
      .from('student_profiles')
      .insert({
        user_id: userId,
        date_of_birth: formData.dateOfBirth,
        education_level: formData.educationLevel || 'High School',
        instruction_language: formData.primaryLanguage || 'English',
        onboarding_completed: false,
        profile_completion_percentage: 0,
      });

    if (studentProfileError) {
      console.error('Student profile creation error:', studentProfileError);
      return { 
        success: false, 
        error: `Student profile creation failed: ${studentProfileError.message}` 
      };
    } else {
      console.log('Student profile created successfully');
    }

    // Upload profile photo if provided
    if (formData.profilePhoto) {
      try {
        const fileExt = formData.profilePhoto.name.split('.').pop();
        const fileName = `${userId}-profile.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, formData.profilePhoto);

        if (!uploadError) {
          // Update profile with photo URL
          const { data: photoData } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);

          await supabase
            .from('profiles')
            .update({ profile_photo_url: photoData.publicUrl })
            .eq('user_id', userId);
        }
      } catch (uploadError) {
        console.warn('Profile photo upload failed after verification:', uploadError);
      }
    }

    return { 
      success: true, 
      message: 'Student profile created successfully' 
    };
  } catch (error) {
    console.error('Profile creation after verification failed:', error);
    return { success: false, error };
  }
}

export function getPendingStudentProfile() {
  const pending = localStorage.getItem('pendingStudentProfile');
  if (pending) {
    try {
      const data = JSON.parse(pending);
      // Check if data is not too old (24 hours)
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data;
      } else {
        localStorage.removeItem('pendingStudentProfile');
      }
    } catch (error) {
      console.error('Error parsing pending student profile:', error);
      localStorage.removeItem('pendingStudentProfile');
    }
  }
  return null;
}

export function clearPendingStudentProfile() {
  localStorage.removeItem('pendingStudentProfile');
}

export async function createInstitutionProfileAfterVerification(userId: string, formData: any) {
  try {
    console.log('Creating institution profile after email verification...');
    console.log('User ID:', userId);
    console.log('Form data keys:', Object.keys(formData));

    // Create basic profile in profiles table (exactly like tutor/student signup)
    console.log('Attempting to create basic profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: formData.step1?.institutionName || 'Institution',
        city: formData.step1?.city || 'Unknown',
        area: formData.step1?.state || 'Unknown',
        role: 'institution',
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return { 
        success: false, 
        error: `Profile creation failed: ${profileError.message}` 
      };
    } else {
      console.log('Basic profile created successfully');
    }

    // Create institution profile with all 7-step data (exactly like tutor_profiles and student_profiles)
    console.log('Attempting to create institution profile...');
    const { error: institutionProfileError } = await supabase
      .from('institution_profiles')
      .insert({
        user_id: userId,
        
        // Step 1: Basic Information
        institution_name: formData.step1?.institutionName || 'Institution',
        institution_type: formData.step1?.institutionType || 'Educational Institution',
        other_institution_type: formData.step1?.otherInstitutionType || null,
        established_year: parseInt(formData.step1?.establishmentYear) || new Date().getFullYear(),
        registration_number: formData.step1?.registrationNumber || '',
        pan_number: formData.step1?.panNumber || '',
        gst_number: formData.step1?.gstNumber || null,
        official_email: formData.step1?.officialEmail || '',
        primary_contact_number: formData.step1?.primaryContact || '',
        secondary_contact_number: formData.step1?.secondaryContact || null,
        website_url: formData.step1?.websiteUrl || null,
        complete_address: formData.step1?.completeAddress || '',
        city: formData.step1?.city || '',
        state: formData.step1?.state || '',
        pin_code: formData.step1?.pinCode || '',
        landmark: formData.step1?.landmark || null,
        map_location: formData.step1?.mapLocation || null,
        owner_director_name: formData.step1?.ownerDirectorName || '',
        owner_contact_number: formData.step1?.ownerContactNumber || '',
        business_license: formData.step1?.businessLicenseFile || null,
        registration_certificate: formData.step1?.registrationCertificateFile || null,
        
        // Step 2-6: Store as JSONB for flexibility
        step2_data: formData.step2 || {},
        step3_data: formData.step3 || {},
        step4_data: formData.step4 || {},
        step5_data: formData.step5 || {},
        step6_data: formData.step6 || {},
        
        // Step 7: Contact & Verification (extract specific fields)
        primary_contact_person: formData.step7?.primaryContactPerson || '',
        contact_designation: formData.step7?.designation || '',
        contact_phone_number: formData.step7?.directPhoneNumber || '',
        contact_email_address: formData.step7?.emailAddress || '',
        whatsapp_number: formData.step7?.whatsappNumber || '',
        best_time_to_contact: formData.step7?.bestTimeToContact || '',
        facebook_page_url: formData.step7?.facebookPageUrl || '',
        instagram_account_url: formData.step7?.instagramAccountUrl || '',
        youtube_channel_url: formData.step7?.youtubeChannelUrl || '',
        linkedin_profile_url: formData.step7?.linkedinProfileUrl || '',
        google_my_business_url: formData.step7?.googleMyBusinessUrl || '',
        emergency_contact_person: formData.step7?.emergencyContactPerson || '',
        local_police_station_contact: formData.step7?.localPoliceStationContact || '',
        nearest_hospital_contact: formData.step7?.nearestHospitalContact || '',
        fire_department_contact: formData.step7?.fireDepartmentContact || '',
        business_registration_certificate: formData.step7?.businessRegistrationCertificate || null,
        education_board_affiliation_certificate: formData.step7?.educationBoardAffiliationCertificate || null,
        fire_safety_certificate: formData.step7?.fireSafetyCertificate || null,
        building_plan_approval: formData.step7?.buildingPlanApproval || null,
        pan_card_document: formData.step7?.panCardDocument || null,
        gst_certificate_document: formData.step7?.gstCertificateDocument || null,
        bank_account_details_document: formData.step7?.bankAccountDetailsDocument || null,
        institution_photographs: formData.step7?.institutionPhotographs || [],
        insurance_documents: formData.step7?.insuranceDocuments || [],
        accreditation_certificates: formData.step7?.accreditationCertificates || [],
        award_certificates: formData.step7?.awardCertificates || [],
        faculty_qualification_certificates: formData.step7?.facultyQualificationCertificates || [],
        safety_compliance_certificates: formData.step7?.safetyComplianceCertificates || [],
        
        // Legal agreements
        agree_to_terms: formData.step7?.agreeToTerms || false,
        agree_to_background_verification: formData.step7?.agreeToBackgroundVerification || false,
        
        // Status
        verified: false,
        status: 'pending',
      });

    if (institutionProfileError) {
      console.error('Institution profile creation error:', institutionProfileError);
      return { 
        success: false, 
        error: `Institution profile creation failed: ${institutionProfileError.message}` 
      };
    } else {
      console.log('Institution profile created successfully');
    }

    // Upload profile photo if provided (exactly like tutor/student)
    if (formData.step1?.profilePhoto) {
      try {
        const fileExt = formData.step1.profilePhoto.name.split('.').pop();
        const fileName = `${userId}-profile.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, formData.step1.profilePhoto);

        if (!uploadError) {
          // Update profile with photo URL
          const { data: photoData } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);

          await supabase
            .from('profiles')
            .update({ profile_photo_url: photoData.publicUrl })
            .eq('user_id', userId);
        }
      } catch (uploadError) {
        console.warn('Profile photo upload failed after verification:', uploadError);
      }
    }
    
    return { 
      success: true, 
      message: 'Institution profile created successfully' 
    };
  } catch (error) {
    console.error('Profile creation after verification failed:', error);
    return { success: false, error };
  }
}

export function getPendingInstitutionProfile() {
  const pending = localStorage.getItem('pendingInstitutionProfile');
  if (pending) {
    try {
      const data = JSON.parse(pending);
      // Check if data is not too old (24 hours)
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data;
      } else {
        localStorage.removeItem('pendingInstitutionProfile');
      }
    } catch (error) {
      console.error('Error parsing pending institution profile:', error);
      localStorage.removeItem('pendingInstitutionProfile');
    }
  }
  return null;
}

export function clearPendingInstitutionProfile() {
  localStorage.removeItem('pendingInstitutionProfile');
} 