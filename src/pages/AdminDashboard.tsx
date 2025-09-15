import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminAuthenticated, adminLogout, getAdminSession } from "@/lib/admin-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle, 
  LogOut,
  FileText,
  MessageSquare,
  Star,
  Image,
  AlertTriangle,
  Eye,
  Trash2,
  Flag,
  BarChart3,
  RefreshCw,
  Activity,
  TrendingUp,
  ExternalLink,
  Building2,
} from "lucide-react";
import PricingManagement from '@/components/admin/PricingManagement';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  verification_status: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  verified: boolean;
  created_at: string;
  user_email: string;
  type?: 'tutor' | 'institution';
}

interface Review {
  id: string;
  reviewer_id: string;
  tutor_id: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
  reviewer_email: string;
  tutor_email: string;
}

interface Content {
  id: string;
  user_id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  status: string;
  created_at: string;
  user_email: string;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'payment' | 'payout' | 'refund' | 'fee';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  payment_method?: string;
  transaction_id?: string;
}

interface Payout {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal' | 'stripe';
  account_details: string;
  created_at: string;
  processed_at?: string;
  user_email: string;
  notes?: string;
}

interface Refund {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  created_at: string;
  processed_at?: string;
  admin_notes?: string;
  original_transaction: Transaction;
}

interface Fee {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  currency: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InstitutionSubmission {
  id: string;
  user_id: string;
  email: string;
  institutionName: string;
  institutionType: string;
  registrationNumber: string;
  submittedAt: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  documents: {
    businessRegistrationCertificate?: string;
    educationBoardAffiliationCertificate?: string;
    fireSafetyCertificate?: string;
    buildingPlanApproval?: string;
    panCard?: string;
    gstCertificate?: string;
    bankAccountDetails?: string;
    institutionPhotographs?: string[];
  };
  basicInformation: {
    institutionName: string;
    institutionType: string;
    registrationNumber: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    ownerName: string;
    ownerPhone: string;
  };
  // Additional data from other tables
  institutionDetails?: any; // Facilities, capacity, etc.
  academicPrograms?: any[]; // Academic programs offered
  faculty?: any[]; // Faculty and staff information
  results?: any; // Results and achievements
  feePolicies?: any; // Fee structure and policies
  contactVerification?: any; // Contact verification status
  photos?: any[]; // Institution photos
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface AnalyticsData {
  userGrowth: {
    totalUsers: number;
    newUsersThisMonth: number;
    newUsersThisWeek: number;
    activeUsers: number;
    userGrowthRate: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    monthlyRevenue: number;
    weeklyRevenue: number;
    revenueGrowthRate: number;
    averageTransactionValue: number;
  };
  engagementMetrics: {
    totalSessions: number;
    activeTutors: number;
    activeStudents: number;
    contentUploads: number;
    reviewSubmissions: number;
  };
  platformPerformance: {
    totalProfiles: number;
    verificationRate: number;
    contentApprovalRate: number;
    averageRating: number;
    responseTime: number;
  };
  timeSeriesData: {
    dates: string[];
    userCounts: number[];
    revenueData: number[];
    sessionCounts: number[];
  };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [institutionSubmissions, setInstitutionSubmissions] = useState<InstitutionSubmission[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("verification");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionSubmission | null>(null);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadAllData();
    
    // Set up real-time subscriptions
    const setupRealtimeSubscriptions = () => {
      // Users subscription - monitor both users and public_users tables
      const usersSubscription = supabase
        .channel('admin-users-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
          loadUsers();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'public_users' }, () => {
          loadUsers();
        })
        .subscribe();

      // Profiles subscription
      const profilesSubscription = supabase
        .channel('admin-profiles-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tutor_profiles' }, () => {
          loadProfiles();
          loadUsers(); // Also reload users when profiles change
        })
        .subscribe();

      // Reviews subscription
      const reviewsSubscription = supabase
        .channel('admin-reviews-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
          loadReviews();
        })
        .subscribe();

      // Content subscription
      const contentSubscription = supabase
        .channel('admin-content-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tutor_content' }, () => {
          loadContent();
        })
        .subscribe();

