import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface InstitutionProfile {
  id: string;
  user_id: string;
  organization_name: string;
  institution_type: string;
  established_year: number;
  student_capacity: number;
  contact_person_name: string;
  contact_person_title: string;
  contact_person_email: string;
  contact_person_phone: string;
  description: string;
  website: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstitutionRegistrationData {
  id: string;
  name: string;
  type: string;
  establishment_year: number;
  registration_number: string;
  pan: string;
  gst?: string;
  official_email: string;
  primary_contact: string;
  secondary_contact?: string;
  website?: string;
  complete_address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  owner_name: string;
  owner_contact: string;
  status: string;
  agree_terms: boolean;
  agree_background_verification: boolean;
  primary_contact_verified: boolean;
  owner_contact_verified: boolean;
  created_at: string;
  updated_at: string;
  
  // Additional fields from new schema
  other_institution_type?: string;
  map_location?: string;
  business_license?: string;
  registration_certificate?: string;
  
  // Step 2-6 data (JSONB fields)
  step2_data?: any;
  step3_data?: any;
  step4_data?: any;
  step5_data?: any;
  step6_data?: any;
  
  // Step 7 contact details
  primary_contact_person?: string;
  contact_designation?: string;
  contact_phone_number?: string;
  contact_email_address?: string;
  whatsapp_number?: string;
  best_time_to_contact?: string;
  facebook_page_url?: string;
  instagram_account_url?: string;
  youtube_channel_url?: string;
  linkedin_profile_url?: string;
  google_my_business_url?: string;
  emergency_contact_person?: string;
  local_police_station_contact?: string;
  nearest_hospital_contact?: string;
  fire_department_contact?: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  facultyMembers: number;
  monthlyRevenue: number;
  profileCompletion: number;
  overallRating: number;
  totalReviews: number;
  // New quick stats
  newInquiries: number;
  studentsThisMonth: number;
  revenueThisMonth: number;
  profileViews: number;
  contactRequests: number;
}

export interface RecentActivity {
  id: string;
  type: 'inquiry' | 'admission' | 'payment' | 'review' | 'course_update';
  title: string;
  description: string;
  timestamp: string;
  user_name?: string;
  amount?: number;
  rating?: number;
  status?: string;
}

export interface InstitutionDashboardData {
  profile: InstitutionProfile | null;
  registrationData: InstitutionRegistrationData | null;
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  loading: boolean;
  error: string | null;
}

export function useInstitutionDashboard() {
  const [data, setData] = useState<InstitutionDashboardData>({
    profile: null,
    registrationData: null,
    stats: {
      totalStudents: 0,
      activeCourses: 0,
      facultyMembers: 0,
      monthlyRevenue: 0,
      profileCompletion: 0,
      overallRating: 0,
      totalReviews: 0,
      // New quick stats
      newInquiries: 0,
      studentsThisMonth: 0,
      revenueThisMonth: 0,
      profileViews: 0,
      contactRequests: 0,
    },
    recentActivity: [],
    loading: true,
    error: null,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDashboardData();
    setupRealtimeSubscriptions();
    setupAutoRefresh();

    return () => {
      // Cleanup subscriptions and intervals
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Load user profile - Handle case where profile might not exist yet
      let profile = null;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'institution') // STRICT: Only load institution profiles
        .single();

      if (profileError) {
        console.error('❌ [InstitutionDashboard] Error loading profile:', profileError);
        
        if (profileError.code === 'PGRST116') {
          // No profile found - this is normal for new institution users
          console.log('ℹ️ [InstitutionDashboard] No profile found yet, will create one from institution data');
          profile = null;
        } else {
          // Other error - show error message
          setData(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to load institution profile. Please try refreshing the page.',
          }));
          return;
        }
      } else {
        console.log('🔍 [InstitutionDashboard] Institution profile data loaded:', profileData);
        
        // Double-check role to prevent any mixing
        if (profileData.role !== 'institution') {
          console.error('❌ [InstitutionDashboard] Role mismatch! Expected \'institution\', got:', profileData.role);
          setData(prev => ({
            ...prev,
            loading: false,
            error: 'This dashboard is only for institutions. Please log in with an institution account.',
          }));
          return;
        }
        
        profile = profileData;
      }

      // Load institution profile (exactly like tutor_profiles and student_profiles)
      let registrationData = null;
      
      // Debug: Check if user is authenticated and get user details
      console.log('🔍 [InstitutionDashboard] Debug info:');
      console.log('- User ID:', user.id);
      console.log('- User email:', user.email);
      console.log('- User confirmed:', user.email_confirmed_at);
      
      // Debug: Try to query without .single() first to see if any rows exist
      const { data: debugData, error: debugError } = await supabase
        .from('institution_profiles')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('🔍 [InstitutionDashboard] Debug query results:');
      console.log('- Debug data:', debugData);
      console.log('- Debug error:', debugError);
      console.log('- Number of rows found:', debugData?.length || 0);
      
      const { data: institutionProfileData, error: institutionProfileError } = await supabase
        .from('institution_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (institutionProfileError) {
        console.error('❌ [InstitutionDashboard] Error loading institution profile:', institutionProfileError);
        if (institutionProfileError.code === 'PGRST116') {
          console.log('ℹ️ [InstitutionDashboard] No institution profile found, will create one when profile is updated');
        } else {
          console.log('❌ [InstitutionDashboard] Other error loading institution profile:', institutionProfileError.message);
        }
      } else {
        console.log('Institution profile loaded:', institutionProfileData);
        console.log('Profile data (from profiles table):', profile);
        
        // Map institution_profiles data to registrationData format for display
        registrationData = {
          id: institutionProfileData.id,
          name: institutionProfileData.institution_name || (profile?.full_name) || 'Institution',
          type: institutionProfileData.institution_type || 'Educational Institution',
          establishment_year: institutionProfileData.established_year || new Date().getFullYear(),
          registration_number: institutionProfileData.registration_number || '',
          pan: institutionProfileData.pan_number || '',
          gst: institutionProfileData.gst_number || '',
          official_email: institutionProfileData.official_email || user.email || '',
          primary_contact: institutionProfileData.primary_contact_number || '',
          secondary_contact: institutionProfileData.secondary_contact_number || '',
          website: institutionProfileData.website_url || '',
          complete_address: institutionProfileData.complete_address || '',
          city: institutionProfileData.city || (profile?.city) || '',
          state: institutionProfileData.state || (profile?.area) || '',
          pincode: institutionProfileData.pin_code || '',
          landmark: institutionProfileData.landmark || '',
          latitude: null, // Can be extracted from map_location if needed
          longitude: null, // Can be extracted from map_location if needed
          owner_name: institutionProfileData.owner_director_name || '',
          owner_contact: institutionProfileData.owner_contact_number || '',
          status: institutionProfileData.status || 'pending',
          agree_terms: institutionProfileData.agree_to_terms || false,
          agree_background_verification: institutionProfileData.agree_to_background_verification || false,
          primary_contact_verified: true, // Assuming verified if profile exists
          owner_contact_verified: true, // Assuming verified if profile exists
          created_at: institutionProfileData.created_at || new Date().toISOString(),
          updated_at: institutionProfileData.updated_at || new Date().toISOString(),
          
          // Additional fields from the actual schema
          other_institution_type: institutionProfileData.other_institution_type || '',
          map_location: institutionProfileData.map_location || '',
          business_license: institutionProfileData.business_license || '',
          registration_certificate: institutionProfileData.registration_certificate || '',
          
          // Step 2-6 data (JSONB fields)
          step2_data: institutionProfileData.step2_data || {},
          step3_data: institutionProfileData.step3_data || {},
          step4_data: institutionProfileData.step4_data || {},
          step5_data: institutionProfileData.step5_data || {},
          step6_data: institutionProfileData.step6_data || {},
          
          // Step 7 contact details
          primary_contact_person: institutionProfileData.primary_contact_person || '',
          contact_designation: institutionProfileData.contact_designation || '',
          contact_phone_number: institutionProfileData.contact_phone_number || '',
          contact_email_address: institutionProfileData.contact_email_address || '',
          whatsapp_number: institutionProfileData.whatsapp_number || '',
          best_time_to_contact: institutionProfileData.best_time_to_contact || '',
          facebook_page_url: institutionProfileData.facebook_page_url || '',
          instagram_account_url: institutionProfileData.instagram_account_url || '',
          youtube_channel_url: institutionProfileData.youtube_channel_url || '',
          linkedin_profile_url: institutionProfileData.linkedin_profile_url || '',
          google_my_business_url: institutionProfileData.google_my_business_url || '',
          emergency_contact_person: institutionProfileData.emergency_contact_person || '',
          local_police_station_contact: institutionProfileData.local_police_station_contact || '',
          nearest_hospital_contact: institutionProfileData.nearest_hospital_contact || '',
          fire_department_contact: institutionProfileData.fire_department_contact || '',
        };
      }

      // Fetch dashboard statistics
      const stats = await fetchDashboardStats(user.id);

      // Fetch recent activity
      const recentActivity = await fetchRecentActivity(user.id);

      // Calculate profile completion percentage using registration data
      const profileCompletion = calculateProfileCompletion(profile, registrationData);

      console.log('🔍 [InstitutionDashboard] Final data being set:');
      console.log('- Profile:', profile);
      console.log('- Registration Data:', registrationData);
      console.log('- Profile Completion:', profileCompletion);

      setData({
        profile,
        registrationData,
        stats: {
          ...stats,
          profileCompletion,
        },
        recentActivity,
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
      }));
    }
  };

  const fetchDashboardStats = async (userId: string): Promise<DashboardStats> => {
    try {
      // For now, we'll return default stats since the related tables might not exist yet
      // In a real implementation, you would fetch from:
      // - student_profiles table for total students
      // - courses table for active courses
      // - faculty/staff tables for faculty members
      // - transactions table for revenue
      // - reviews table for ratings

      const defaultStats: DashboardStats = {
        totalStudents: 0,
        activeCourses: 0,
        facultyMembers: 0,
        monthlyRevenue: 0,
        profileCompletion: 0,
        overallRating: 0,
        totalReviews: 0,
        // New quick stats
        newInquiries: 0,
        studentsThisMonth: 0,
        revenueThisMonth: 0,
        profileViews: 0,
        contactRequests: 0,
      };

      // Try to fetch real data where possible
      try {
        // TODO: Fetch real rating and reviews data when reviews table is available
        // For now, we'll keep these at 0 to avoid showing dummy data
        defaultStats.overallRating = 0;
        defaultStats.totalReviews = 0;

        // TODO: Fetch real student inquiries when a proper inquiries table is created
        // For now, we'll keep newInquiries at 0 to avoid showing student-tutor conversations
        defaultStats.newInquiries = 0;

        // Fetch students this month
        try {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          // TODO: Fetch real students data when student_profiles table is available
          defaultStats.studentsThisMonth = 0;
        } catch (error) {
          console.log('Students this month fetch failed, using defaults:', error);
        }

        // Fetch revenue this month
        try {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', userId)
            .gte('created_at', startOfMonth.toISOString())
            .eq('status', 'completed');

          if (!transactionsError && transactions) {
            defaultStats.revenueThisMonth = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
          }
        } catch (error) {
          console.log('Revenue this month fetch failed, using defaults:', error);
        }

        // Profile views and contact requests - using default values since tables don't exist
        // TODO: Create these tables in the database when needed
        defaultStats.profileViews = 0; // No dummy data
        defaultStats.contactRequests = 0; // No dummy data

      } catch (error) {
        console.log('Stats fetch failed, using defaults:', error);
      }

      return defaultStats;
    } catch (error) {
      console.error('Stats fetch error:', error);
      return {
        totalStudents: 0,
        activeCourses: 0,
        facultyMembers: 0,
        monthlyRevenue: 0,
        profileCompletion: 0,
        overallRating: 0,
        totalReviews: 0,
        // New quick stats
        newInquiries: 0,
        studentsThisMonth: 0,
        revenueThisMonth: 0,
        profileViews: 0,
        contactRequests: 0,
      };
    }
  };

  const fetchRecentActivity = async (userId: string): Promise<RecentActivity[]> => {
    try {
      const activities: RecentActivity[] = [];

      // TODO: Fetch real student inquiries when a proper inquiries table is created
      // For now, we'll skip message-based inquiries to avoid showing student-tutor conversations

      // TODO: Fetch real admissions data when student_profiles table is available
      // For now, we'll skip admissions data to avoid showing dummy data

      // Fetch recent payments (transactions) - 5 most recent
      try {
        const { data: payments, error: paymentsError } = await supabase
          .from('transactions')
          .select('id, amount, created_at, user_id')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!paymentsError && payments) {
          payments.forEach(payment => {
            activities.push({
              id: payment.id,
              type: 'payment',
              title: 'Fee Payment Received',
              description: `₹${payment.amount} received from student`,
              timestamp: payment.created_at,
              user_name: 'Student', // We'll need to fetch profile separately if needed
              amount: payment.amount,
            });
          });
        }
      } catch (error) {
        console.log('Payments fetch failed:', error);
      }

      // TODO: Fetch real reviews data when reviews table is available
      // For now, we'll skip reviews data to avoid showing dummy data

      // Fetch recent course updates - 5 most recent
      try {
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, updated_at')
          .eq('tutor_id', userId)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (!coursesError && courses) {
          courses.forEach(course => {
            activities.push({
              id: course.id,
              type: 'course_update',
              title: 'Course Updated',
              description: `Course "${course.title}" has been updated`,
              timestamp: course.updated_at,
            });
          });
        }
      } catch (error) {
        console.log('Course updates fetch failed:', error);
      }

      // Return all activities (up to 30 total: 10 inquiries + 5 each of others)
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    } catch (error) {
      console.error('Recent activity fetch error:', error);
      return [];
    }
  };

  const calculateProfileCompletion = (profile: InstitutionProfile | null, registrationData: InstitutionRegistrationData | null): number => {
    if (!profile && !registrationData) return 0;

    // Check profile fields (only if profile exists)
    const profileFields = [
      'organization_name',
      'institution_type',
      'established_year',
      'contact_person_name',
      'contact_person_title',
      'contact_person_email',
      'contact_person_phone',
      'description',
    ];

    // Check registration data fields (primary source of data)
    const registrationFields = [
      'name',
      'type',
      'establishment_year',
      'registration_number',
      'pan',
      'official_email',
      'primary_contact',
      'complete_address',
      'city',
      'state',
      'pincode',
      'owner_name',
      'owner_contact',
    ];

    let completedFields = 0;
    let totalFields = 0;

    // Count profile fields (only if profile exists)
    if (profile) {
      totalFields += profileFields.length;
      completedFields += profileFields.filter(field => {
        const value = profile[field as keyof InstitutionProfile];
        return value !== null && value !== undefined && value !== '';
      }).length;
    }

    // Count registration fields (primary source)
    if (registrationData) {
      totalFields += registrationFields.length;
      completedFields += registrationFields.filter(field => {
        const value = registrationData[field as keyof InstitutionRegistrationData];
        return value !== null && value !== undefined && value !== '';
      }).length;
    }

    // If no profile exists yet, base completion on registration data only
    if (!profile && registrationData) {
      return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    }

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  const setupRealtimeSubscriptions = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log('User not authenticated, skipping real-time subscriptions');
        return;
      }

      console.log('🔄 [InstitutionDashboard] Setting up real-time subscriptions...');

      // Subscribe to institution profile changes
      const institutionChannel = supabase
        .channel('institution-profile-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'institution_profiles',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔄 [InstitutionDashboard] Institution profile changed:', payload);
            // Refresh data when profile changes
            fetchDashboardData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔄 [InstitutionDashboard] User profile changed:', payload);
            // Refresh data when profile changes
            fetchDashboardData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'courses',
            filter: `tutor_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔄 [InstitutionDashboard] Course changed:', payload);
            // Refresh stats and activity when courses change
            refreshStatsAndActivity();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔄 [InstitutionDashboard] Transaction changed:', payload);
            // Refresh stats and activity when transactions change
            refreshStatsAndActivity();
          }
        )
        .subscribe((status) => {
          console.log('🔄 [InstitutionDashboard] Subscription status:', status);
        });

      channelRef.current = institutionChannel;

    } catch (error) {
      console.error('❌ [InstitutionDashboard] Error setting up real-time subscriptions:', error);
    }
  };

  const setupAutoRefresh = () => {
    // Auto-refresh every 30 seconds to ensure data is up-to-date
    refreshIntervalRef.current = setInterval(() => {
      console.log('🔄 [InstitutionDashboard] Auto-refreshing dashboard data...');
      refreshStatsAndActivity();
    }, 30000); // 30 seconds
  };

  const refreshStatsAndActivity = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return;
      }

      // Refresh stats
      const stats = await fetchDashboardStats(user.id);
      
      // Refresh recent activity
      const recentActivity = await fetchRecentActivity(user.id);

      // Update only stats and activity, not the full profile data
      setData(prev => ({
        ...prev,
        stats: {
          ...stats,
          profileCompletion: prev.stats.profileCompletion, // Keep existing profile completion
        },
        recentActivity,
      }));

      console.log('✅ [InstitutionDashboard] Stats and activity refreshed');
    } catch (error) {
      console.error('❌ [InstitutionDashboard] Error refreshing stats and activity:', error);
    }
  };

  const refreshData = () => {
    console.log('🔄 [InstitutionDashboard] Manual refresh triggered');
    fetchDashboardData();
  };

  return {
    ...data,
    refreshData,
  };
}