      // Transactions subscription
      const transactionsSubscription = supabase
        .channel('admin-transactions-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
          loadTransactions();
        })
        .subscribe();

      // Payouts subscription
      const payoutsSubscription = supabase
        .channel('admin-payouts-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payouts' }, () => {
          loadPayouts();
        })
        .subscribe();

      // Refunds subscription
      const refundsSubscription = supabase
        .channel('admin-refunds-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'refunds' }, () => {
          loadRefunds();
        })
        .subscribe();



      // Return cleanup function
      return () => {
        usersSubscription.unsubscribe();
        profilesSubscription.unsubscribe();
        reviewsSubscription.unsubscribe();
        contentSubscription.unsubscribe();
        transactionsSubscription.unsubscribe();
        payoutsSubscription.unsubscribe();
        refundsSubscription.unsubscribe();

      };
    };

    const cleanup = setupRealtimeSubscriptions();
    
    return cleanup;
  }, [navigate]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      
      // Load data with error handling for each function
      const loadPromises = [
        loadUsers().catch(error => {
          console.warn('Failed to load users:', error);
          return null;
        }),
        loadProfiles().catch(error => {
          console.warn('Failed to load profiles:', error);
          return null;
        }),
        loadReviews().catch(error => {
          console.warn('Failed to load reviews:', error);
          return null;
        }),
        loadContent().catch(error => {
          console.warn('Failed to load content:', error);
          return null;
        }),
        loadTransactions().catch(error => {
          console.warn('Failed to load transactions:', error);
          return null;
        }),
        loadPayouts().catch(error => {
          console.warn('Failed to load payouts:', error);
          return null;
        }),
        loadRefunds().catch(error => {
          console.warn('Failed to load refunds:', error);
          return null;
        }),

        loadFees().catch(error => {
          console.warn('Failed to load fees:', error);
          return null;
        }),
        loadInstitutionSubmissions().catch(error => {
          console.warn('Failed to load institution submissions:', error);
          return null;
        }),
        loadAnalytics().catch(error => {
          console.warn('Failed to load analytics:', error);
          return null;
        })
      ];

      await Promise.allSettled(loadPromises);
      
      // Show success message if at least some data loaded
      const hasAnyData = users.length > 0 || profiles.length > 0 || reviews.length > 0 || 
                         content.length > 0 || transactions.length > 0 || payouts.length > 0 || 
                         refunds.length > 0 || fees.length > 0 || institutionSubmissions.length > 0;
      
      console.log('Data loading summary:', {
        users: users.length,
        profiles: profiles.length,
        reviews: reviews.length,
        content: content.length,
        transactions: transactions.length,
        payouts: payouts.length,
        refunds: refunds.length,
        fees: fees.length,
        institutionSubmissions: institutionSubmissions.length
      });
      
      if (hasAnyData) {
        toast({
          title: "Success",
          description: `Admin dashboard loaded successfully. Found ${users.length} users, ${profiles.length} profiles.`,
        });
      } else {
        toast({
          title: "Info",
          description: "Dashboard loaded. Some tables may not exist yet. Check the database setup guide.",
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please check database setup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

    const loadUsers = async () => {
    try {
      console.log('Loading users...');
      
      // Try to get users from users table first (should contain all users)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.warn('Error loading from users table:', usersError);
        
        // Fallback to public_users table
        const { data: publicUsersData, error: publicUsersError } = await supabase
          .from('public_users')
          .select('*')
          .order('created_at', { ascending: false });

        if (publicUsersError) {
          console.warn('Error loading from public_users table:', publicUsersError);
          
          // If both tables fail, try to create users from existing data
          await createUsersFromExistingData();
        } else {
          console.log('Loaded users from public_users table:', publicUsersData?.length || 0);
          // Show all users, but ensure students are auto-approved
          const processedUsers = (publicUsersData || []).map(user => {
            if (user.role === 'student') {
              return { ...user, verification_status: 'approved' }; // Students are auto-approved
            }
            return user;
          });
          setUsers(processedUsers);
        }
      } else {
        console.log('Loaded users from users table:', usersData?.length || 0);
        // Show all users, but ensure students are auto-approved
        const processedUsers = (usersData || []).map(user => {
          if (user.role === 'student') {
            return { ...user, verification_status: 'approved' }; // Students are auto-approved
          }
          return user;
        });
        setUsers(processedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Try to create users from existing data as last resort
      await createUsersFromExistingData();
    }
  };

  const createUsersFromExistingData = async () => {
    try {
      console.log('Creating users from existing data...');
      
      // Get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error getting auth users:', authError);
        return;
      }

      // Get tutor profiles
      const { data: tutorProfiles, error: tutorError } = await supabase
        .from('tutor_profiles')
        .select('user_id, verified')
        .limit(100);

      if (tutorError) {
        console.warn('Error getting tutor profiles:', tutorError);
      }

      // Get institution profiles
      const { data: institutionProfiles, error: institutionError } = await supabase
        .from('institution_profiles')
        .select('user_id, verified')
        .limit(100);

      if (institutionError) {
        console.warn('Error getting institution profiles:', institutionError);
      }

      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, role')
        .limit(100);

      if (profilesError) {
        console.warn('Error getting profiles:', profilesError);
      }

      // Create users array - ALL users, but students are auto-approved
      const usersArray = authUsers.users.map(authUser => {
        const isTutor = tutorProfiles?.some(tp => tp.user_id === authUser.id);
        const isInstitution = institutionProfiles?.some(ip => ip.user_id === authUser.id);
        const profile = profiles?.find(p => p.user_id === authUser.id);
        
        // Determine role - prioritize explicit role from profiles table
        let role = profile?.role;
        if (!role) {
          if (isTutor) role = 'tutor';
          else if (isInstitution) role = 'institution';
          else role = 'user'; // fallback
        }
        
        // Set verification status based on role
        let verification_status = 'approved'; // Default to approved
        if (role === 'tutor' || role === 'institution') {
          verification_status = (isTutor || isInstitution) ? 'pending' : 'pending';
        } else if (role === 'student') {
          verification_status = 'approved'; // Students are auto-approved
        }
        
        return {
          id: authUser.id,
          user_id: authUser.id,
          email: authUser.email || 'unknown@example.com',
          role: role,
          verification_status: verification_status,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at
        };
      });

      console.log('Created users from existing data (all users):', usersArray.length);
      setUsers(usersArray);
      
      // Try to save to users table for future use
      try {
        await supabase.from('users').upsert(usersArray, { onConflict: 'user_id' });
      } catch (saveError) {
        console.warn('Could not save users to table:', saveError);
      }
    } catch (error) {
      console.error('Error creating users from existing data:', error);
      // Set empty array as last resort
      setUsers([]);
    }
  };

  const loadProfiles = async () => {
    try {
      console.log('Loading profiles...');
      
      // First check if tutor_profiles table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('tutor_profiles')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn('tutor_profiles table not accessible:', tableError);
        setProfiles([]);
        return;
      }

      // Load profiles with proper join
      const { data, error } = await supabase
        .from('tutor_profiles')
        .select(`
          *,
          profiles!tutor_profiles_user_id_fkey(full_name, profile_photo_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading profiles with join:', error);
        
        // Fallback: load just tutor_profiles without join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('tutor_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          console.warn('Error loading profiles fallback:', fallbackError);
          setProfiles([]);
          return;
        }

        // Create basic profile data without join
        const profilesData = fallbackData?.map(profile => ({
          id: profile.id,
          user_id: profile.user_id,
          full_name: `Tutor ${profile.user_id?.slice(0, 8) || 'Unknown'}`,
          bio: profile.bio || 'N/A',
          avatar_url: '',
          verified: profile.verified || false,
          created_at: profile.created_at,
          user_email: profile.user_id || 'N/A'
        })) || [];

        setProfiles(profilesData);
        return;
      }
      
      const profilesData = data?.map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.profiles?.full_name || `Tutor ${profile.user_id?.slice(0, 8) || 'Unknown'}`,
        bio: profile.bio || 'N/A',
        avatar_url: profile.profiles?.profile_photo_url || '',
        verified: profile.verified || false,
        created_at: profile.created_at,
        user_email: profile.user_id || 'N/A'
      })) || [];

      console.log('Loaded profiles:', profilesData.length);
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles([]);
    }
  };

  const loadReviews = async () => {
    try {
      console.log('Loading reviews...');
      
      // Check if reviews table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('reviews')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn('reviews table not accessible:', tableError);
        setReviews([]);
        return;
      }

      // Try to load with join first
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading reviews:', error);
        setReviews([]);
        return;
      }
      
      const reviewsData = data?.map(review => ({
        id: review.id,
        reviewer_id: review.reviewer_id,
        tutor_id: review.tutor_id,
        rating: review.rating,
        comment: review.review_text,
        status: review.status || 'pending',
        created_at: review.created_at,
        reviewer_email: review.reviewer_id || 'N/A',
        tutor_email: review.tutor_id || 'N/A'
      })) || [];

      console.log('Loaded reviews:', reviewsData.length);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    }
  };

  const loadContent = async () => {
    try {
      console.log('Loading content...');
      
      // Check if tutor_content table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('tutor_content')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn('tutor_content table not accessible:', tableError);
        setContent([]);
        return;
      }

      // Load content without complex joins
      const { data, error } = await supabase
        .from('tutor_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading content:', error);
        setContent([]);
        return;
      }
      
      const contentData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title || 'N/A',
        description: item.description || 'N/A',
        file_url: item.file_url || '',
        file_type: item.file_type || 'unknown',
        status: item.status || 'pending',
        created_at: item.created_at,
        user_email: item.user_id || 'N/A'
      })) || [];

      console.log('Loaded content:', contentData.length);
      setContent(contentData);
    } catch (error) {
      console.error('Error loading content:', error);
      setContent([]);
    }
  };

  const loadTransactions = async () => {
    try {
      console.log('Loading transactions...');
      
      // Check if transactions table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('transactions')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn('transactions table not accessible:', tableError);
        setTransactions([]);
        return;
      }

      // Load transactions without complex joins
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading transactions:', error);
        setTransactions([]);
        return;
      }
      
      const transactionsData = data?.map(transaction => ({
        ...transaction,
        user_email: transaction.user_id || 'N/A'
      })) || [];
      
      console.log('Loaded transactions:', transactionsData.length);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const loadPayouts = async () => {
    try {
      console.log('Loading payouts...');
      
      // Check if payouts table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('payouts')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn('payouts table not accessible:', tableError);
        setPayouts([]);
        return;
      }

      // Load payouts without complex joins
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading payouts:', error);
        setPayouts([]);
        return;
      }
      
      const payoutsData = data?.map(payout => ({
        ...payout,
        user_email: payout.user_id || 'N/A'
      })) || [];
      
      console.log('Loaded payouts:', payoutsData.length);
      setPayouts(payoutsData);
    } catch (error) {
      console.error('Error loading payouts:', error);
      setPayouts([]);
    }
  };

  const loadRefunds = async () => {
    try {
      console.log('Loading refunds...');
      
      // Check if refunds table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('refunds')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn('refunds table not accessible:', tableError);
        setRefunds([]);
        return;
      }

      // Load refunds without complex joins
      const { data, error } = await supabase
        .from('refunds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading refunds:', error);
        setRefunds([]);
        return;
      }
      
      const refundsData = data?.map(refund => ({
        id: refund.id,
        transaction_id: refund.transaction_id,
        amount: refund.amount,
        currency: refund.currency,
        reason: refund.reason,
        status: refund.status || 'pending',
        created_at: refund.created_at,
        processed_at: refund.processed_at,
        admin_notes: refund.admin_notes,
        original_transaction: null // Simplified for now
      })) || [];

      console.log('Loaded refunds:', refundsData.length);
      setRefunds(refundsData);
    } catch (error) {
      console.error('Error loading refunds:', error);
      setRefunds([]);
    }
  };



  const loadFees = async () => {
    try {
      console.log('Loading fees...');
      
      // Check if fees table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('fees')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn('fees table not accessible:', tableError);
        setFees([]);
        return;
      }

      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading fees:', error);
        setFees([]);
        return;
      }
      
      console.log('Loaded fees:', data?.length || 0);
      setFees(data || []);
    } catch (error) {
      console.error('Error loading fees:', error);
      setFees([]);
    }
  };

  const loadInstitutionSubmissions = async () => {
    try {
      console.log('Loading institution submissions from database...');
      
      // Try to load from multiple possible tables
      let data = null;
      let error = null;
      
      // First try institution_profiles table
      const { data: instProfiles, error: instError } = await supabase
        .from('institution_profiles')
        .select('*');
      
      if (!instError && instProfiles && instProfiles.length > 0) {
        data = instProfiles;
        console.log('Found data in institution_profiles table:', instProfiles);
        
        // Load ALL related data for each institution
        for (const profile of instProfiles) {
          console.log('Loading complete data for institution:', profile.institution_name);
          
          // Load documents
          const { data: documents, error: docError } = await supabase
            .from('institution_documents')
            .select('*')
            .eq('institution_id', profile.id);
          
          if (!docError && documents) {
            profile.documents = documents;
            console.log('Loaded documents:', documents.length);
          }
          
          // Load photos
          const { data: photos, error: photoError } = await supabase
            .from('institution_photos')
            .select('*')
            .eq('institution_id', profile.id);
          
          if (!photoError && photos) {
            profile.photos = photos;
            console.log('Loaded photos:', photos.length);
          }
          
          // Load additional institution data from other tables
          // Load institution details (facilities, etc.)
          const { data: details, error: detailsError } = await supabase
            .from('institution_details')
            .select('*')
            .eq('institution_id', profile.id);
          
          if (!detailsError && details && details.length > 0) {
            profile.institutionDetails = details[0];
            console.log('Loaded institution details');
          }
          
          // Load academic programs
          const { data: programs, error: programsError } = await supabase
            .from('institution_academic_programs')
            .select('*')
            .eq('institution_id', profile.id);
          
          if (!programsError && programs) {
            profile.academicPrograms = programs;
            console.log('Loaded academic programs:', programs.length);
          }
          
          // Load faculty information
          const { data: faculty, error: facultyError } = await supabase
            .from('institution_faculty_staff')
            .select('*')
            .eq('institution_id', profile.id);
          
          if (!facultyError && faculty) {
            profile.faculty = faculty;
            console.log('Loaded faculty:', faculty.length);
          }
          
          // Load results and achievements
          const { data: results, error: resultsError } = await supabase
            .from('institution_results_achievements')
            .select('*')
            .eq('institution_id', profile.id);
          
          if (!resultsError && results) {
            profile.results = results;
            console.log('Loaded results and achievements');
          }
          
          // Load fee policies
          const { data: fees, error: feesError } = await supabase
            .from('institution_fee_policies')
            .select('*')
            .eq('institution_id', profile.id);
          
          if (!feesError && fees && fees.length > 0) {
            profile.feePolicies = fees[0];
            console.log('Loaded fee policies');
          }
          
          // Load contact verification
          const { data: contact, error: contactError } = await supabase
            .from('institution_contact_verification')
            .select('*')
            .eq('institution_id', profile.id);
          
          if (!contactError && contact && contact.length > 0) {
            profile.contactVerification = contact[0];
            console.log('Loaded contact verification');
          }
        }
      } else {
        console.log('No data in institution_profiles, trying profiles table...');
        
        // Try profiles table with role = 'institution'
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'institution');
        
        if (!profilesError && profiles && profiles.length > 0) {
          data = profiles;
          console.log('Found data in profiles table:', profiles);
        } else {
          console.log('No data in profiles table either');
          error = profilesError || instError;
        }
      }

      if (error) {
        console.warn('Error loading institution profiles:', error);
        setInstitutionSubmissions([]);
        return;
      }
      
      console.log('Raw institution profiles from database:', data);
      
      // Transform the database data to match our interface
      const submissions: InstitutionSubmission[] = (data || []).map(profile => {
        // Handle both institution_profiles and profiles table structures
        const isInstitutionProfile = 'institution_name' in profile;
        
        if (isInstitutionProfile) {
          // institution_profiles table structure
          return {
            id: profile.id,
            user_id: profile.user_id || 'unknown',
            email: profile.official_email || 'No email',
            institutionName: profile.institution_name || 'Unknown Institution',
            institutionType: profile.institution_type || 'Unknown',
            registrationNumber: profile.registration_number || 'Unknown',
            submittedAt: profile.created_at || new Date().toISOString(),
            status: profile.verified ? 'approved' : 'pending',
            documents: {
              businessRegistrationCertificate: profile.documents?.find(d => d.document_type === 'business_registration')?.file_name || 'Not uploaded',
              educationBoardAffiliationCertificate: profile.documents?.find(d => d.document_type === 'education_board_affiliation')?.file_name || 'Not uploaded',
              fireSafetyCertificate: profile.documents?.find(d => d.document_type === 'fire_safety')?.file_name || 'Not uploaded',
              buildingPlanApproval: profile.documents?.find(d => d.document_type === 'building_plan')?.file_name || 'Not uploaded',
              panCard: profile.pan_number || 'Not provided',
              gstCertificate: profile.gst_number || 'Not provided',
              bankAccountDetails: profile.documents?.find(d => d.document_type === 'bank_account')?.file_name || 'Not uploaded',
              institutionPhotographs: profile.photos?.map(p => p.file_name).join(', ') || 'No photos uploaded'
            },
            basicInformation: {
              institutionName: profile.institution_name || 'Unknown',
              institutionType: profile.institution_type || 'Unknown',
              registrationNumber: profile.registration_number || 'Unknown',
              email: profile.official_email || 'Unknown',
              phone: profile.primary_contact || 'Unknown',
              address: profile.complete_address || 'Unknown',
              city: profile.city || 'Unknown',
              state: profile.state || 'Unknown',
              pincode: profile.pin_code || 'Unknown',
              ownerName: profile.owner_name || 'Unknown',
              ownerPhone: profile.owner_contact || 'Unknown'
            },
            adminNotes: null,
            reviewedBy: null,
            reviewedAt: null
          };
        } else {
          // profiles table structure
          return {
            id: profile.id,
            user_id: profile.user_id || 'unknown',
            email: profile.email || 'No email',
            institutionName: profile.full_name || 'Unknown Institution',
            institutionType: 'Institution', // Default type
            registrationNumber: 'Not provided',
            submittedAt: profile.created_at || new Date().toISOString(),
            status: 'pending', // profiles table doesn't have verified field
            documents: {
              businessRegistrationCertificate: 'Check documents table',
              educationBoardAffiliationCertificate: 'Check documents table',
              fireSafetyCertificate: 'Check documents table',
              buildingPlanApproval: 'Check documents table',
              panCard: 'Not provided',
              gstCertificate: 'Not provided',
              bankAccountDetails: 'Check documents table',
              institutionPhotographs: 'Check photos table'
            },
            basicInformation: {
              institutionName: profile.full_name || 'Unknown',
              institutionType: 'Institution',
              registrationNumber: 'Not provided',
              email: profile.email || 'Unknown',
              phone: profile.phone ? profile.phone.toString() : 'Not provided',
              address: 'Not provided',
              city: profile.city || 'Not provided',
              state: 'Not provided',
              pincode: 'Not provided',
              ownerName: 'Not provided',
              ownerPhone: 'Not provided'
            },
            adminNotes: null,
            reviewedBy: null,
            reviewedAt: null
          };
        }
      });
      
      console.log('Transformed institution submissions:', submissions);
      setInstitutionSubmissions(submissions);
      
    } catch (error) {
      console.error('Error loading institution submissions:', error);
      setInstitutionSubmissions([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Since we don't have a dedicated analytics table, we'll calculate metrics from existing data
      const analyticsData = calculateAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error calculating analytics:', error);
      setAnalytics(null);
    }
  };

  const calculateAnalytics = (): AnalyticsData => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User Growth Metrics - ALL users, but distinguish verification requirements
    const totalUsers = users.length; // All users
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalVerificationRequired = users.filter(u => u.role === 'tutor' || u.role === 'institution').length;
    const verifiedUsers = users.filter(u => (u.role === 'tutor' || u.role === 'institution') && u.verification_status === 'approved').length;
    
    const newUsersThisMonth = users.filter(user => 
      new Date(user.created_at) >= oneMonthAgo
    ).length;
    const newUsersThisWeek = users.filter(user => 
      new Date(user.created_at) >= oneWeekAgo
    ).length;
    const activeUsers = totalStudents + verifiedUsers; // Students (auto-approved) + verified tutors/institutions
    const userGrowthRate = totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100) : 0;

    // Revenue Metrics
    const totalRevenue = transactions
      .filter(t => t.type === 'payment' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyRevenue = transactions
      .filter(t => t.type === 'payment' && t.status === 'completed' && new Date(t.created_at) >= oneMonthAgo)
      .reduce((sum, t) => sum + t.amount, 0);
    const weeklyRevenue = transactions
      .filter(t => t.type === 'payment' && t.status === 'completed' && new Date(t.created_at) >= oneWeekAgo)
      .reduce((sum, t) => sum + t.amount, 0);
    const completedPayments = transactions.filter(t => t.type === 'payment' && t.status === 'completed');
    const revenueGrowthRate = totalRevenue > 0 ? ((monthlyRevenue / totalRevenue) * 100) : 0;
    const averageTransactionValue = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0;

    // Engagement Metrics - ALL users
    const totalSessions = reviews.length; // Assuming each review represents a session
    const activeTutors = profiles.filter(p => p.verified).length;
    const activeStudents = users.filter(u => u.role === 'student').length; // Students are always active (auto-approved)
    const contentUploads = content.length;
    const reviewSubmissions = reviews.length;

    // Platform Performance Metrics
    const totalProfiles = profiles.length;
    const verificationRate = (users.filter(u => u.role !== 'student').length) > 0 ? 
      ((users.filter(u => u.role !== 'student' && u.verification_status === 'approved').length) / (users.filter(u => u.role !== 'student').length)) * 100 : 0;
    const contentApprovalRate = content.length > 0 ? 
      (content.filter(c => c.status === 'approved').length / content.length) * 100 : 0;
    const averageRating = reviews.length > 0 ? 
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    const responseTime = 0; // Will be calculated from actual response time data when available

    // Time Series Data (last 7 days)
    const timeSeriesData = generateTimeSeriesData();

    return {
      userGrowth: {
        totalUsers,
        totalStudents,
        totalVerificationRequired,
        verifiedUsers,
        newUsersThisMonth,
        newUsersThisWeek,
        activeUsers,
        userGrowthRate
      },
      revenueMetrics: {
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        revenueGrowthRate,
        averageTransactionValue
      },
      engagementMetrics: {
        totalSessions,
        activeTutors,
        activeStudents,
        contentUploads,
        reviewSubmissions
      },
      platformPerformance: {
        totalProfiles,
        verificationRate,
        contentApprovalRate,
        averageRating,
        responseTime
      },
      timeSeriesData
    };
  };

  const generateTimeSeriesData = () => {
    const dates = [];
    const userCounts = [];
    const revenueData = [];
    const sessionCounts = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Calculate real data for each day from existing data
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Count users created on this day
      const dayUsers = users.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= dayStart && userDate <= dayEnd;
      }).length;
      
      // Calculate revenue for this day
      const dayRevenue = transactions
        .filter(t => t.type === 'payment' && t.status === 'completed')
        .filter(t => {
          const transactionDate = new Date(t.created_at);
          return transactionDate >= dayStart && transactionDate <= dayEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Count sessions (reviews) for this day
      const daySessions = reviews.filter(review => {
        const reviewDate = new Date(review.created_at);
        return reviewDate >= dayStart && reviewDate <= dayEnd;
      }).length;
      
      userCounts.push(dayUsers);
      revenueData.push(dayRevenue);
      sessionCounts.push(daySessions);
    }

    return { dates, userCounts, revenueData, sessionCounts };
  };

  const handleVerification = async (userId: string, status: string) => {
    try {
      // Try to update public_users table first
      let { error } = await supabase
        .from('public_users')
        .update({ verification_status: status })
        .eq('id', userId);

      if (error) {
        // Fallback to users table if it exists
        const { error: fallbackError } = await supabase
        .from('users')
        .update({ verification_status: status })
        .eq('id', userId);

        if (fallbackError) throw fallbackError;
      }

      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, verification_status: status }
            : user
        )
      );

      toast({
        title: "Success",
        description: `User ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleProfileView = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const handleProfileModeration = async (profileId: string, action: 'approve' | 'reject') => {
    try {
      // Update the verified field based on the action
      const verified = action === 'approve';
      
      const { error } = await supabase
        .from('tutor_profiles')
        .update({ verified: verified })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev => 
        prev.map(profile => 
          profile.id === profileId 
            ? { ...profile, verified: verified }
            : profile
        )
      );

      toast({
        title: "Success",
        description: `Profile ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile verification",
        variant: "destructive",
      });
    }
  };

  const handleUserVerification = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      console.log(`Updating user ${userId} to status: ${newStatus}`);
      
      // Update users table
      const { error: usersError } = await supabase
        .from('users')
        .update({ verification_status: newStatus })
        .eq('id', userId);

      if (usersError) {
        console.warn('Error updating users table:', usersError);
      }

      // Update public_users table as well
      const { error: publicUsersError } = await supabase
        .from('public_users')
        .update({ verification_status: newStatus })
        .eq('id', userId);

      if (publicUsersError) {
        console.warn('Error updating public_users table:', publicUsersError);
      }

             // Update tutor_profiles.verified if this is a tutor
       const user = users.find(u => u.id === userId);
       if (user && user.role === 'tutor') {
         const { error: profileError } = await supabase
           .from('tutor_profiles')
           .update({ verified: action === 'approve' })
           .eq('user_id', userId);

         if (profileError) {
           console.warn('Failed to update tutor profile:', profileError);
         } else {
           console.log('Updated tutor profile verified status');
         }
       }

       // Update institution_profiles.verified if this is an institution
       if (user && user.role === 'institution') {
         const { error: institutionError } = await supabase
           .from('institution_profiles')
           .update({ verified: action === 'approve' })
           .eq('user_id', userId);

         if (institutionError) {
           console.warn('Failed to update institution profile:', institutionError);
         } else {
           console.log('Updated institution profile verified status');
         }
       }

      // If both main tables fail, throw error
      if (usersError && publicUsersError) {
        throw new Error('Failed to update both user tables');
      }

      toast({
        title: "Success",
        description: `User ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });

      // Real-time updates will handle the UI refresh automatically
      // But we can also manually reload to ensure consistency
      loadUsers();
      loadProfiles();
    } catch (error) {
      console.error('Error updating user verification status:', error);
      toast({
        title: "Error",
        description: "Failed to update user verification status.",
        variant: "destructive",
      });
    }
  };

  const handleReviewModeration = async (reviewId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: status })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, status: status }
            : review
        )
      );

      toast({
        title: "Success",
        description: `Review ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
    }
  };

  const handleContentModeration = async (contentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tutor_content')
        .update({ status: status })
        .eq('id', contentId);

      if (error) throw error;

      setContent(prev => 
        prev.map(item => 
          item.id === contentId 
            ? { ...item, status: status }
            : item
        )
      );

      toast({
        title: "Success",
        description: `Content ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content status",
        variant: "destructive",
      });
    }
  };

  const handleInstitutionView = (submission: InstitutionSubmission) => {
    setSelectedInstitution(submission);
    setShowInstitutionModal(true);
  };

  const handleInstitutionApprove = async (submissionId: string) => {
    try {
      const submission = institutionSubmissions.find(sub => sub.id === submissionId);
      if (!submission) throw new Error('Submission not found');

      // Update the submission status
      const { error } = await supabase
        .from('institution_submissions')
        .update({ 
          status: 'approved',
          reviewedBy: 'admin',
          reviewedAt: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Update local state
      setInstitutionSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, status: 'approved', reviewedBy: 'admin', reviewedAt: new Date().toISOString() }
            : sub
        )
      );

      // Update database record
      const { error: updateError } = await supabase
        .from('institution_profiles')
        .update({ 
          verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (updateError) {
        console.warn('Error updating database:', updateError);
      }

      // Also update the user's verification status
      await handleUserVerification(submission.user_id, 'approve');

      toast({
        title: "Success",
        description: "Institution approved successfully",
      });
    } catch (error) {
      console.error('Error approving institution:', error);
      toast({
        title: "Error",
        description: "Failed to approve institution",
        variant: "destructive",
      });
    }
  };

  const handleInstitutionReject = async (submissionId: string) => {
    try {
      const submission = institutionSubmissions.find(sub => sub.id === submissionId);
      if (!submission) throw new Error('Submission not found');

      // Update the submission status
      const { error } = await supabase
        .from('institution_submissions')
        .update({ 
          status: 'rejected',
          reviewedBy: 'admin',
          reviewedAt: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Update local state
      setInstitutionSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, status: 'rejected', reviewedBy: 'admin', reviewedAt: new Date().toISOString() }
            : sub
        )
      );

      // Update database record
      const { error: updateError } = await supabase
        .from('institution_profiles')
        .update({ 
          verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (updateError) {
        console.warn('Error updating database:', updateError);
      }

      // Also update the user's verification status
      await handleUserVerification(submission.user_id, 'reject');

      toast({
        title: "Success",
        description: "Institution rejected successfully",
      });
    } catch (error) {
      console.error('Error rejecting institution:', error);
      toast({
        title: "Error",
        description: "Failed to reject institution",
        variant: "destructive",
      });
    }
  };

  // Payment Management Functions
  const handlePayoutApproval = async (payoutId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('payouts')
        .update({ 
          status: status,
          processed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', payoutId);

      if (error) throw error;

      setPayouts(prev => 
        prev.map(payout => 
          payout.id === payoutId 
            ? { 
                ...payout, 
                status: status,
                processed_at: status === 'completed' ? new Date().toISOString() : payout.processed_at
              }
            : payout
        )
      );

      toast({
        title: "Success",
        description: `Payout ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating payout:', error);
      toast({
        title: "Error",
        description: "Failed to update payout status",
        variant: "destructive",
      });
    }
  };

  const handleRefundApproval = async (refundId: string, status: string, adminNotes?: string) => {
    try {
      const { error } = await supabase
        .from('refunds')
        .update({ 
          status: status,
          admin_notes: adminNotes,
          processed_at: status === 'processed' ? new Date().toISOString() : null
        })
        .eq('id', refundId);

      if (error) throw error;

      setRefunds(prev => 
        prev.map(refund => 
          refund.id === refundId 
            ? { 
                ...refund, 
                status: status,
                admin_notes: adminNotes,
                processed_at: status === 'processed' ? new Date().toISOString() : refund.processed_at
              }
            : refund
        )
      );

      toast({
        title: "Success",
        description: `Refund ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating refund:', error);
      toast({
        title: "Error",
        description: "Failed to update refund status",
        variant: "destructive",
      });
    }
  };

  const handleFeeUpdate = async (feeId: string, updates: Partial<Fee>) => {
    try {
      const { error } = await supabase
        .from('fees')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', feeId);

      if (error) throw error;

      setFees(prev => 
        prev.map(fee => 
          fee.id === feeId 
            ? { ...fee, ...updates, updated_at: new Date().toISOString() }
            : fee
        )
      );

      toast({
        title: "Success",
        description: "Fee updated successfully",
      });
    } catch (error) {
      console.error('Error updating fee:', error);
      toast({
        title: "Error",
        description: "Failed to update fee",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const getStats = () => {
    // Count all users for total
    const total = users.length;
    // Only count verification-required users (tutors & institutions) for verification stats
    const verificationRequired = users.filter(u => u.role === 'tutor' || u.role === 'institution');
    const pending = verificationRequired.filter(u => u.verification_status === 'pending').length;
    const approved = verificationRequired.filter(u => u.verification_status === 'approved').length;
    const rejected = verificationRequired.filter(u => u.verification_status === 'rejected').length;
    return { total, pending, approved, rejected };
  };

  // Force stats refresh when users change
  useEffect(() => {
    // This will trigger a re-render when users array changes
    console.log('Users updated, stats refreshed:', getStats());
  }, [users]);

  const getContentStats = () => {
    const totalProfiles = profiles.length;
    const pendingProfiles = profiles.filter(p => !p.verified).length;
    const totalReviews = reviews.length;
    const pendingReviews = reviews.filter(r => r.status === 'pending').length;
    const totalContent = content.length;
    const pendingContent = content.filter(c => c.status === 'pending').length;
    
    return { totalProfiles, pendingProfiles, totalReviews, pendingReviews, totalContent, pendingContent };
  };

  const getPaymentStats = () => {
    const totalTransactions = transactions.length;
    const totalRevenue = transactions
      .filter(t => t.type === 'payment' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingPayouts = payouts.filter(p => p.status === 'pending').length;
    const pendingRefunds = refunds.filter(r => r.status === 'pending').length;
    const totalFees = fees.filter(f => f.is_active).length;
    
    return { totalTransactions, totalRevenue, pendingPayouts, pendingRefunds, totalFees };
  };

  const stats = getStats();
  const contentStats = getContentStats();
  const paymentStats = getPaymentStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Platform Management & Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">Admin</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    loadAllData();
                    toast({
                      title: "Data Refreshed",
                      description: "All dashboard data has been updated",
                    });
                  }}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Summary */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Admin Dashboard</h2>
                    <p className="text-blue-700">
                      Manage your platform with {stats.total} total users, {contentStats.totalProfiles} profiles, and ₹{paymentStats.totalRevenue.toFixed(2)} in revenue
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 font-medium">Platform Status</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {stats.pending > 0 ? `${stats.pending} items need attention` : 'All systems operational'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database Setup Notice */}
        {users.length === 0 && profiles.length === 0 && reviews.length === 0 && 
         content.length === 0 && transactions.length === 0 && payouts.length === 0 && 
         refunds.length === 0 && fees.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Database Setup Required
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    The admin dashboard is working, but some database tables don't exist yet. 
                    This is why you're seeing empty data.
                  </p>
                  <p className="mt-2">
                    <strong>To fix this:</strong>
                  </p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Go to your Supabase dashboard</li>
                    <li>Open the SQL Editor</li>
                    <li>Run the migration from <code className="bg-blue-100 px-1 rounded">supabase/migrations/create_essential_admin_tables.sql</code></li>
                    <li>Refresh this page</li>
                  </ol>
                  <p className="mt-2">
                    <strong>Note:</strong> The database setup guide has been removed from this dashboard. Please refer to the migration files in the <code className="bg-blue-100 px-1 rounded">supabase/migrations/</code> folder for detailed setup instructions.
                  </p>
                  <p className="mt-2">
                    <strong>Admin Dashboard Scope:</strong> This dashboard manages all users. Students are auto-approved and don't need verification, while tutors and institutions require admin approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("verification")}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Users className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Pending Verification (Tutors & Institutions)</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
                {stats.pending > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("verification")}
                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Verified Users (Tutors & Institutions)</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("verification")}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserX className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Rejected Users (Tutors & Institutions)</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                  </div>
                </div>
                {stats.rejected > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("verification")}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Moderation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Profiles</p>
                    <p className="text-2xl font-bold text-gray-900">{contentStats.totalProfiles}</p>
                    <p className="text-xs text-yellow-600">{contentStats.pendingProfiles} pending</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab("profiles")}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {contentStats.pendingProfiles > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab("profiles")}
                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 text-xs"
                    >
                      {contentStats.pendingProfiles} Pending
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Star className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{contentStats.totalReviews}</p>
                    <p className="text-xs text-yellow-600">{contentStats.pendingReviews} pending</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab("reviews")}
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {contentStats.pendingReviews > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab("reviews")}
                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 text-xs"
                    >
                      {contentStats.pendingReviews} Pending
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Content</p>
                    <p className="text-2xl font-bold text-gray-900">{contentStats.totalContent}</p>
                    <p className="text-xs text-yellow-600">{contentStats.pendingContent} pending</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab("content")}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Image className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {contentStats.pendingContent > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab("content")}
                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 text-xs"
                    >
                      {contentStats.pendingContent} Pending
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="h-6 w-6 text-blue-600 font-bold text-center text-sm">₹</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{paymentStats.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-blue-600">{paymentStats.totalTransactions} transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="h-6 w-6 text-green-600 font-bold text-center text-sm">↑</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">{paymentStats.pendingPayouts}</p>
                  <p className="text-xs text-green-600">Awaiting approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <div className="h-6 w-6 text-red-600 font-bold text-center text-sm">↓</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Refunds</p>
                  <p className="text-2xl font-bold text-gray-900">{paymentStats.pendingRefunds}</p>
                  <p className="text-xs text-red-600">Requires review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <div className="h-6 w-6 text-purple-600 font-bold text-center text-sm">%</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Fees</p>
                  <p className="text-2xl font-bold text-gray-900">{paymentStats.totalFees}</p>
                  <p className="text-xs text-purple-600">Platform charges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <div className="mb-8">
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Common admin tasks and shortcuts</p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("verification")}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Review Users
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("profiles")}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Moderate Profiles
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("reviews")}
                    className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Review Content
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("analytics")}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 gap-2">
            <TabsTrigger value="verification" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200">
              <Users className="h-4 w-4" />
              <span>Users</span>
              {stats.pending > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {stats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center space-x-2 data-[state=active]:bg-purple-50 data-[state=active]:border-purple-200">
              <FileText className="h-4 w-4" />
              <span>Profiles</span>
              {contentStats.pendingProfiles > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {contentStats.pendingProfiles}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-2 data-[state=active]:bg-yellow-50 data-[state=active]:border-yellow-200">
              <Star className="h-4 w-4" />
              <span>Reviews</span>
              {contentStats.pendingReviews > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {contentStats.pendingReviews}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2 data-[state=active]:bg-green-50 data-[state=active]:border-green-200">
              <Image className="h-4 w-4" />
              <span>Content</span>
              {contentStats.pendingContent > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {contentStats.pendingContent}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center space-x-2 data-[state=active]:bg-emerald-50 data-[state=active]:border-emerald-200">
              <div className="h-4 w-4 font-bold text-center text-xs">₹</div>
              <span>Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center space-x-2 data-[state=active]:bg-orange-50 data-[state=active]:border-orange-200">
              <div className="h-4 w-4 font-bold text-center text-xs">↑</div>
              <span>Payouts</span>
              {paymentStats.pendingPayouts > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {paymentStats.pendingPayouts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="refunds" className="flex items-center space-x-2 data-[state=active]:bg-red-50 data-[state=active]:border-red-200">
              <div className="h-4 w-4 font-bold text-center text-xs">↓</div>
              <span>Refunds</span>
              {paymentStats.pendingRefunds > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {contentStats.pendingRefunds}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="institutions" className="flex items-center space-x-2 data-[state=active]:bg-indigo-50 data-[state=active]:border-indigo-200">
              <Building2 className="h-4 w-4" />
              <span>Institutions</span>
              {institutionSubmissions.filter(sub => sub.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {institutionSubmissions.filter(sub => sub.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-slate-50 data-[state=active]:border-slate-200">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center space-x-2 data-[state=active]:bg-cyan-50 data-[state=active]:border-cyan-200">
              <div className="h-4 w-4 font-bold text-center text-xs">₹</div>
              <span>Pricing</span>
            </TabsTrigger>
          </TabsList>

                    {/* User Management Tab */}
          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all users. Students are auto-approved, only tutors and institutions need verification.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-gray-600">Role: {user.role}</p>
                        <p className="text-sm text-gray-500 mt-1">Status: {user.verification_status}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge 
                            variant={user.verification_status === 'approved' ? 'default' : 'secondary'}
                          >
                            {user.verification_status === 'approved' ? '✅ Approved' : '⏳ Pending'}
                          </Badge>
                          {user.role === 'tutor' && (
                            <Badge variant="secondary">Tutor Profile</Badge>
                          )}
                          {user.role === 'institution' && (
                            <Badge variant="secondary">Institution Profile</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {/* Only show verification buttons for tutors and institutions */}
                        {(user.role === 'tutor' || user.role === 'institution') ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserVerification(user.id, 'approve')}
                              disabled={user.verification_status === 'approved'}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserVerification(user.id, 'reject')}
                              disabled={user.verification_status === 'rejected'}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Badge variant="secondary" className="ml-2">
                            Auto-Approved
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Management</CardTitle>
                <CardDescription>Monitor and manage platform transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">₹{transaction.amount} {transaction.currency}</p>
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                        <p className="text-sm text-gray-500 mt-1">Type: {transaction.type}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{transaction.type}</Badge>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Badge variant="outline">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout Management</CardTitle>
                <CardDescription>Manage tutor and institution payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">₹{payout.amount} {payout.currency}</p>
                        <p className="text-sm text-gray-600">Method: {payout.method}</p>
                        <p className="text-sm text-gray-500 mt-1">Status: {payout.status}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{payout.method}</Badge>
                          <Badge 
                            variant={payout.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {payout.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Refund Management</CardTitle>
                <CardDescription>Handle refund requests and processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {refunds.map((refund) => (
                    <div key={refund.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">₹{refund.amount} {refund.currency}</p>
                        <p className="text-sm text-gray-600">Reason: {refund.reason}</p>
                        <p className="text-sm text-gray-500 mt-1">Status: {refund.status}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">Refund</Badge>
                          <Badge 
                            variant={refund.status === 'processed' ? 'default' : 'secondary'}
                          >
                            {refund.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Institutions Tab */}
          <TabsContent value="institutions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Institution Submissions</CardTitle>
                    <CardDescription>Review and manage institution registration submissions</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => loadInstitutionSubmissions()}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      onClick={() => {
                        console.log('🔍 Debug: Institution Submissions Data');
                        console.log('Total submissions:', institutionSubmissions.length);
                        institutionSubmissions.forEach((sub, index) => {
                          console.log(`Submission ${index + 1}:`, sub);
                        });
                        toast({
                          title: "Debug Info Logged",
                          description: `Check console for ${institutionSubmissions.length} institution submissions data`,
                        });
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Debug Data
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {institutionSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No institution submissions found</p>
                      

                    </div>
                  ) : (
                    institutionSubmissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{submission.basicInformation.institutionName}</p>
                          <p className="text-sm text-gray-600">{submission.email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Type: {submission.basicInformation.institutionType} | 
                            Reg: {submission.basicInformation.registrationNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">Institution</Badge>
                            <Badge 
                              variant={
                                submission.status === 'approved' ? 'default' : 
                                submission.status === 'rejected' ? 'destructive' : 
                                submission.status === 'under_review' ? 'secondary' : 'secondary'
                              }
                            >
                              {submission.status === 'approved' ? '✅ Approved' : 
                               submission.status === 'rejected' ? '❌ Rejected' : 
                               submission.status === 'under_review' ? '⏳ Under Review' : '⏳ Pending'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInstitutionView(submission)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          
                          {submission.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleInstitutionApprove(submission.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleInstitutionReject(submission.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Management</CardTitle>
                <CardDescription>Configure platform fees and charges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fees.map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{fee.name}</p>
                        <p className="text-sm text-gray-600">{fee.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {fee.type === 'percentage' ? `${fee.value}%` : `₹${fee.value}`} {fee.currency}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{fee.type}</Badge>
                          <Badge 
                            variant={fee.is_active ? 'default' : 'secondary'}
                          >
                            {fee.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profiles Tab */}
          <TabsContent value="profiles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{profile.full_name}</p>
                        <p className="text-sm text-gray-600">{profile.user_email}</p>
                        <p className="text-sm text-gray-500 mt-1">{profile.bio.substring(0, 100)}...</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">Profile</Badge>
                          <Badge 
                            variant={profile.verified ? 'default' : 'secondary'}
                          >
                            {profile.verified ? '✅ Verified' : '⏳ Pending Verification'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProfileView(profile)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        
                        {!profile.verified && (
                            <Button
                              size="sm"
                            onClick={() => handleProfileModeration(profile.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                        )}
                        
                        {profile.verified && (
                            <Button
                              variant="destructive"
                              size="sm"
                            onClick={() => handleProfileModeration(profile.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">Reviewer: {review.reviewer_email}</span>
                          <span className="text-gray-500">→</span>
                          <span className="font-medium">Tutor: {review.tutor_email}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline">{review.rating}/5</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">Review</Badge>
                          <Badge 
                            variant={review.status === 'approved' ? 'default' : 
                                    review.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {review.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {review.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleReviewModeration(review.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReviewModeration(review.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {review.status === 'rejected' && (
                          <Button
                            size="sm"
                            onClick={() => handleReviewModeration(review.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Re-approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.user_email}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.description.substring(0, 100)}...</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{item.file_type}</Badge>
                          <Badge 
                            variant={item.status === 'approved' ? 'default' : 
                                    item.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.file_url, '_blank')}
                          disabled={!item.file_url}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        
                        {item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleContentModeration(item.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleContentModeration(item.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {item.status === 'rejected' && (
                          <Button
                            size="sm"
                            onClick={() => handleContentModeration(item.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Re-approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.user_email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{transaction.type}</Badge>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 
                                    transaction.status === 'failed' ? 'destructive' : 'secondary'}
                          >
                            {transaction.status}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {transaction.currency} {transaction.amount.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{payout.user_email}</p>
                        <p className="text-sm text-gray-600">{payout.account_details}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{payout.method}</Badge>
                          <Badge 
                            variant={payout.status === 'completed' ? 'default' : 
                                    payout.status === 'failed' ? 'destructive' : 'secondary'}
                          >
                            {payout.status}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {payout.currency} {payout.amount.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested: {new Date(payout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {payout.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handlePayoutApproval(payout.id, 'processing')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Process
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handlePayoutApproval(payout.id, 'failed')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {payout.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => handlePayoutApproval(payout.id, 'completed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Refund Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {refunds.map((refund) => (
                    <div key={refund.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">Refund Request</p>
                        <p className="text-sm text-gray-600">Reason: {refund.reason}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">Refund</Badge>
                          <Badge 
                            variant={refund.status === 'processed' ? 'default' : 
                                    refund.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {refund.status}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {refund.currency} {refund.amount.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested: {new Date(refund.created_at).toLocaleDateString()}
                        </p>
                        {refund.admin_notes && (
                          <p className="text-xs text-gray-600 mt-1">
                            Admin Notes: {refund.admin_notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {refund.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleRefundApproval(refund.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRefundApproval(refund.id, 'rejected', 'Refund request denied')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {refund.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleRefundApproval(refund.id, 'processed')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Process
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fees.map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{fee.name}</p>
                        <p className="text-sm text-gray-600">{fee.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{fee.type}</Badge>
                          <Badge 
                            variant={fee.is_active ? 'default' : 'secondary'}
                          >
                            {fee.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {fee.type === 'percentage' ? `${fee.value}%` : `${fee.currency === 'USD' ? '₹' : fee.currency} ${fee.value.toFixed(2)}`}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Updated: {new Date(fee.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeeUpdate(fee.id, { is_active: !fee.is_active })}
                        >
                          {fee.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Platform Analytics Dashboard</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Real-time insights into platform performance, user growth, and engagement trends
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      loadAnalytics();
                      toast({
                        title: "Analytics Updated",
                        description: "Platform metrics have been refreshed",
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh Data</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {analytics ? (
                  <>
                    {/* Key Metrics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Total Users</p>
                            <p className="text-2xl font-bold text-blue-900">{analytics.userGrowth.totalUsers}</p>
                          </div>
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-blue-600">
                            {analytics.userGrowth.totalStudents} students + {analytics.userGrowth.verifiedUsers} verified tutors & institutions
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-900">₹{analytics.revenueMetrics.totalRevenue.toFixed(2)}</p>
                          </div>
                          <div className="h-8 w-8 font-bold text-center text-green-600 text-xl">₹</div>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-green-600">
                            +{analytics.revenueMetrics.revenueGrowthRate.toFixed(1)}% growth
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-600 font-medium">Active Sessions</p>
                            <p className="text-2xl font-bold text-purple-900">{analytics.engagementMetrics.totalSessions}</p>
                          </div>
                          <Activity className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-purple-600">
                            {analytics.engagementMetrics.activeTutors} active tutors
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-orange-600 font-medium">Avg Rating</p>
                            <p className="text-2xl font-bold text-orange-900">{analytics.platformPerformance.averageRating.toFixed(1)}/5</p>
                          </div>
                          <Star className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-orange-600">
                            {analytics.platformPerformance.verificationRate.toFixed(1)}% tutors/institutions verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* User Growth Details */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span>User Growth Analytics</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Students</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.totalStudents}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Tutors/Institutions</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.totalVerificationRequired}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Verified Users</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.verifiedUsers}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">New Users This Month</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.newUsersThisMonth}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">New Users This Week</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.newUsersThisWeek}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Growth Rate</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.userGrowthRate.toFixed(1)}%</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Revenue Details */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <div className="h-5 w-5 font-bold text-center text-green-600 text-lg">₹</div>
                            <span>Revenue Analytics</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Monthly Revenue</span>
                            <span className="font-semibold text-green-600">₹{analytics.revenueMetrics.monthlyRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Weekly Revenue</span>
                            <span className="font-semibold text-green-600">₹{analytics.revenueMetrics.weeklyRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Revenue Growth Rate</span>
                            <span className="font-semibold text-green-600">{analytics.revenueMetrics.revenueGrowthRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Avg Transaction Value</span>
                            <span className="font-semibold text-green-600">₹{analytics.revenueMetrics.averageTransactionValue.toFixed(2)}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Engagement Details */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                            <span>Engagement Metrics</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Sessions</span>
                            <span className="font-semibold text-purple-600">{analytics.engagementMetrics.totalSessions}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Active Tutors</span>
                            <span className="font-semibold text-purple-600">{analytics.engagementMetrics.activeTutors}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Active Students</span>
                            <span className="font-semibold text-purple-600">{analytics.engagementMetrics.activeStudents}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Content Uploads</span>
                            <span className="font-semibold text-purple-600">{analytics.engagementMetrics.contentUploads}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Platform Performance */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            <span>Platform Performance</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Profiles</span>
                            <span className="font-semibold text-orange-600">{analytics.platformPerformance.totalProfiles}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Tutors/Institutions Verified</span>
                            <span className="font-semibold text-orange-600">{analytics.platformPerformance.verificationRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Content Approval Rate</span>
                            <span className="font-semibold text-orange-600">{analytics.platformPerformance.contentApprovalRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Response Time</span>
                            <span className="font-semibold text-orange-600">{analytics.platformPerformance.responseTime || 0}h</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-xl font-medium">No analytics data available</p>
                    <p className="text-sm">Analytics will appear here once users, transactions, and content are added to the platform</p>
                  </div>
                )}

                {/* Time Series Data Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-gray-600" />
                      <span>Daily Trends (Last 7 Days)</span>
                    </CardTitle>
                    <CardDescription>
                      Track daily performance metrics for better trend analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics?.timeSeriesData && analytics.timeSeriesData.dates.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Users</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue (₹)</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {analytics.timeSeriesData.dates.map((date, index) => (
                              <tr key={date} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.timeSeriesData.userCounts[index] || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{analytics.timeSeriesData.revenueData[index] || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.timeSeriesData.sessionCounts[index] || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No time series data available</p>
                        <p className="text-sm">Data will appear here as users, transactions, and sessions are created</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pricing" className="space-y-6">
            <PricingManagement />
          </TabsContent>
        </Tabs>
        
        {/* Profile View Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Profile Details</DialogTitle>
            </DialogHeader>
            {selectedProfile && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-4">
                  {selectedProfile.avatar_url ? (
                    <img 
                      src={selectedProfile.avatar_url} 
                      alt={selectedProfile.full_name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCheck className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{selectedProfile.full_name}</h3>
                    <p className="text-gray-600">{selectedProfile.user_email}</p>
                    <Badge 
                      variant={selectedProfile.verified ? 'default' : 'secondary'}
                      className="mt-2"
                    >
                      {selectedProfile.verified ? '✅ Verified' : '⏳ Pending Verification'}
                    </Badge>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedProfile.bio || "No bio provided"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Profile Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Profile ID:</span>
                        <p className="font-mono text-gray-900">{selectedProfile.id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">User ID:</span>
                        <p className="font-mono text-gray-900">{selectedProfile.user_id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <p className="text-gray-900">
                          {new Date(selectedProfile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Verification Status:</span>
                        <Badge 
                          variant={selectedProfile.verified ? 'default' : 'secondary'}
                        >
                          {selectedProfile.verified ? '✅ Verified' : '⏳ Pending Verification'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Preview */}
                  {selectedProfile.avatar_url && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Profile Photo</h4>
                      <div className="flex items-center space-x-4">
                        <img 
                          src={selectedProfile.avatar_url} 
                          alt={selectedProfile.full_name}
                          className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedProfile.avatar_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Full Size
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowProfileModal(false)}
                  >
                    Close
                  </Button>
                  {!selectedProfile.verified && (
                    <Button
                      onClick={() => {
                        handleProfileModeration(selectedProfile.id, 'approve');
                        setShowProfileModal(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {selectedProfile.verified && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleProfileModeration(selectedProfile.id, 'reject');
                        setShowProfileModal(false);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Institution View Modal */}
        <Dialog open={showInstitutionModal} onOpenChange={setShowInstitutionModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Institution Submission Details</DialogTitle>
            </DialogHeader>
            {selectedInstitution && (
              <div className="space-y-6">
                {/* Institution Header */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedInstitution.basicInformation.institutionName}</h3>
                    <p className="text-gray-600">{selectedInstitution.email}</p>
                    <Badge 
                      variant={
                        selectedInstitution.status === 'approved' ? 'default' : 
                        selectedInstitution.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                      className="mt-2"
                    >
                      {selectedInstitution.status === 'approved' ? '✅ Approved' : 
                       selectedInstitution.status === 'rejected' ? '❌ Rejected' : 
                       selectedInstitution.status === 'under_review' ? '⏳ Under Review' : '⏳ Pending'}
                    </Badge>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Institution Type:</span>
                        <p className="font-medium text-gray-900">{selectedInstitution.basicInformation.institutionType}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Registration Number:</span>
                        <p className="font-medium text-gray-900">{selectedInstitution.basicInformation.registrationNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium text-gray-900">{selectedInstitution.basicInformation.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Owner Name:</span>
                        <p className="font-medium text-gray-900">{selectedInstitution.basicInformation.ownerName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Owner Phone:</span>
                        <p className="font-medium text-gray-900">{selectedInstitution.basicInformation.ownerPhone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Submitted:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedInstitution.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p className="text-gray-700">
                        {selectedInstitution.basicInformation.address}, {selectedInstitution.basicInformation.city}, 
                        {selectedInstitution.basicInformation.state} - {selectedInstitution.basicInformation.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Submitted Documents</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(selectedInstitution.documents).map(([key, value]) => {
                        if (!value || value === 'Not uploaded' || value === 'Not provided') return null;
                        
                        const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        const isFile = typeof value === 'string' && value.includes('.');
                        
                        return (
                          <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{displayName}:</span>
                              <span className="font-medium text-gray-900 text-xs truncate max-w-32">
                                {isFile ? value : value}
                              </span>
                            </div>
                            {isFile && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement document download/view
                                  console.log('View document:', value);
                                }}
                                className="ml-2"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Institution Details & Facilities */}
                  {selectedInstitution.institutionDetails && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Institution Details & Facilities</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Establishment Year:</span>
                          <p className="font-medium text-gray-900">{selectedInstitution.institutionDetails.establishment_year || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Classrooms:</span>
                          <p className="font-medium text-gray-900">{selectedInstitution.institutionDetails.total_classrooms || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Classroom Capacity:</span>
                          <p className="font-medium text-gray-900">{selectedInstitution.institutionDetails.classroom_capacity || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Students:</span>
                          <p className="font-medium text-gray-900">{selectedInstitution.institutionDetails.total_current_students || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      {/* Facilities */}
                      <div className="mt-3">
                        <h5 className="font-medium text-gray-700 mb-2">Available Facilities</h5>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {selectedInstitution.institutionDetails.library_available && <Badge variant="outline">📚 Library</Badge>}
                          {selectedInstitution.institutionDetails.computer_lab && <Badge variant="outline">💻 Computer Lab</Badge>}
                          {selectedInstitution.institutionDetails.wifi_available && <Badge variant="outline">📶 WiFi</Badge>}
                          {selectedInstitution.institutionDetails.parking_available && <Badge variant="outline">🚗 Parking</Badge>}
                          {selectedInstitution.institutionDetails.cafeteria_available && <Badge variant="outline">🍽️ Cafeteria</Badge>}
                          {selectedInstitution.institutionDetails.air_conditioning && <Badge variant="outline">❄️ AC</Badge>}
                          {selectedInstitution.institutionDetails.cctv_security && <Badge variant="outline">📹 CCTV</Badge>}
                          {selectedInstitution.institutionDetails.wheelchair_accessible && <Badge variant="outline">♿ Wheelchair Access</Badge>}
                          {selectedInstitution.institutionDetails.projectors_smart_boards && <Badge variant="outline">📽️ Smart Boards</Badge>}
                          {selectedInstitution.institutionDetails.physics_lab && <Badge variant="outline">🔬 Physics Lab</Badge>}
                          {selectedInstitution.institutionDetails.chemistry_lab && <Badge variant="outline">🧪 Chemistry Lab</Badge>}
                          {selectedInstitution.institutionDetails.biology_lab && <Badge variant="outline">🧬 Biology Lab</Badge>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Academic Programs */}
                  {selectedInstitution.academicPrograms && selectedInstitution.academicPrograms.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Academic Programs</h4>
                      <div className="space-y-3">
                        {selectedInstitution.academicPrograms.map((program, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Program Name:</span>
                                <p className="font-medium text-gray-900">{program.program_name || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Level:</span>
                                <p className="font-medium text-gray-900">{program.level || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Duration:</span>
                                <p className="font-medium text-gray-900">{program.duration || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Fee:</span>
                                <p className="font-medium text-gray-900">{program.fee || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Faculty Information */}
                  {selectedInstitution.faculty && selectedInstitution.faculty.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Faculty & Staff</h4>
                      <div className="space-y-3">
                        {selectedInstitution.faculty.map((member, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Name:</span>
                                <p className="font-medium text-gray-900">{member.name || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Designation:</span>
                                <p className="font-medium text-gray-900">{member.designation || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Qualification:</span>
                                <p className="font-medium text-gray-900">{member.qualification || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Experience:</span>
                                <p className="font-medium text-gray-900">{member.experience_years || 'Not specified'} years</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Results & Achievements */}
                  {selectedInstitution.results && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Results & Achievements</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Board Exam Results:</span>
                          <p className="font-medium text-gray-900">{selectedInstitution.results.board_exam_results || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Competitive Exam Results:</span>
                          <p className="font-medium text-gray-900">{selectedInstitution.results.competitive_exam_results || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Awards Received:</span>
                          <p className="font-medium text-gray-900">{selectedInstitution.results.institution_awards || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Student Achievements:</span>
                          <p className="font-medium text-gray-900">{selectedInstitution.results.student_achievements || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fee Structure */}
                  {selectedInstitution.feePolicies && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Fee Structure & Policies</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Admission Fees:</span>
                          <p className="font-medium text-gray-900">₹{selectedInstitution.feePolicies.admission_fees || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Security Deposit:</span>
                          <p className="font-medium text-gray-900">₹{selectedInstitution.feePolicies.security_deposit || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Payment Schedule:</span>
                          <p className="font-medium text-gray-900">{selectedInstitution.feePolicies.payment_schedule || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Refund Policy:</span>
                          <p className="font-medium text-gray-900">{selectedInstitution.feePolicies.refund_policy || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Verification */}
                  {selectedInstitution.contactVerification && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Contact Verification Status</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Email Verified:</span>
                          <Badge variant={selectedInstitution.contactVerification.email_verified ? 'default' : 'secondary'}>
                            {selectedInstitution.contactVerification.email_verified ? '✅ Verified' : '❌ Not Verified'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">Mobile OTP Verified:</span>
                          <Badge variant={selectedInstitution.contactVerification.mobile_otp_verified ? 'default' : 'secondary'}>
                            {selectedInstitution.contactVerification.mobile_otp_verified ? '✅ Verified' : '❌ Not Verified'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Institution Photos */}
                  {selectedInstitution.photos && selectedInstitution.photos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Institution Photos</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedInstitution.photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={photo.file_url || photo.photo_url} 
                              alt={`Institution Photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-1 right-1"
                              onClick={() => {
                                // TODO: Implement photo view
                                console.log('View photo:', photo);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
                    <textarea
                      className="w-full p-3 border rounded-lg"
                      rows={3}
                      placeholder="Add admin notes here..."
                      value={selectedInstitution.adminNotes || ''}
                      onChange={(e) => {
                        setSelectedInstitution(prev => prev ? { ...prev, adminNotes: e.target.value } : null);
                      }}
                    />
                  </div>

                  {/* Review Information */}
                  {selectedInstitution.reviewedBy && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Review Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Reviewed By:</span>
                          <p className="font-medium text-gray-900">{selectedInstitution.reviewedBy}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Reviewed At:</span>
                          <p className="font-medium text-gray-900">
                            {selectedInstitution.reviewedAt ? new Date(selectedInstitution.reviewedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowInstitutionModal(false)}
                  >
                    Close
                  </Button>
                  {selectedInstitution.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => {
                          handleInstitutionApprove(selectedInstitution.id);
                          setShowInstitutionModal(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleInstitutionReject(selectedInstitution.id);
                          setShowInstitutionModal(false);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
      </main>
    </div>
  );
}
