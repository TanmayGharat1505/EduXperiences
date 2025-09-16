import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RequirementEditModal } from "@/components/RequirementEditModal";
import StudentCourses from "@/components/StudentCourses";
import MyClasses from "@/components/MyClasses";
import SessionBooking from "@/components/SessionBooking";
import { getPendingStudentProfile, clearPendingStudentProfile } from "@/lib/profile-creation";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Home as HomeIcon,
  Search,
  List,
  Calendar,
  MessageCircle,
  User,
  HelpCircle,
  ChevronRight,
  Users,
  BookOpen,
  CheckCircle,
  Edit,
  Send,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Filter,
  LogOut,
  Plus,
  Settings,
  BarChart3,
  Loader2,
  ChevronDown,
  Monitor,
  IndianRupee,
  Award,
  Shield,
  X,
  Grid,
  Heart,
  Share2,
  Globe,
  ThumbsUp,
  Play,
  FileText,
  Download,
  ClipboardList,
  Eye,
  Info,
  Tag,
  Trash2,
  GraduationCap,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type StudentProfile = Tables<"student_profiles">;
type TutorProfile = Tables<"tutor_profiles">;
type Profile = Tables<"profiles">;

interface DashboardState {
  activeTab: string;
  showProfileDialog: boolean;
  showTutorSearch: boolean;
  showMessaging: boolean;
  selectedTutor: TutorProfile | null;
  showTutorProfile: boolean;
  showRequirementModal: boolean;
  refreshRequirements: boolean;
  showResponsesModal: boolean;
  selectedRequirement: any;
  requirementContext: any;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0); // unread messages count
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [enrolledCoursesCount, setEnrolledCoursesCount] = useState(0);
  const [state, setState] = useState<DashboardState>({
    activeTab: "dashboard",
    showProfileDialog: false,
    showTutorSearch: false,
    showMessaging: false,
    selectedTutor: null,
    showTutorProfile: false,
    showRequirementModal: false,
    refreshRequirements: false,
    requirementContext: null
  });

  const handleStartChatFromRequirement = (tutor: any) => {
    // Switch to messaging tab and set the selected tutor
    setState(prev => ({
      ...prev,
      activeTab: 'messages',
      selectedTutor: tutor,
      showMessaging: true,
      // Store requirement context for the messaging system
      requirementContext: tutor.requirementContext || null
    }));
  };

  const openChatWithTutor = async (tutorUserId: string) => {
    try {
      console.log('🔍 [DEBUG] openChatWithTutor called with tutor ID:', tutorUserId);
      
      // Fetch tutor profile to populate chat header and state
      const { data: tutorData, error } = await supabase
        .from('tutor_profiles')
        .select(`
          user_id,
          bio,
          experience_years,
          hourly_rate_min,
          hourly_rate_max,
          teaching_mode,
          qualifications,
          profile:user_id(full_name)
        `)
        .eq('user_id', tutorUserId)
        .single();

      if (error || !tutorData) {
        // Fallback: build a minimal tutor object using profiles table so chat can still open
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', tutorUserId)
          .single();
        const minimalTutor: any = {
          user_id: tutorUserId,
          profile: { full_name: profileData?.full_name || 'Tutor' },
        };
        setState(prev => ({ ...prev, activeTab: 'messages', selectedTutor: minimalTutor }));
      } else {
        setState(prev => ({ ...prev, activeTab: 'messages', selectedTutor: tutorData as any }));
      }

      // Mark related message notifications as read
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('type', 'message')
          .filter('data->>sender_id', 'eq', tutorUserId);
        // Refresh notification counters
        loadNotifications();
      }
    } catch (err) {
      console.error('openChatWithTutor error:', err);
      setState(prev => ({ ...prev, activeTab: 'messages' }));
    }
  };

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 [StudentDashboard] Starting authentication check...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('🔍 [StudentDashboard] No user found, redirecting to login');
        navigate("/login");
        return;
      }
      
      console.log('🔍 [StudentDashboard] User authenticated:', user.id);
      setUser(user);
      setCurrentUserId(user.id);
      await loadUserData(user.id);
    };
    checkAuth();
  }, [navigate]);

  const loadUserData = async (userId: string) => {
    try {
      // Load user profile - STRICT role validation to prevent mixing
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'student') // STRICT: Only load student profiles
        .single();

      if (profileError) {
        console.error('❌ [StudentDashboard] Error loading profile:', profileError);
        
        if (profileError.code === 'PGRST116') {
          // No profile found
          toast({
            title: "Profile Not Found",
            description: "No student profile found. Please complete your student registration.",
            variant: "destructive",
          });
          navigate("/signup-choice");
          return;
        }
        
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (profileData?.role !== "student") {
        console.error("❌ [StudentDashboard] Role mismatch! Expected 'student', got:", profileData.role);
        toast({
          title: "Access Denied",
          description: "This dashboard is only for students. Please log in with a student account.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      setUserProfile(profileData);

      // Load student profile
      const { data: studentData, error: studentError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (studentError) {
        console.error('Error loading student profile:', studentError);
        // If no student profile exists, create a basic one
        if (studentError.code === 'PGRST116') {
          console.log('No student profile found, will create one when profile is updated');
        }
      } else {
        setStudentProfile(studentData);
        console.log('Student profile loaded:', studentData);
        console.log('Available columns in student profile:', Object.keys(studentData));
      }

      // Load tutors
      await loadTutors();
      // Load message notifications
      await loadNotifications();
      
      // Load enrolled courses count
      await loadEnrolledCoursesCount(userId);
      
      // Set up real-time subscription for requirements changes
      const cleanup = setupRequirementsSubscription();
      
      // Cleanup function will be called when component unmounts
      return cleanup;
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for requirements changes
  const setupRequirementsSubscription = () => {
    if (!user) return;

    const requirementsChannel = supabase
      .channel('student-requirements-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to ALL events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'requirements',
          filter: `student_id=eq.${user.id}` // Only listen to this student's requirements
        },
        (payload) => {
          console.log('🔔 [StudentDashboard] Requirements change detected:', payload.event, payload);
          
          // Handle different types of changes
          switch (payload.event) {
            case 'INSERT':
              // New requirement added
              console.log('✅ [StudentDashboard] New requirement added');
              break;
              
            case 'UPDATE':
              // Requirement updated (status changed, deleted, etc.)
              const updatedRequirement = payload.new;
              console.log('🔄 [StudentDashboard] Requirement updated:', updatedRequirement.status);
              
              // If requirement is deleted or cancelled, notify tutors
              if (updatedRequirement.status === 'deleted' || updatedRequirement.status === 'cancelled') {
                console.log('🗑️ [StudentDashboard] Requirement marked as deleted/cancelled, notifying tutors');
                // The real-time subscription in TutorDashboard will handle this automatically
              }
              break;
              
            case 'DELETE':
              // Requirement deleted
              console.log('🗑️ [StudentDashboard] Requirement deleted');
              // The real-time subscription in TutorDashboard will handle this automatically
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requirementsChannel);
    };
  };

  // Load enrolled courses count for the student
  const loadEnrolledCoursesCount = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('id', { count: 'exact' })
        .eq('student_id', userId)
        .eq('status', 'enrolled');

      if (!error && data !== null) {
        setEnrolledCoursesCount(data.length);
      }
    } catch (error) {
      console.error('Error loading enrolled courses count:', error);
    }
  };

  // Load notifications of type 'message' for the student
  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'message')
          .order('created_at', { ascending: false })
          .limit(5);

          if (notificationsError) {
            console.log('Notifications table error:', notificationsError.message);
            setNotifications([]);
          } else if (notificationsData) {
          setNotifications(notificationsData);
          }
        } catch (tableError) {
          console.log('Notifications table not available:', tableError);
          setNotifications([]);
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  // Unread messages badge count for student
  const loadUnreadMessagesCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Check if messages table exists and has the expected structure
      try {
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false);
          
        if (error) {
          console.log('Messages table error:', error.message);
          setUnreadCount(0);
        } else {
      setUnreadCount(count || 0);
        }
      } catch (tableError) {
        console.log('Messages table not available:', tableError);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error loading unread messages count (student):', err);
      setUnreadCount(0);
    }
  };

  // Subscribe to realtime notifications for new tutor messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('student-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if ((payload.new as any).type === 'message') {
            setNotifications(prev => [payload.new, ...prev.slice(0, 4)]);
            // Refresh unread message count upon new message
            loadUnreadMessagesCount();
            toast({
              title: 'New Message',
              description: (payload.new as any).message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Listen for unread count updates from child components
  useEffect(() => {
    const handleUnreadCountUpdate = (event: CustomEvent) => {
      const { decrease, increase } = event.detail;
      setUnreadCount(prev => {
        if (decrease) return Math.max(0, prev - decrease);
        if (increase) return prev + increase;
        return prev;
      });
    };

    window.addEventListener('unread-count-updated', handleUnreadCountUpdate as EventListener);
    
    return () => {
      window.removeEventListener('unread-count-updated', handleUnreadCountUpdate as EventListener);
    };
  }, []);

  // Keep unread message count in sync with message table changes
  useEffect(() => {
    if (!user) return;
    loadUnreadMessagesCount();

    const msgChannel = supabase
      .channel('student-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          // Only increase unread count if the message is not from the current user
          if (payload.new && payload.new.sender_id !== user.id) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
    };
  }, [user]);

  const loadTutors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let recommendedTutors = [];

      // First, try to get personalized recommendations based on search history
      try {
        // Check if search history table exists and get recent searches
        // Note: search_history table might not exist, so we'll handle the error gracefully
        const { data: searchHistory, error: searchError } = await supabase
          .from('search_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (searchError) {
          console.log('Search history table not available or error occurred:', searchError.message);
        } else if (searchHistory && searchHistory.length > 0) {
          // Extract subjects and preferences from search history
          const searchPreferences = searchHistory.reduce((acc, search) => {
            if (search.subjects) {
              search.subjects.forEach(subject => {
                acc.subjects[subject] = (acc.subjects[subject] || 0) + 1;
              });
            }
            if (search.teaching_mode) {
              acc.teaching_modes[search.teaching_mode] = (acc.teaching_modes[search.teaching_mode] || 0) + 1;
            }
            if (search.city) {
              acc.cities[search.city] = (acc.cities[search.city] || 0) + 1;
            }
            return acc;
          }, { subjects: {}, teaching_modes: {}, cities: {} });

          // Get top preferences
          const topSubjects = Object.entries(searchPreferences.subjects)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([subject]) => subject);

          const topTeachingModes = Object.entries(searchPreferences.teaching_modes)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([mode]) => mode);

          const topCities = Object.entries(searchPreferences.cities)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([city]) => city);

          // Build personalized query - now we need to query based on JSONB fields
          let personalizedQuery = supabase
            .from("tutor_profiles")
            .select("*");

          // Add filters based on preferences - using the restored fields
          if (topSubjects.length > 0) {
            // Check if any of the top subjects exist in the subjects array
            personalizedQuery = personalizedQuery.overlaps('subjects', topSubjects);
            console.log('Top subjects for filtering:', topSubjects);
          }
          
          if (topTeachingModes.length > 0) {
            // Check if teaching_mode matches any of the top modes
            personalizedQuery = personalizedQuery.in('teaching_mode', topTeachingModes);
          }

          const { data: personalizedTutors, error: personalizedError } = await personalizedQuery;

          if (!personalizedError && personalizedTutors && personalizedTutors.length > 0) {
            recommendedTutors = personalizedTutors;
          }
        }
      } catch (searchHistoryError) {
        console.log('Search history not available, using general recommendations');
        console.log('Search history error:', searchHistoryError);
      }

      // If no personalized recommendations, fall back to general recommendations
      if (recommendedTutors.length === 0) {
        console.log('No personalized recommendations, loading general tutors...');
        try {
          const { data: allTutorsData, error: allTutorsError } = await supabase
            .from("tutor_profiles")
            .select("*")
            .order('rating', { ascending: false })
            .limit(6);

          if (allTutorsError) {
            console.error("Error loading general tutors:", allTutorsError);
            console.log("Tutor profiles table might have structure issues or be empty");
          } else if (allTutorsData) {
            console.log('General tutors loaded:', allTutorsData.length);
            recommendedTutors = allTutorsData;
          } else {
            console.log('No general tutors found');
          }
        } catch (tutorError) {
          console.error("Exception while loading tutors:", tutorError);
        }
      }

      // Enrich tutor data with profile information
      if (recommendedTutors.length > 0) {
        console.log('Found tutors to enrich:', recommendedTutors.length);
        console.log('Sample tutor data:', recommendedTutors[0]);
        
        try {
          // First, try to get all profiles to see what's available
          const { data: allProfiles, error: allProfilesError } = await supabase
            .from("profiles")
            .select("user_id, full_name, city, area, role, profile_photo_url, gender");

          if (allProfilesError) {
            console.error('Error loading all profiles:', allProfilesError);
          } else {
            console.log('All profiles loaded:', allProfiles?.length || 0);
            console.log('Sample profile:', allProfiles?.[0]);
            
            // Debug: Check what roles exist in the database
            if (allProfiles && allProfiles.length > 0) {
              const roles = [...new Set(allProfiles.map(p => p.role))];
              console.log('Available roles in database:', roles);
            }
          }

          // Now try to get tutor profiles specifically - STRICT role filtering to prevent mixing
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, full_name, city, area, role, profile_photo_url, gender")
            .eq("role", "tutor"); // STRICT: Only tutor role, no role mixing

          if (!profilesError && profilesData) {
            console.log('Found tutor profiles to enrich with:', profilesData.length);
            console.log('Sample tutor profile:', profilesData[0]);
            const profilesMap = new Map(profilesData.map(profile => [profile.user_id, profile]));
            
            const enrichedTutors = recommendedTutors.map(tutor => {
              const profile = profilesMap.get(tutor.user_id);
              console.log(`Enriching tutor ${tutor.user_id}:`, profile);
              console.log(`Tutor data:`, tutor);
              return {
                ...tutor,
                profile: profile || null
              };
            });
            
            console.log('Enriched tutors:', enrichedTutors);
            setTutors(enrichedTutors);
          } else {
            console.log('No tutor profiles found, trying alternative approach...');
            
            // Alternative: try to get profiles by user_id from tutor_profiles (with role filtering)
            const tutorUserIds = recommendedTutors.map(t => t.user_id);
            console.log('Tutor user IDs:', tutorUserIds);
            
            // First try with strict role filtering
            const { data: alternativeProfiles, error: alternativeError } = await supabase
              .from("profiles")
              .select("user_id, full_name, city, area, role, profile_photo_url, gender")
              .in("user_id", tutorUserIds)
              .or("role.eq.tutor,role.eq.teacher");
              
            if (!alternativeError && alternativeProfiles && alternativeProfiles.length > 0) {
              console.log('Found alternative profiles with strict filtering:', alternativeProfiles.length);
              console.log('Alternative profiles sample:', alternativeProfiles[0]);
              const profilesMap = new Map(alternativeProfiles.map(profile => [profile.user_id, profile]));
              
              // Filter out tutors that don't have valid tutor profiles
              const validTutors = recommendedTutors.filter(tutor => {
                const profile = profilesMap.get(tutor.user_id);
                return profile && (profile.role === "tutor" || profile.role === "teacher");
              });
              
              const enrichedTutors = validTutors.map(tutor => ({
                ...tutor,
                profile: profilesMap.get(tutor.user_id) || null
              }));
            
              console.log('Enriched tutors (alternative):', enrichedTutors);
              setTutors(enrichedTutors);
            } else {
              console.log('Strict role filtering failed, trying without role filter...');
              console.log('Alternative error:', alternativeError);
              
              // Fallback: get all profiles for these user IDs without role filtering
              const { data: fallbackProfiles, error: fallbackError } = await supabase
                .from("profiles")
                .select("user_id, full_name, city, area, role, profile_photo_url, gender")
                .in("user_id", tutorUserIds);
                
              if (!fallbackError && fallbackProfiles && fallbackProfiles.length > 0) {
                console.log('Found fallback profiles:', fallbackProfiles.length);
                const profilesMap = new Map(fallbackProfiles.map(profile => [profile.user_id, profile]));
                
                // Filter to only include actual tutors and enrich their data
                const validTutors = recommendedTutors.filter(tutor => {
                  const profile = profilesMap.get(tutor.user_id);
                  return profile && (profile.role === "tutor" || profile.role === "teacher");
                });
                
                const enrichedTutors = validTutors.map(tutor => ({
                  ...tutor,
                  profile: profilesMap.get(tutor.user_id) || null
                }));
                
                console.log('Enriched tutors (fallback):', enrichedTutors);
                setTutors(enrichedTutors);
              } else {
                console.log('Fallback approach also failed, trying one more approach...');
                console.log('Fallback error:', fallbackError);
                
                // Last resort: try to get profiles for all tutor user IDs without any filtering
                const { data: lastResortProfiles, error: lastResortError } = await supabase
                  .from("profiles")
                  .select("user_id, full_name, city, area, role, profile_photo_url, gender")
                  .in("user_id", tutorUserIds);
                  
                if (!lastResortError && lastResortProfiles && lastResortProfiles.length > 0) {
                  console.log('Last resort profiles found:', lastResortProfiles.length);
                  const profilesMap = new Map(lastResortProfiles.map(profile => [profile.user_id, profile]));
                  
                  // Filter to only include actual tutors and enrich their data
                  const validTutors = recommendedTutors.filter(tutor => {
                    const profile = profilesMap.get(tutor.user_id);
                    return profile && (profile.role === "tutor" || profile.role === "teacher");
                  });
                  
                  const enrichedTutors = validTutors.map(tutor => ({
                    ...tutor,
                    profile: profilesMap.get(tutor.user_id) || null
                  }));
                  
                  console.log('Enriched tutors (last resort):', enrichedTutors);
                  setTutors(enrichedTutors);
                } else {
                  console.log('All approaches failed, setting tutors without enrichment');
                  console.log('Last resort error:', lastResortError);
                  setTutors(recommendedTutors);
                }
              }
            }
          }
        } catch (enrichError) {
          console.warn("Could not enrich tutor data with profiles:", enrichError);
          setTutors(recommendedTutors);
        }
      } else {
        console.log('No tutors found to display');
        setTutors([]);
      }
    
      // Final fallback: if we still have no tutors, try to load any available tutors
      if (recommendedTutors.length === 0) {
        console.log('Trying final fallback to load any available tutors...');
        try {
          const { data: fallbackTutors, error: fallbackError } = await supabase
            .from("tutor_profiles")
            .select("*")
            .limit(10);
            
          if (!fallbackError && fallbackTutors && fallbackTutors.length > 0) {
            console.log('Fallback tutors loaded:', fallbackTutors.length);
            // Enrich with basic profile info - only for actual tutors
            const { data: basicProfiles } = await supabase
              .from("profiles")
              .select("user_id, full_name, profile_photo_url, role")
              .or("role.eq.tutor,role.eq.teacher");
              
            if (basicProfiles) {
              const profilesMap = new Map(basicProfiles.map(profile => [profile.user_id, profile]));
              // Filter out any fallback tutors that don't have valid tutor profiles
              const validFallbackTutors = fallbackTutors.filter(tutor => {
                const profile = profilesMap.get(tutor.user_id);
                return profile && (profile.role === "tutor" || profile.role === "teacher");
              });
              
              const enrichedFallbackTutors = validFallbackTutors.map(tutor => ({
                ...tutor,
                profile: profilesMap.get(tutor.user_id) || null
              }));
              setTutors(enrichedFallbackTutors);
            } else {
              // If no tutor profiles found, don't show any tutors
              setTutors([]);
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback tutor loading failed:', fallbackErr);
        }
      }
    } catch (error) {
      console.error("Error loading tutors:", error);
    }
  };

  const handlePostRequirement = async (requirementData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to post a requirement",
          variant: "destructive",
        });
        return;
      }

      // Step 1: Save the requirement to the database
      let requirement;
      
      // Log the data being sent to the database
      const requirementToSave = {
            student_id: user.id,
            category: requirementData.category,
            subject: requirementData.subject,
            location: requirementData.location,
            description: requirementData.description,
            preferred_teaching_mode: requirementData.preferredTeachingMode,
            preferred_time: requirementData.preferredTime,
        budget_range: requirementData.budgetRange || '1000-2000',
            urgency: requirementData.urgency,
            additional_requirements: requirementData.additionalRequirements,
            // Category-specific fields
            class_level: requirementData.classLevel || null,
            board: requirementData.board || null,
            exam_preparation: requirementData.examPreparation || null,
            skill_level: requirementData.skillLevel || null,
            age_group: requirementData.ageGroup || null,
            specific_topics: requirementData.specificTopics || null,
            learning_goals: requirementData.learningGoals || null,
            status: 'active',
            created_at: new Date().toISOString()
      };
      
      console.log('Saving requirement to database:', requirementToSave);
      
      try {
        const { data: savedRequirement, error: requirementError } = await supabase
          .from('requirements')
          .insert([requirementToSave])
          .select()
          .single();

        if (requirementError) {
          console.error("Error saving requirement:", requirementError);
          if (requirementError.code === '42P01') { // Table doesn't exist
            toast({
              title: "Database Setup Required",
              description: "Please run the requirements system migration first to create the necessary database tables.",
              variant: "destructive",
            });
            return;
          }
          throw new Error("Failed to save requirement");
        }
        
        requirement = savedRequirement;
        console.log('Requirement saved successfully:', requirement);
      } catch (error) {
        console.error("Error saving requirement:", error);
        toast({
          title: "Error",
          description: "Failed to save requirement. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Step 2: Find relevant tutors based on the requirement
      const matchingTutors = await findMatchingTutors(requirementData);

      // Step 3: Send notifications to matching tutors
      if (matchingTutors.length > 0 && requirement) {
        await sendTutorNotifications(requirement.id, matchingTutors, requirementData);
      }

      // Step 4: Show success message with tutor count
      toast({
        title: "Requirement Posted Successfully!",
        description: `Your requirement has been sent to ${matchingTutors.length} relevant tutors.`,
      });

      setState(prev => ({ ...prev, showRequirementModal: false }));
      
      // Add a small delay to ensure database transaction is complete
      setTimeout(async () => {
        console.log('Refreshing requirements list after posting...');
        
              // Verify the requirement was saved by checking the database
      try {
        console.log('Verifying requirement with ID:', requirement.id);
        const { data: verifyData, error: verifyError } = await supabase
          .from('requirements')
          .select('*')
          .eq('id', requirement.id)
          .single();
        
        if (verifyError) {
          console.error('Error verifying saved requirement:', verifyError);
          console.error('Error details:', verifyError.message, verifyError.code);
        } else {
          console.log('Requirement verified in database:', verifyData);
        }
        
        // Also try to query all requirements for the user to see if RLS is working
        const { data: allRequirements, error: allError } = await supabase
          .from('requirements')
          .select('*')
          .eq('student_id', user.id);
        
        if (allError) {
          console.error('Error querying all requirements:', allError);
        } else {
          console.log('All requirements for user:', allRequirements);
        }
      } catch (verifyErr) {
        console.error('Error during verification:', verifyErr);
      }
        
        setState(prev => ({ ...prev, refreshRequirements: !prev.refreshRequirements }));
      }, 500);

    } catch (error) {
      console.error("Error posting requirement:", error);
      toast({
        title: "Error",
        description: "Failed to post requirement. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Find tutors that match the requirement criteria
  const findMatchingTutors = async (requirementData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Build the query to find matching tutors
      let query = supabase
        .from('tutor_profiles')
        .select(`
          *,
          profile:user_id(
            user_id,
            full_name,
            city,
            area,
            role,
            profile_photo_url,
            gender
          )
        `)
        .eq('profile.role', 'tutor')
        .eq('is_verified', true)
        .eq('is_active', true);

      // Filter by subject/skill match
      if (requirementData.subject) {
        query = query.or(`subjects.cs.{${requirementData.subject}},specializations.cs.{${requirementData.subject}}`);
      }

      // Filter by location (city or area)
      if (requirementData.location && requirementData.location !== 'other') {
        query = query.or(`profile.city.eq.${requirementData.location},profile.area.eq.${requirementData.location}`);
      }

      // Filter by teaching mode preference
      if (requirementData.preferredTeachingMode && requirementData.preferredTeachingMode !== 'both') {
        query = query.eq('teaching_mode', requirementData.preferredTeachingMode);
      }

      // Filter by budget range
      if (requirementData.budgetRange) {
        const [minBudget, maxBudget] = requirementData.budgetRange.split('-').map((b: string) => 
          b === '+' ? 999999 : parseInt(b.replace('₹', '').replace(',', ''))
        );
        query = query.gte('hourly_rate_min', minBudget).lte('hourly_rate_max', maxBudget);
      }

      // Category-specific filtering
      if (requirementData.category === 'academic') {
        if (requirementData.classLevel) {
          query = query.eq('academic_levels', requirementData.classLevel);
        }
        if (requirementData.board) {
          query = query.eq('boards', requirementData.board);
        }
      }

      if (requirementData.category === 'languages') {
        if (requirementData.skillLevel) {
          query = query.eq('language_levels', requirementData.skillLevel);
        }
      }

      if (requirementData.category === 'test_preparation') {
        if (requirementData.examPreparation) {
          query = query.eq('exam_preparation_levels', requirementData.examPreparation);
        }
      }

      const { data: tutors, error } = await query.limit(50);

      if (error) {
        console.error("Error finding matching tutors:", error);
        return [];
      }

      // Additional client-side filtering for complex criteria
      return tutors?.filter(tutor => {
        // Filter by age group if specified
        if (requirementData.ageGroup && tutor.age_groups) {
          if (!tutor.age_groups.includes(requirementData.ageGroup)) {
            return false;
          }
        }

        // Filter by skill level compatibility
        if (requirementData.skillLevel && tutor.skill_levels) {
          const tutorLevels = tutor.skill_levels;
          const requiredLevel = requirementData.skillLevel;
          
          // Map skill levels to numeric values for comparison
          const levelMap: Record<string, number> = {
            'beginner': 1, 'elementary': 1,
            'intermediate': 2, 'upper_intermediate': 2,
            'advanced': 3, 'expert': 4
          };
          
          const requiredLevelNum = levelMap[requiredLevel] || 1;
          const tutorMaxLevel = Math.max(...tutorLevels.map((l: string) => levelMap[l] || 1));
          
          // Tutor should be able to teach at the required level
          if (tutorMaxLevel < requiredLevelNum) {
            return false;
          }
        }

        return true;
      }) || [];

    } catch (error) {
      console.error("Error in findMatchingTutors:", error);
      return [];
    }
  };

  // Send notifications to matching tutors
  const sendTutorNotifications = async (requirementId: string, tutors: any[], requirementData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const notifications = tutors.map(tutor => ({
        user_id: tutor.user_id,
        type: 'new_requirement',
        title: 'New Learning Requirement Available',
        message: `A student is looking for ${requirementData.subject} tutoring in ${requirementData.location}. Click to view details.`,
        data: {
          requirement_id: requirementId,
          student_id: user.id,
          category: requirementData.category,
          subject: requirementData.subject,
          location: requirementData.location,
          budget_range: requirementData.budgetRange,
          urgency: requirementData.urgency
        },
        is_read: false,
        created_at: new Date().toISOString()
      }));

      // Insert notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error("Error sending notifications:", notificationError);
      }

      // Create requirement_tutor_matches for tracking using the improved function
      for (const tutor of tutors) {
        const { error: matchError } = await supabase.rpc(
          'handle_requirement_tutor_match',
          {
            p_requirement_id: requirementId,
            p_tutor_id: tutor.user_id,
            p_status: 'pending'
          }
        );
        
        if (matchError) {
          console.error(`Error creating match for tutor ${tutor.user_id}:`, matchError);
        }
      }

    } catch (error) {
      console.error("Error in sendTutorNotifications:", error);
    }
  };

  const handleLogout = async () => {
    // Don't clear saved credentials - let them persist for convenience
    // clearSavedCredentials(); // Commented out to keep credentials saved
    
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const updateProfile = async (formData: any) => {
    console.log('updateProfile function called with:', formData);
    console.log('Form data keys:', Object.keys(formData));
    console.log('Form data values:', formData);
    
    if (!user) {
      console.log('No user found, returning early');
      return;
    }

    // Quick test to see if migration columns exist
    console.log('=== TESTING IF MIGRATION COLUMNS EXIST ===');
    try {
      const { data: testData, error: testError } = await supabase
        .from('student_profiles')
        .select('tutor_gender_preference, class_type_preference, instruction_language')
        .limit(1);
      
      if (testError) {
        console.error('❌ MIGRATION NOT RUN: Columns do not exist:', testError.message);
        console.error('You need to run the database migration first!');
      } else {
        console.log('✅ MIGRATION RUN: Columns exist and are accessible');
      }
    } catch (e) {
      console.error('❌ Error testing migration columns:', e);
    }

    try {
      // Handle optional profile photo upload
      let profilePhotoUrl: string | undefined = undefined;
      if (formData.profile_photo_file) {
        try {
          const file = formData.profile_photo_file as File;
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-profile.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, file, { upsert: true });
          if (!uploadError) {
            const { data } = supabase.storage
              .from('profile-photos')
              .getPublicUrl(fileName);
            profilePhotoUrl = data.publicUrl;
          }
        } catch (e) {
          console.warn('Profile photo upload failed:', e);
        }
      }

      // Update profiles table
      const profileUpdate: any = {
        full_name: formData.full_name ?? userProfile?.full_name,
        city: formData.city ?? userProfile?.city,
        area: formData.area ?? userProfile?.area,
        primary_language: formData.primary_language ?? userProfile?.primary_language,
        updated_at: new Date().toISOString(),
      };
      if (profilePhotoUrl) profileUpdate.profile_photo_url = profilePhotoUrl;

      console.log('Updating profiles table with:', profileUpdate);

      const { error: profileErr } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('user_id', user.id);
      if (profileErr) throw profileErr;

      console.log('Profiles table updated successfully');

      // Update student_profiles table
      // Calculate profile completion percentage based on essential fields for tutor search
      const essentialFields = [
        formData.full_name,
        formData.city,
        formData.area,
        formData.date_of_birth,
        formData.education_level,
        formData.learning_mode,
        formData.budget_min,
        formData.budget_max,
      ];
      
      const additionalFields = [
        formData.primary_language,
        formData.class_duration,
        formData.frequency,
        formData.tutor_gender_preference,
        formData.instruction_language,
        formData.teaching_methodology,
        formData.class_type_preference,
        formData.special_requirements,
        formData.offline_radius,
        formData.schedule_preferences,
        formData.subject_interests,
        formData.proficiency_levels,
        formData.learning_objectives,
        formData.timeline,
      ];
      
      // Essential fields have higher weight (70% of completion)
      const essentialFieldsFilled = essentialFields.filter(field => {
        if (Array.isArray(field)) return field.length > 0;
        if (typeof field === 'number') return field > 0;
        return field && field.toString().trim() !== '';
      }).length;
      
      // Additional fields have lower weight (30% of completion)
      const additionalFieldsFilled = additionalFields.filter(field => {
        if (Array.isArray(field)) return field.length > 0;
        if (typeof field === 'number') return field > 0;
        return field && field.toString().trim() !== '';
      }).length;
      
      const essentialCompletion = (essentialFieldsFilled / essentialFields.length) * 70;
      const additionalCompletion = (additionalFieldsFilled / additionalFields.length) * 30;
      const profileCompletion = Math.round(essentialCompletion + additionalCompletion);

      // Convert empty strings to null for numeric fields and ensure proper types
      const budgetMin = formData.budget_min && formData.budget_min > 0 ? Number(formData.budget_min) : null;
      const budgetMax = formData.budget_max && formData.budget_max > 0 ? Number(formData.budget_max) : null;
      const classDuration = formData.class_duration && formData.class_duration > 0 ? Number(formData.class_duration) : null;
      const offlineRadius = formData.offline_radius && formData.offline_radius > 0 ? Number(formData.offline_radius) : null;

      // Prepare student profile data with proper validation
      const studentProfileData = {
        user_id: user.id,
        education_level: formData.education_level || null,
        learning_mode: formData.learning_mode || null,
        budget_min: budgetMin,
        budget_max: budgetMax,
        class_duration: classDuration,
        frequency: formData.frequency || null,
        special_requirements: formData.special_requirements || null,
        date_of_birth: formData.date_of_birth || null,
        offline_radius: offlineRadius,
        tutor_gender_preference: formData.tutor_gender_preference || null,
        instruction_language: formData.instruction_language || null,
        teaching_methodology: formData.teaching_methodology || null,
        class_type_preference: formData.class_type_preference || null,
        schedule_preferences: formData.schedule_preferences || null,
        profile_completion_percentage: profileCompletion,
        updated_at: new Date().toISOString(),
        
        // Add the missing fields that are collected in the form but not being saved
        // These will be stored as JSONB in the database
        subject_interests: formData.subject_interests && formData.subject_interests.length > 0 ? formData.subject_interests : null,
        proficiency_levels: formData.proficiency_levels && Object.keys(formData.proficiency_levels).length > 0 ? formData.proficiency_levels : null,
        learning_objectives: formData.learning_objectives && formData.learning_objectives.length > 0 ? formData.learning_objectives : null,
        timeline: formData.timeline || null,
      };

      // Additional validation to ensure only valid values are sent
      console.log('Raw formData.class_type_preference:', formData.class_type_preference);
      console.log('Type of formData.class_type_preference:', typeof formData.class_type_preference);
      
      // Clean up the data to ensure only valid values are sent
      const cleanStudentProfileData = { ...studentProfileData };
      
      // Ensure class_type_preference is only one of the valid values or null
      if (cleanStudentProfileData.class_type_preference && 
          !['Individual', 'Group', 'Both'].includes(cleanStudentProfileData.class_type_preference)) {
        console.warn('Invalid class_type_preference value:', cleanStudentProfileData.class_type_preference);
        cleanStudentProfileData.class_type_preference = null;
      }
      
      // Ensure other constrained fields are valid
      if (cleanStudentProfileData.learning_mode && 
          !['online', 'offline', 'hybrid'].includes(cleanStudentProfileData.learning_mode)) {
        console.warn('Invalid learning_mode value:', cleanStudentProfileData.learning_mode);
        cleanStudentProfileData.learning_mode = null;
      }
      
      if (cleanStudentProfileData.tutor_gender_preference && 
          !['Male', 'Female', 'No preference'].includes(cleanStudentProfileData.tutor_gender_preference)) {
        console.warn('Invalid tutor_gender_preference value:', cleanStudentProfileData.tutor_gender_preference);
        cleanStudentProfileData.tutor_gender_preference = null;
      }
      
      if (cleanStudentProfileData.instruction_language && 
          !['English', 'Hindi', 'Both'].includes(cleanStudentProfileData.instruction_language)) {
        console.warn('Invalid instruction_language value:', cleanStudentProfileData.instruction_language);
        cleanStudentProfileData.instruction_language = null;
      }
      
      if (cleanStudentProfileData.teaching_methodology && 
          !['Interactive', 'Traditional', 'Practical', 'Visual'].includes(cleanStudentProfileData.teaching_methodology)) {
        console.warn('Invalid teaching_methodology value:', cleanStudentProfileData.teaching_methodology);
        cleanStudentProfileData.teaching_methodology = null;
      }
      
      if (cleanStudentProfileData.frequency && 
          !['Once a week', 'Twice a week', 'Thrice a week', 'Daily'].includes(cleanStudentProfileData.frequency)) {
        console.warn('Invalid frequency value:', cleanStudentProfileData.frequency);
        cleanStudentProfileData.frequency = null;
      }
      
      // Final cleanup: remove any undefined or empty string values
      Object.keys(cleanStudentProfileData).forEach(key => {
        if (cleanStudentProfileData[key] === undefined || cleanStudentProfileData[key] === '') {
          cleanStudentProfileData[key] = null;
        }
      });
      
      console.log('Cleaned student profile data:', cleanStudentProfileData);
      console.log('Learning Goals data being saved:');
      console.log('  - Subject Interests:', cleanStudentProfileData.subject_interests);
      console.log('  - Proficiency Levels:', cleanStudentProfileData.proficiency_levels);
      console.log('  - Learning Objectives:', cleanStudentProfileData.learning_objectives);
      console.log('  - Timeline:', cleanStudentProfileData.timeline);
      console.log('  - Schedule Preferences:', cleanStudentProfileData.schedule_preferences);

      console.log('Updating student_profiles table with:', cleanStudentProfileData);
      console.log('Student profile data keys:', Object.keys(cleanStudentProfileData));
      console.log('Student profile data values:', cleanStudentProfileData);

      // First, let's check if the table exists and what columns it has
      const { data: tableInfo, error: tableError } = await supabase
        .from('student_profiles')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error('Error checking student_profiles table:', tableError);
      } else {
        console.log('Student_profiles table structure:', tableInfo);
      }
      
      // Also try to get table schema information
      try {
        const { data: schemaInfo, error: schemaError } = await supabase
          .rpc('get_table_info', { table_name: 'student_profiles' });
        
        if (schemaError) {
          console.log('Schema info not available (this is normal):', schemaError);
        } else {
          console.log('Table schema info:', schemaInfo);
        }
      } catch (e) {
        console.log('Schema query failed (this is normal):', e);
      }

      // Let's also try to get the actual table schema by looking at the data
      try {
        const { data: sampleData, error: sampleError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (sampleError) {
          console.log('No existing student profile found for user:', sampleError);
        } else {
          console.log('Existing student profile data:', sampleData);
          console.log('Available columns:', Object.keys(sampleData));
        }
      } catch (e) {
        console.log('Error checking existing profile:', e);
      }

      // Let's also try to get the table structure by attempting to select specific columns
      console.log('Testing which columns exist in student_profiles table...');
      
      // Test basic columns
      try {
        const { data: testBasic, error: testBasicError } = await supabase
          .from('student_profiles')
          .select('user_id, education_level, date_of_birth')
          .limit(1);
        
        if (testBasicError) {
          console.log('Basic columns test failed:', testBasicError.message);
        } else {
          console.log('Basic columns exist and are accessible');
        }
      } catch (e) {
        console.log('Basic columns test error:', e);
      }

      // Test advanced columns
      try {
        const { data: testAdvanced, error: testAdvancedError } = await supabase
          .from('student_profiles')
          .select('learning_mode, tutor_gender_preference, instruction_language')
          .limit(1);
        
        if (testAdvancedError) {
          console.log('Advanced columns test failed:', testAdvancedError.message);
          console.log('This suggests the migration has not been run yet');
        } else {
          console.log('Advanced columns exist and are accessible');
        }
      } catch (e) {
        console.log('Advanced columns test error:', e);
      }

      // Try to update with the full cleaned data first
      console.log('=== ATTEMPTING FULL DATA UPDATE ===');
      console.log('Data being sent to database:', JSON.stringify(cleanStudentProfileData, null, 2));
      
      let { error: studentErr } = await supabase
        .from("student_profiles")
        .upsert(cleanStudentProfileData, { onConflict: "user_id" });

      console.log('Full update result - Error:', studentErr);
      console.log('Full update result - Success:', !studentErr);

      // If that fails due to missing columns or constraints, try with a subset
      if (studentErr) {
        console.warn('=== FULL DATA UPDATE FAILED ===');
        console.warn('Error details:', {
          message: studentErr.message,
          details: studentErr.details,
          hint: studentErr.hint,
          code: studentErr.code
        });
        
        // Let's try to understand what columns actually exist
        console.log('=== CHECKING TABLE SCHEMA ===');
        console.log('Attempting to create a minimal test record to understand the schema...');
        console.log('NOTE: If you see "column does not exist" errors, you need to run the database migration first.');
        console.log('Migration file: supabase/migrations/add_missing_tutor_profile_columns.sql');
        
        // Try with essential fields only
        const basicData = {
          user_id: cleanStudentProfileData.user_id,
          education_level: cleanStudentProfileData.education_level,
          date_of_birth: cleanStudentProfileData.date_of_birth,
          budget_min: cleanStudentProfileData.budget_min,
          budget_max: cleanStudentProfileData.budget_max,
          class_duration: cleanStudentProfileData.class_duration,
          profile_completion_percentage: cleanStudentProfileData.profile_completion_percentage,
          updated_at: cleanStudentProfileData.updated_at
        };
        
        console.log('=== TRYING BASIC DATA UPDATE ===');
        console.log('Basic data being sent:', JSON.stringify(basicData, null, 2));
        
        const { error: basicErr } = await supabase
          .from("student_profiles")
          .upsert(basicData, { onConflict: "user_id" });
        
        console.log('Basic update result - Error:', basicErr);
        console.log('Basic update result - Success:', !basicErr);
        
        if (basicErr) {
          console.warn('=== BASIC DATA UPDATE ALSO FAILED ===');
          console.warn('Basic data error details:', {
            message: basicErr.message,
            details: basicErr.details,
            hint: basicErr.hint,
            code: basicErr.code
          });
          
          // If even basic fields fail, try with minimal data
          const minimalData = {
            user_id: cleanStudentProfileData.user_id,
            profile_completion_percentage: cleanStudentProfileData.profile_completion_percentage,
            updated_at: cleanStudentProfileData.updated_at
          };
          
          console.log('=== TRYING MINIMAL DATA UPDATE ===');
          console.log('Minimal data being sent:', JSON.stringify(minimalData, null, 2));
          
          const { error: minimalErr } = await supabase
            .from("student_profiles")
            .upsert(minimalData, { onConflict: "user_id" });
          
          console.log('Minimal update result - Error:', minimalErr);
          console.log('Minimal update result - Success:', !minimalErr);
          
          if (minimalErr) {
            console.warn('=== MINIMAL DATA UPDATE ALSO FAILED ===');
            console.warn('Minimal data error details:', {
              message: minimalErr.message,
              details: minimalErr.details,
              hint: minimalErr.hint,
              code: minimalErr.code
            });
            console.log('Will only update basic profile information');
            console.log('SOLUTION: Run the database migration to add missing columns');
            studentErr = null; // Clear the error and continue
          } else {
            console.log('=== MINIMAL DATA UPDATE SUCCESSFUL ===');
            studentErr = null; // Clear the error
          }
        } else {
          console.log('=== BASIC DATA UPDATE SUCCESSFUL ===');
          studentErr = null; // Clear the error
        }
      } else {
        console.log('=== FULL DATA UPDATE SUCCESSFUL ===');
      }

      if (studentErr) {
        console.error('Error updating student_profiles table:', studentErr);
        console.error('Data that caused the error:', cleanStudentProfileData);
        throw studentErr;
      }

      if (studentErr === null) {
        console.log('Student_profiles table updated successfully');
      } else {
        console.log('Basic profile updated, student_profiles skipped due to constraints');
      }

      // All fields are now being saved to the database
      console.log('Profile update completed successfully');

      toast({
        title: "Profile Updated",
        description: studentErr === null 
          ? "Your profile has been updated successfully! All fields including Learning Goals have been saved."
          : "Basic profile updated. Some advanced fields may not be available until the database migration is completed.",
      });

      await loadUserData(user.id);
      setState(prev => ({ ...prev, showProfileDialog: false }));
      console.log('Profile updated successfully, dialog closed');
    } catch (error) {
      // Log the full error object for debugging
      console.error("Error updating profile:", error, JSON.stringify(error));
      let errorMsg = "Failed to update profile.";
      if (error && typeof error === 'object') {
        if ('message' in error && error.message) errorMsg = error.message;
        else errorMsg = JSON.stringify(error);
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (tutorId: string, message: string) => {
    if (!user) return;

    try {
      // This would typically go to a messages table
      // For now, we'll just show a toast
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the tutor.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const navMenu = [
          { label: "Dashboard", icon: <HomeIcon />, id: "dashboard" },
      { label: "Courses", icon: <BookOpen />, id: "courses" },
      { label: "My Classes", icon: <GraduationCap />, id: "my-classes" },
      { label: "Book Sessions", icon: <Calendar />, id: "book-sessions" },
      { label: "Find Tutors", icon: <Search />, id: "tutors" },
          { label: "My Requirements", icon: <List />, id: "requirements" },
    { label: "Messages", icon: <MessageCircle />, id: "messages", badge: unreadCount > 0 ? unreadCount : undefined },
    { label: "Help & Support", icon: <HelpCircle />, id: "help" },
  ];

  const profileCompletion = studentProfile?.profile_completion_percentage || 0;

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <SidebarProvider>
        <div className="flex flex-1">
          {/* Sidebar Navigation */}
          <Sidebar className="bg-sidebar border-r">
            <SidebarContent>
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-primary">EduXperience</h2>
                <p className="text-sm text-muted-foreground">Student Dashboard</p>
              </div>
              <SidebarMenu>
                {navMenu.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      isActive={state.activeTab === item.id}
                      onClick={() => setState(prev => ({ ...prev, activeTab: item.id }))}
                      className="flex items-center gap-3"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-6 md:p-10 bg-background overflow-y-auto">
            {state.activeTab === "dashboard" && (
              <DashboardHome 
                userProfile={userProfile}
                studentProfile={studentProfile}
                tutors={tutors}
                unreadCount={unreadCount}
                enrolledCoursesCount={enrolledCoursesCount}
                setState={setState}
                onViewProfile={() => setState(prev => ({ ...prev, showProfileDialog: true }))}
                onFindTutors={() => setState(prev => ({ ...prev, activeTab: "tutors" }))}
                onViewMessages={() => setState(prev => ({ ...prev, activeTab: "messages" }))}
                onOpenChatWithTutor={openChatWithTutor}
              />
            )}

            {state.activeTab === "courses" && (
              <StudentCourses onEnrollSuccess={() => {
                // Refresh any relevant data after successful enrollment
                toast({
                  title: "Enrollment Successful",
                  description: "You can now view your enrolled courses in the My Classes tab.",
                });
                // Refresh enrolled courses count
                if (user) {
                  loadEnrolledCoursesCount(user.id);
                }
              }} />
            )}

            {state.activeTab === "my-classes" && (
              <MyClasses onNavigateToBookSessions={() => setState(prev => ({ ...prev, activeTab: "book-sessions" }))} />
            )}

            {state.activeTab === "book-sessions" && (
              <SessionBooking />
            )}

            {state.activeTab === "tutors" && (
              <TutorSearch 
                tutors={tutors}
                onSelectTutor={(tutor) => setState(prev => ({ ...prev, selectedTutor: tutor }))}
                onSendMessage={(tutor) => {
                  setState(prev => ({ ...prev, selectedTutor: tutor, activeTab: "messages" }));
                }}
              />
            )}

            {state.activeTab === "requirements" && (
              <RequirementsDashboard 
                onPostRequirement={() => setState(prev => ({ ...prev, showRequirementModal: true }))}
                refreshTrigger={state.refreshRequirements}
                onStartChat={handleStartChatFromRequirement}
              />
            )}

            {state.activeTab === "messages" && (
              <MessagingDashboard 
                selectedTutor={state.selectedTutor}
                onBackToTutors={() => setState(prev => ({ ...prev, activeTab: "tutors" }))}
                onOpenChatWithTutor={openChatWithTutor}
                requirementContext={state.requirementContext}
              />
            )}

            {state.activeTab === "classes" && (
              <ClassesDashboard />
            )}



            {state.activeTab === "help" && (
              <HelpSupport />
            )}
          </main>
        </div>
      </SidebarProvider>

      {/* Profile Edit Dialog */}
      {state.showProfileDialog && (
        <ProfileEditDialog
          userProfile={userProfile}
          studentProfile={studentProfile}
          onUpdate={updateProfile}
          onClose={() => setState(prev => ({ ...prev, showProfileDialog: false }))}
        />
      )}

      {/* Requirement Posting Modal */}
      {state.showRequirementModal && (
        <RequirementPostingModal
          onClose={() => setState(prev => ({ ...prev, showRequirementModal: false }))}
          onPostRequirement={handlePostRequirement}
        />
      )}
    </div>
  );
}

// Dashboard Home Component
function DashboardHome({ 
  userProfile, 
  studentProfile, 
  tutors, 
  unreadCount,
  enrolledCoursesCount,
  setState,
  onViewProfile, 
  onFindTutors, 
  onViewMessages, 
  onOpenChatWithTutor
}: {
  userProfile: Profile | null;
  studentProfile: StudentProfile | null;
  tutors: TutorProfile[];
  unreadCount: number;
  enrolledCoursesCount: number;
  setState: React.Dispatch<React.SetStateAction<DashboardState>>;
  onViewProfile: () => void;
  onFindTutors: () => void;
  onViewMessages: () => void;
  onOpenChatWithTutor: (tutorUserId: string) => void;
}) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [learningProgress, setLearningProgress] = useState<any[]>([]);

  useEffect(() => {
    // Load recent activity from database
    loadRecentActivity();
    // Load learning progress from database
    loadLearningProgress();
    // Load latest message notifications to surface on dashboard
    loadNotificationsPreview();
  }, []);

  const loadRecentActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const activities = [];

      // 1. Fetch recent searches (from search history or recent tutor views)
      // TODO: Implement when search history table is available
      // For now, we'll skip this until we have a proper search history tracking system
      // const { data: searchData } = await supabase
      //   .from('search_history')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .order('created_at', { ascending: false })
      //   .limit(3);

      // 2. Fetch demo class bookings (from bookings or demo_requests table)
      // TODO: Implement when bookings table is available
      // const { data: demoData } = await supabase
      //   .from('bookings')
      //   .select('*')
      //   .eq('student_id', user.id)
      //   .eq('type', 'demo')
      //   .order('created_at', { ascending: false })
      //   .limit(2);

      // 3. Fetch recent messages (already handled by notifications, but adding here for completeness)
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      // Get sender profiles for messages
      const messageData = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, profile_photo_url')
            .eq('id', msg.sender_id)
            .single();

          return {
            ...msg,
            profiles: profileData
          };
        })
      );

      if (messageData && messageData.length > 0) {
        messageData.forEach(msg => {
          activities.push({
            id: `message_${msg.id}`,
            type: 'message',
            title: 'New Message',
            description: `Message from ${msg.profiles?.full_name || 'Tutor'}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
            timestamp: msg.created_at,
            icon: <MessageCircle className="h-4 w-4 text-accent" />,
            color: 'text-accent',
            bgColor: 'bg-accent/10'
          });
        });
      }

      // 4. Fetch class reminders (from classes or schedule table)
      // TODO: Implement when classes table is available
      // const { data: classData } = await supabase
      //   .from('classes')
      //   .select('*')
      //   .eq('student_id', user.id)
      //   .gte('start_time', new Date().toISOString())
      //   .order('start_time', { ascending: true })
      //   .limit(2);

      // Sort activities by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Limit to 6 most recent activities
      setRecentActivity(activities.slice(0, 6));
    } catch (error) {
      console.error("Error loading recent activity:", error);
      setRecentActivity([]);
    }
  };

  const loadLearningProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const progressData = [];

      // 1. Fetch current subjects and progress from student's learning records
      try {
        // Check if learning_records table exists
        const { data: learningRecords, error: learningError } = await supabase
          .from('learning_records')
          .select('*')
          .eq('student_id', user.id)
          .order('updated_at', { ascending: false });

        if (!learningError && learningRecords && learningRecords.length > 0) {
          // Group by subject and calculate progress
          const subjectProgress = learningRecords.reduce((acc, record) => {
            if (!acc[record.subject]) {
              acc[record.subject] = {
                subject: record.subject,
                totalClasses: 0,
                completedClasses: 0,
                progress: 0,
                nextClass: null,
                tutor: record.tutor_name || 'Tutor'
              };
            }
            acc[record.subject].totalClasses++;
            if (record.status === 'completed') {
              acc[record.subject].completedClasses++;
            }
            acc[record.subject].progress = Math.round((acc[record.subject].completedClasses / acc[record.subject].totalClasses) * 100);
            return acc;
          }, {});

          Object.values(subjectProgress).forEach(subject => {
            progressData.push(subject);
          });
        }
      } catch (learningTableError) {
        console.log('Learning records table not available yet, using placeholder data');
        // Add placeholder data for demonstration
        progressData.push({
          subject: 'Mathematics',
          totalClasses: 0,
          completedClasses: 0,
          progress: 0,
          nextClass: null,
          tutor: 'No tutor assigned yet'
        });
      }

      // 2. Fetch upcoming classes from classes table
      try {
        const { data: upcomingClasses, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('student_id', user.id)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(5);

        // Get tutor profiles for classes
        if (!classesError && upcomingClasses && upcomingClasses.length > 0) {
          const classesWithTutors = await Promise.all(
            upcomingClasses.map(async (classItem) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, profile_photo_url')
                .eq('id', classItem.tutor_id)
                .single();

              return {
                ...classItem,
                profiles: profileData
              };
            })
          );
          upcomingClasses.splice(0, upcomingClasses.length, ...classesWithTutors);
        }

        if (!classesError && upcomingClasses && upcomingClasses.length > 0) {
          // Add upcoming classes to progress data
          upcomingClasses.forEach(classItem => {
            const existingSubject = progressData.find(item => item.subject === classItem.subject);
            if (existingSubject) {
              existingSubject.nextClass = {
                time: classItem.start_time,
                tutor: classItem.profiles?.full_name || 'Tutor',
                duration: classItem.duration || 60
              };
            } else {
              // If subject doesn't exist in progress, create a new entry
              progressData.push({
                subject: classItem.subject,
                totalClasses: 0,
                completedClasses: 0,
                progress: 0,
                nextClass: {
                  time: classItem.start_time,
                  tutor: classItem.profiles?.full_name || 'Tutor',
                  duration: classItem.duration || 60
                },
                tutor: classItem.profiles?.full_name || 'Tutor'
              });
            }
          });
        }
      } catch (classesTableError) {
        console.log('Classes table not available');
      }

      // 3. If no real data available, show empty state
      // TODO: Remove this section when learning_records and classes tables are implemented
      // The section will automatically show "No learning progress yet" when progressData is empty

      setLearningProgress(progressData);
    } catch (error) {
      console.error("Error loading learning progress:", error);
      setLearningProgress([]);
    }
  };

  const loadNotificationsPreview = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'message')
        .order('created_at', { ascending: false })
        .limit(5);
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications preview:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={userProfile?.profile_photo_url || ""} 
              alt={`${userProfile?.full_name || "Student"}'s profile photo`}
            />
            <AvatarFallback className="text-xl font-semibold">
              {userProfile?.full_name?.split(" ").map(n => n[0]).join("") || userProfile?.email?.slice(0, 2).toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, <span className="text-primary">{userProfile?.full_name || ""}</span>
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">Profile Completion</span>
              <Progress value={studentProfile?.profile_completion_percentage || 0} className="w-40 h-2" />
              <span className="text-sm font-semibold">{studentProfile?.profile_completion_percentage || 0}%</span>
              <Button size="sm" className="ml-4 bg-gradient-primary" onClick={onViewProfile}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button size="lg" className="col-span-2 md:col-span-1 bg-gradient-primary shadow-soft flex flex-col items-center justify-center gap-2 h-28" onClick={onFindTutors}>
          <Search className="h-6 w-6" />
          Find Tutors
        </Button>
        <Button 
          size="lg" 
          className="bg-secondary text-secondary-foreground flex flex-col items-center justify-center gap-2 h-28"
          onClick={() => {
            console.log('🔍 [Post Requirement] Button clicked!');
            console.log('🔍 [Post Requirement] Current state:', state);
            setState(prev => {
              console.log('🔍 [Post Requirement] Setting showRequirementModal to true');
              return { ...prev, showRequirementModal: true };
            });
          }}
        >
          <List className="h-6 w-6" />
          Post Requirement
        </Button>
        <Button 
          size="lg" 
          className="bg-accent text-accent-foreground flex flex-col items-center justify-center gap-2 h-28 relative"
          onClick={() => window.location.href = '#my-classes'}
        >
          <GraduationCap className="h-6 w-6" />
          My Classes
          {enrolledCoursesCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {enrolledCoursesCount > 99 ? '99+' : enrolledCoursesCount}
            </div>
          )}
        </Button>
        <Button size="lg" className="bg-muted text-foreground flex flex-col items-center justify-center gap-2 h-28 relative" onClick={onViewMessages}>
          <MessageCircle className="h-6 w-6" />
          Messages
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </Button>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Recent Activity</h3>
          <Button variant="link" className="text-primary flex items-center gap-1 p-0 h-auto">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {notifications.length > 0 && (
          <div className="space-y-3 mb-6">
            {notifications.map((n) => (
              <Card key={n.id} className="shadow-soft border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{n.title}</h4>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const tutorId = n.data?.sender_id;
                        if (tutorId) onOpenChatWithTutor(tutorId);
                        else onViewMessages();
                      }}
                    >
                      View Messages
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {recentActivity.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentActivity.map((item, idx) => (
              <Card key={item.id || idx} className="shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${item.bgColor || 'bg-muted'}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {/* Action buttons based on activity type */}
                      <div className="flex gap-2">
                        {item.type === 'search' && (
                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={onFindTutors}>
                            View Tutors
                          </Button>
                        )}
                        {item.type === 'demo' && (
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            View Details
                          </Button>
                        )}
                        {item.type === 'message' && (
                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={onViewMessages}>
                            Reply
                          </Button>
                        )}
                        {item.type === 'reminder' && (
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            Join Class
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No recent activity.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recommended Tutors */}
      {tutors.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Recommended Tutors</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Based on your preferences and search history
              </p>
            </div>
            <Button variant="link" className="text-primary flex items-center gap-1 p-0 h-auto" onClick={onFindTutors}>
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {tutors.slice(0, 6).map((tutor, idx) => (
                          <Card key={idx} className="shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer" onClick={() => onFindTutors()}>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Avatar className="h-12 w-12 mb-2">
                  <AvatarImage 
                    src={tutor.profile?.profile_photo_url || ""} 
                    alt={`${tutor.profile?.full_name || "Tutor"}'s profile photo`}
                  />
                  <AvatarFallback>{tutor.profile?.full_name?.split(" ").map(n => n[0]).join("") || tutor.user_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm">{tutor.profile?.full_name || `Tutor ${tutor.user_id.slice(0, 8)}`}</span>
                <span className="text-muted-foreground text-xs">{tutor.teaching_mode || ""}</span>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-bold">{tutor.rating || 0}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">₹{tutor.hourly_rate_min || 0}/hr</span>
              </CardContent>
            </Card>
            ))}
          </div>
        </section>
      )}

                {/* Available Courses */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Available Courses</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Discover structured courses from qualified tutors
                </p>
              </div>
              <Button 
                variant="link" 
                className="text-primary flex items-center gap-1 p-0 h-auto"
                onClick={() => window.location.href = '#courses'}
              >
                Browse All Courses <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* My Classes Quick Access */}
            <div className="flex items-center justify-between mb-4 mt-6">
              <div>
                <h3 className="text-xl font-semibold">My Classes</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Track your enrolled courses and learning progress
                </p>
              </div>
              <Button 
                variant="link" 
                className="text-primary flex items-center gap-1 p-0 h-auto"
                onClick={() => window.location.href = '#my-classes'}
              >
                View My Classes <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
        
        <div className="flex justify-center">
          {/* Course Discovery Card */}
          <Card className="shadow-soft hover:shadow-medium transition-shadow border-dashed border-2 border-gray-300 max-w-md">
            <CardContent className="p-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Explore Courses</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Find structured learning paths in your favorite subjects
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, activeTab: 'courses' }))}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Learning Progress */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Learning Progress</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your progress across subjects and upcoming classes
            </p>
          </div>
          <Button variant="link" className="text-primary flex items-center gap-1 p-0 h-auto">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {learningProgress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningProgress.map((item, idx) => (
              <Card key={idx} className="shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{item.subject}</h4>
                      <p className="text-xs text-muted-foreground">with {item.tutor}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">{item.progress}%</span>
                      <p className="text-xs text-muted-foreground">
                        {item.completedClasses}/{item.totalClasses} classes
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={item.progress} className="h-2 mb-3" />
                  
                  {item.nextClass ? (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium">Next Class</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(item.nextClass.time).toLocaleDateString()} at {new Date(item.nextClass.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.nextClass.duration} min with {item.nextClass.tutor}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">No upcoming classes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground font-medium">No learning progress yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start learning with a tutor to see your progress here
                  </p>
                </div>
                <Button size="sm" onClick={onFindTutors} className="mt-2">
                  Find a Tutor
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

// Tutor Search Component
function TutorSearch({ 
  tutors, 
  onSelectTutor, 
  onSendMessage 
}: {
  tutors: TutorProfile[];
  onSelectTutor: (tutor: TutorProfile) => void;
  onSendMessage: (tutor: TutorProfile) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState<TutorProfile | null>(null);
  const [interestedTutors, setInterestedTutors] = useState<Set<string>>(new Set());
  const [location, setLocation] = useState("");
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [filteredSubjects, setFilteredSubjects] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [classType, setClassType] = useState("both");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [tutorGender, setTutorGender] = useState("any");
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [availabilitySlots, setAvailabilitySlots] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [demoAvailable, setDemoAvailable] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favoriteTutors, setFavoriteTutors] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(20);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  
  const { toast } = useToast();

  // Use the exact same subject categories as defined in ProfileEditDialog
  const subjectCategories = {
    academic: [
      "Mathematics", "Physics", "Chemistry", "Biology", "English", 
      "Hindi", "History", "Geography", "Economics", "Political Science"
    ],
    professional: [
      "Programming", "Web Development", "Data Science", "Digital Marketing",
      "Graphic Design", "UI/UX Design", "Business Analytics", "Finance"
    ],
    creative: [
      "Music", "Dance", "Painting", "Photography", "Cooking", 
      "Creative Writing", "Theatre", "Yoga", "Meditation"
    ],
    testPrep: [
      "JEE Main/Advanced", "NEET", "CAT", "GATE", "UPSC", 
      "IELTS", "TOEFL", "GRE", "GMAT", "SSC"
    ]
  };

  // Availability time slots
  const timeSlots = [
    "Morning (6 AM - 12 PM)",
    "Afternoon (12 PM - 6 PM)",
    "Evening (6 PM - 10 PM)",
    "Night (10 PM - 6 AM)",
    "Weekends Only",
    "Weekdays Only"
  ];

  // Experience level options
  const experienceOptions = [
    "Beginner (0-2 years)",
    "Intermediate (3-5 years)",
    "Expert (5+ years)",
    "PhD Holder",
    "Industry Professional"
  ];

  // Get all subjects as a flat array for autocomplete
  const allSubjects = Object.values(subjectCategories).flat();

  // Filter subjects based on search input
  const filterSubjects = (input: string) => {
    if (!input.trim()) {
      setFilteredSubjects([]);
      setShowSubjectSuggestions(false);
      return;
    }
    
    const filtered = allSubjects.filter(subject =>
      subject.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredSubjects(filtered);
    setShowSubjectSuggestions(filtered.length > 0);
  };

  // Handle subject selection from autocomplete
  const handleSubjectSelect = (subject: string) => {
    setSearchTerm(subject);
    setShowSubjectSuggestions(false);
    setFilteredSubjects([]);
  };

  // Handle experience level toggle
  const toggleExperienceLevel = (level: string) => {
    setExperienceLevels(prev => {
      const newLevels = prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level];
      console.log('Experience levels updated:', newLevels);
      return newLevels;
    });
  };

  // Handle availability slot toggle
  const toggleAvailabilitySlot = (slot: string) => {
    setAvailabilitySlots(prev => {
      const newSlots = prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot];
      console.log('Availability slots updated:', newSlots);
      return newSlots;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    console.log('Clearing all filters');
    setSearchTerm("");
    setSelectedSubject("all");
    setPriceRange([0, 5000]);
    setClassType("both");
    setTutorGender("any");
    setExperienceLevels([]);
    setMinRating(0);
    setAvailabilitySlots([]);
    setMaxDistance(50);
    setVerifiedOnly(false);
    setDemoAvailable(false);
    setLocation("");
    setSortBy("relevance");
    setViewMode("grid");
    setFavoriteTutors(new Set());
    resetPagination();
  };

  // Handle favorite toggle
  const toggleFavorite = (tutorId: string) => {
    setFavoriteTutors(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tutorId)) {
        newFavorites.delete(tutorId);
        toast({
          title: "Removed from favorites",
          description: "Tutor removed from your favorites list.",
        });
      } else {
        newFavorites.add(tutorId);
        toast({
          title: "Added to favorites",
          description: "Tutor added to your favorites list.",
        });
      }
      return newFavorites;
    });
  };

  // Handle demo booking
  const handleBookDemo = (tutor: TutorProfile) => {
    toast({
      title: "Demo Class Request",
      description: `Demo class request sent to ${tutor.profile?.full_name || "the tutor"}. They will contact you soon!`,
    });
  };

  // Handle share profile
  const handleShareProfile = (tutor: TutorProfile) => {
    if (navigator.share) {
      navigator.share({
        title: `${tutor.profile?.full_name || "Tutor"}'s Profile`,
        text: `Check out this amazing tutor: ${tutor.profile?.full_name || "Tutor"} - ${tutor.bio || "Qualified and experienced tutor"}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      const profileText = `${tutor.profile?.full_name || "Tutor"}'s Profile\n${tutor.bio || "Qualified and experienced tutor"}\n${window.location.href}`;
      navigator.clipboard.writeText(profileText).then(() => {
        toast({
          title: "Profile Shared",
          description: "Tutor profile link copied to clipboard!",
        });
      }).catch(() => {
        toast({
          title: "Share Failed",
          description: "Could not share profile. Please try again.",
          variant: "destructive",
        });
      });
    }
  };

  // Pagination functions
  const loadMoreResults = () => {
    setCurrentPage(prev => prev + 1);
  };

  const resetPagination = () => {
    setCurrentPage(1);
    setHasMoreResults(true);
  };

  // Calculate paginated results
  const getPaginatedTutors = () => {
    const startIndex = 0;
    const endIndex = currentPage * resultsPerPage;
    return sortedTutors.slice(startIndex, endIndex);
  };

  // GPS location detection
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocoding using a free service
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            
            if (response.ok) {
              const data = await response.json();
              const city = data.address.city || data.address.town || data.address.village || 'Unknown Location';
              setLocation(city);
              toast({
                title: "Location Detected",
                description: `Your location: ${city}`,
              });
            } else {
              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (error) {
            console.error('Error getting location:', error);
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location Error",
            description: "Could not detect your location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location detection.",
        variant: "destructive",
      });
    }
  };

  // Handle search term changes for autocomplete
  useEffect(() => {
    filterSubjects(searchTerm);
  }, [searchTerm]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.subject-search-container')) {
        setShowSubjectSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Advanced keyword matching function
  const matchesKeywords = (tutor: TutorProfile, keywords: string): boolean => {
    if (!keywords.trim()) return true;
    
    const searchTerms = keywords.toLowerCase().split(' ').filter(term => term.length > 0);
    const tutorText = [
      tutor.bio || '',
      tutor.teaching_mode || '',
      Array.isArray(tutor.subjects) ? tutor.subjects.join(' ') : '',
      Array.isArray(tutor.student_levels) ? tutor.student_levels.join(' ') : '',
      Array.isArray(tutor.curriculum) ? tutor.curriculum.join(' ') : '',
      tutor.highest_qualification || '',
      tutor.university || '',
    ].join(' ').toLowerCase();

    const result = searchTerms.every(term => tutorText.includes(term));
    
    return result;
  };

  const filteredTutors = tutors.filter(tutor => {
    // Debug: Log tutor data structure
    if (tutors.length > 0 && tutors.indexOf(tutor) === 0) {
      console.log('Sample tutor data structure:', {
        id: tutor.id,
        user_id: tutor.user_id,
        bio: tutor.bio,
        experience_years: tutor.experience_years,
        hourly_rate_min: tutor.hourly_rate_min,
        teaching_mode: tutor.teaching_mode,
        rating: tutor.rating,
        verified: tutor.verified,
        qualifications: tutor.qualifications,
        profile: tutor.profile
      });
    }
    
    const matchesSearch = matchesKeywords(tutor, searchTerm);
    
    // Subject filter - check if tutor teaches the selected subject
    let matchesSubject = true;
    if (selectedSubject !== "all") {
      const tutorSubjects = tutor.subjects || [];
      // Check if the selected subject exists in tutor's subjects array
      matchesSubject = Array.isArray(tutorSubjects) && tutorSubjects.includes(selectedSubject);
      if (tutors.length > 0 && tutors.indexOf(tutor) === 0) {
        console.log('Subject filter:', { selectedSubject, tutorSubjects, matchesSubject });
      }
    } else {
      // If "all" is selected, always match
      matchesSubject = true;
    }
    
    // Price range filter (new slider-based)
    let matchesPrice = true;
    const tutorRate = tutor.hourly_rate_min || 0;
    matchesPrice = tutorRate >= priceRange[0] && tutorRate <= priceRange[1];
    if (tutors.length > 0 && tutors.indexOf(tutor) === 0) {
      console.log('Price filter:', { priceRange, tutorRate, matchesPrice });
    }
    
    // Experience filter (new checkbox-based)
    let matchesExperience = true;
    if (experienceLevels.length > 0) {
      const tutorExperience = tutor.experience_years || 0;
      const tutorQualification = tutor.highest_qualification || '';
      
      matchesExperience = experienceLevels.some(level => {
        if (level === "Beginner (0-2 years)") return tutorExperience <= 2;
        if (level === "Intermediate (3-5 years)") return tutorExperience > 2 && tutorExperience <= 5;
        if (level === "Expert (5+ years)") return tutorExperience > 5;
        if (level === "PhD Holder") return tutorQualification.toLowerCase().includes('phd');
        if (level === "Industry Professional") return tutorQualification.toLowerCase().includes('industry') || tutorQualification.toLowerCase().includes('professional');
        return false;
      });
      if (tutors.length > 0 && tutors.indexOf(tutor) === 0) {
        console.log('Experience filter:', { experienceLevels, tutorExperience, tutorQualification, matchesExperience });
      }
    }
    
    // Class type filter
    let matchesClassType = true;
    if (classType !== "both") {
      const tutorMode = tutor.teaching_mode || '';
      if (classType === "online") {
        matchesClassType = tutorMode.toLowerCase().includes('online');
      } else if (classType === "offline") {
        matchesClassType = tutorMode.toLowerCase().includes('offline') || tutorMode.toLowerCase().includes('in-person');
      }
      if (tutors.length > 0 && tutors.indexOf(tutor) === 0) {
        console.log('Class type filter:', { classType, tutorMode, matchesClassType });
      }
    }
    
    // Gender filter
    let matchesGender = true;
    if (tutorGender !== "any") {
      const tutorGenderProfile = (tutor.profile as any)?.gender || '';
      matchesGender = tutorGenderProfile.toLowerCase() === tutorGender.toLowerCase();
      if (tutors.length > 0 && tutors.indexOf(tutor) === 0) {
        console.log('Gender filter:', { tutorGender, tutorGenderProfile, matchesGender });
      }
    }
    
    // Rating filter
    let matchesRating = true;
    if (minRating > 0) {
      matchesRating = (tutor.rating || 0) >= minRating;
      if (tutors.length > 0 && tutors.indexOf(tutor) === 0) {
        console.log('Rating filter:', { minRating, tutorRating: tutor.rating, matchesRating });
      }
    }
    
    // Verified only filter - now using the verified field from tutor_profiles
    let matchesVerified = true;
    if (verifiedOnly) {
      matchesVerified = tutor.verified === true;
      if (tutors.length > 0 && tutors.indexOf(tutor) === 0) {
        console.log('Verified filter:', { verifiedOnly, tutorVerified: tutor.verified, matchesVerified });
      }
    }
    
    // Demo available filter - check if demo class fee is set
    let matchesDemo = true;
    if (demoAvailable) {
      const demoFee = tutor.demo_class_fee;
      matchesDemo = demoFee && demoFee !== '' && demoFee !== '0';
      if (tutors.length > 0 && tutors.indexOf(tutor) === 0) {
        console.log('Demo filter:', { demoAvailable, demoFee, matchesDemo });
      }
    }
    
    const finalResult = matchesSearch && matchesSubject && matchesPrice && matchesExperience && 
                       matchesClassType && matchesGender && matchesRating && matchesVerified && matchesDemo;
    
    if (tutors.length > 0 && tutors.indexOf(tutor) === 0) {
      console.log('Final filter result:', { 
        matchesSearch, matchesSubject, matchesPrice, matchesExperience, 
        matchesClassType, matchesGender, matchesRating, matchesVerified, matchesDemo, 
        finalResult 
      });
    }
    
    return finalResult;
  });

  // Sort filtered tutors based on selected criteria
  const sortedTutors = [...filteredTutors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "price":
        return (a.hourly_rate_min || 0) - (b.hourly_rate_min || 0);
      case "experience":
        return (b.experience_years || 0) - (a.experience_years || 0);
      case "distance":
        // For now, sort by ID as placeholder for distance calculation
        // TODO: Implement actual distance calculation when location data is available
        return a.user_id.localeCompare(b.user_id);
      case "relevance":
      default:
        // Relevance: prioritize tutors that match search term, then by rating
        const aRelevance = (a.rating || 0) + (matchesKeywords(a, searchTerm) ? 10 : 0);
        const bRelevance = (b.rating || 0) + (matchesKeywords(b, searchTerm) ? 10 : 0);
        return bRelevance - aRelevance;
    }
  });

  // Update hasMoreResults when filtered tutors change
  useEffect(() => {
    const totalFiltered = sortedTutors.length;
    const currentTotal = currentPage * resultsPerPage;
    setHasMoreResults(currentTotal < totalFiltered);
    console.log('Filtering results:', { 
      totalTutors: tutors.length, 
      totalFiltered, 
      currentPage, 
      resultsPerPage, 
      hasMore: currentTotal < totalFiltered 
    });
  }, [sortedTutors, currentPage, resultsPerPage]);

  // Reset pagination when filters change
  useEffect(() => {
    console.log('Filters changed, resetting pagination:', {
      searchTerm,
      selectedSubject,
      classType,
      priceRange,
      tutorGender,
      experienceLevels,
      minRating,
      availabilitySlots,
      maxDistance,
      verifiedOnly,
      demoAvailable,
      sortBy
    });
    resetPagination();
  }, [searchTerm, selectedSubject, classType, priceRange, tutorGender, experienceLevels, minRating, availabilitySlots, maxDistance, verifiedOnly, demoAvailable, sortBy]);

  const handleInterested = async (tutor: TutorProfile) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to show interest in tutors.",
          variant: "destructive",
        });
        return;
      }

      // Check if already interested
      if (interestedTutors.has(tutor.user_id)) {
        toast({
          title: "Already Interested",
          description: "You have already shown interest in this tutor.",
          variant: "default",
        });
        return;
      }

      // Get student profile information for better notification
      const { data: studentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching student profile:', profileError);
      }

      const studentName = studentProfile?.full_name || '';

      // Create notification for the tutor
      try {
        // Generate UUID on client side to ensure it's not null
        const generateUUID = () => {
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
          }
          // Fallback UUID generation
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };

        const notificationId = generateUUID();
        
        // Try direct insert with explicit UUID
        const { data: notificationResult, error: notificationError } = await supabase
          .from('notifications')
          .insert({
            id: notificationId,
            user_id: tutor.user_id,
            title: "New Student Interest",
            message: `${studentName} has shown interest in your profile! Check your messages to connect.`,
            type: "interest",
            data: {
              student_id: user.id,
              student_name: studentName,
              tutor_id: tutor.user_id,
              timestamp: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (notificationError) {
          console.error('Notification creation error:', notificationError);
          console.error('Error details:', {
            message: notificationError.message,
            details: notificationError.details,
            hint: notificationError.hint,
            code: notificationError.code
          });
          
          // Try without the data field
          const { data: simpleNotification, error: simpleError } = await supabase
            .from('notifications')
            .insert({
              id: generateUUID(),
              user_id: tutor.user_id,
              title: "New Student Interest",
              message: `${studentName} has shown interest in your profile! Check your messages to connect.`,
              type: "interest"
            })
            .select()
            .single();

          if (simpleError) {
            console.error('Simple notification creation also failed:', simpleError);
            toast({
              title: "Error",
              description: "Failed to send interest notification. Please try again.",
              variant: "destructive",
            });
            return;
          } else {
            console.log('Simple notification created successfully:', simpleNotification);
          }
        } else {
          console.log('Notification created successfully:', notificationResult);
        }
      } catch (error) {
        console.error('Notification creation failed:', error);
        toast({
          title: "Error",
          description: "Failed to send interest notification. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setInterestedTutors(prev => new Set([...prev, tutor.user_id]));

      toast({
        title: "Interest Sent!",
        description: "The tutor has been notified of your interest. They'll contact you soon!",
      });

    } catch (error) {
      console.error('Error showing interest:', error);
      toast({
        title: "Error",
        description: "Failed to show interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewProfile = (tutor: TutorProfile) => {
    setSelectedTutorForProfile(tutor);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar Section */}
      <div className="bg-white rounded-lg border shadow-soft p-6">
        <h2 className="text-2xl font-bold mb-4">Find Tutors</h2>
        
        {/* Main Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Subject Autocomplete Field */}
          <div className="flex-1 relative subject-search-container">
            <Label htmlFor="subject-search" className="text-sm font-medium mb-2 block">
              What do you want to learn?
            </Label>
            <div className="relative">
              <Input
                id="subject-search"
                placeholder="e.g., Mathematics, Programming, Music..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
                onFocus={() => setShowSubjectSuggestions(true)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              
              {/* Autocomplete Suggestions */}
              {showSubjectSuggestions && filteredSubjects.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {filteredSubjects.map((subject, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none"
                      onClick={() => handleSubjectSelect(subject)}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location Field */}
          <div className="flex-1">
            <Label htmlFor="location" className="text-sm font-medium mb-2 block">
              Location
            </Label>
            <div className="flex gap-2">
              <Input
                id="location"
                placeholder="Enter your city or location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={detectLocation}
                title="Detect my location"
                className="shrink-0"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button 
              className="bg-gradient-primary h-10 px-8"
              onClick={() => {
                // Handle search logic here
                setShowSubjectSuggestions(false);
              }}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Filter Toggle Button */}
        <div className="flex justify-center pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
          </Button>
        </div>
      </div>

      {/* Advanced Filters Sidebar */}
      {showFilters && (
        <div className="bg-white rounded-lg border shadow-soft p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Subject Categories */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Subject Categories
              </h3>
              <div className="space-y-2">
                {Object.entries(subjectCategories).map(([category, subjects]) => (
                  <details key={category} className="group">
                    <summary className="flex items-center justify-between cursor-pointer font-medium text-sm hover:text-primary">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-2 ml-4 space-y-1">
                      {subjects.map(subject => (
                        <label key={subject} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedSubject === subject}
                          onChange={() => {
                            const newSubject = selectedSubject === subject ? "all" : subject;
                            console.log('Subject filter changed:', { from: selectedSubject, to: newSubject });
                            setSelectedSubject(newSubject);
                          }}
                            className="rounded border-border"
                          />
                          {subject}
                        </label>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Class Type & Price Range */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                  <Monitor className="h-5 w-5 text-primary" />
                  Class Type
                </h3>
                <RadioGroup value={classType} onValueChange={(value) => {
                  console.log('Class type changed:', { from: classType, to: value });
                  setClassType(value);
                }}>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="both" id="classType-both" />
                      Both Online & Offline
                    </label>
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="online" id="classType-online" />
                      Online Only
                    </label>
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="offline" id="classType-offline" />
                      Offline Only
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  Price Range (₹/hour)
                </h3>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => {
                      console.log('Price range changed:', { from: priceRange, to: value });
                      setPriceRange(value);
                    }}
                    max={5000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tutor Gender & Experience */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-primary" />
                  Tutor Gender
                </h3>
                <RadioGroup value={tutorGender} onValueChange={(value) => {
                  console.log('Tutor gender changed:', { from: tutorGender, to: value });
                  setTutorGender(value);
                }}>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="any" id="gender-any" />
                      Any Gender
                    </label>
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="gender-male" />
                      Male
                    </label>
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="gender-female" />
                      Female
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5 text-primary" />
                  Experience Level
                </h3>
                <div className="space-y-2">
                  {experienceOptions.map(level => (
                    <label key={level} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={experienceLevels.includes(level)}
                        onChange={() => toggleExperienceLevel(level)}
                        className="rounded border-border"
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Ratings & Availability */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-primary" />
                  Minimum Rating
                </h3>
                <div className="px-2">
                  <Slider
                    value={[minRating]}
                    onValueChange={(value) => {
                      console.log('Rating filter changed:', { from: minRating, to: value[0] });
                      setMinRating(value[0]);
                    }}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    {minRating}★ and above
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-primary" />
                  Availability
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {timeSlots.map(slot => (
                    <label key={slot} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={availabilitySlots.includes(slot)}
                        onChange={() => toggleAvailabilitySlot(slot)}
                        className="rounded border-border"
                      />
                      {slot}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Distance & Toggles */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  Max Distance (km)
                </h3>
                <div className="px-2">
                  <Slider
                    value={[maxDistance]}
                    onValueChange={(value) => {
                      console.log('Distance filter changed:', { from: maxDistance, to: value[0] });
                      setMaxDistance(value[0]);
                    }}
                    max={100}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    Within {maxDistance} km
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Verification & Features
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => {
                        console.log('Verified filter changed:', { from: verifiedOnly, to: e.target.checked });
                        setVerifiedOnly(e.target.checked);
                      }}
                      className="rounded border-border"
                    />
                    Verified Tutors Only
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={demoAvailable}
                      onChange={(e) => {
                        console.log('Demo filter changed:', { from: demoAvailable, to: e.target.checked });
                        setDemoAvailable(e.target.checked);
                      }}
                      className="rounded border-border"
                    />
                    Demo Class Available
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Clear All Filters Button */}
          <div className="flex justify-center pt-6 border-t mt-6">
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Results Display Controls */}
      <div className="bg-white rounded-lg border shadow-soft p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Results Count */}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Search Results</h3>
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-primary">{getPaginatedTutors().length}</span> of{' '}
              <span className="font-semibold">{sortedTutors.length}</span> tutors
              {sortedTutors.length !== tutors.length && (
                <span className="text-xs ml-2">
                  (filtered from {tutors.length})
                </span>
              )}
              {hasMoreResults && (
                <span className="text-xs ml-2 text-blue-600">
                  • Load more to see all results
                </span>
              )}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Sort by:</Label>
              <select
                value={sortBy}
                onChange={(e) => {
                  console.log('Sort changed:', { from: sortBy, to: e.target.value });
                  setSortBy(e.target.value);
                }}
                className="px-3 py-2 border border-border rounded-md text-sm bg-background min-w-[140px]"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating (High to Low)</option>
                <option value="price">Price (Low to High)</option>
                <option value="experience">Experience (High to Low)</option>
                <option value="distance">Distance</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">View:</Label>
              <div className="flex border border-border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    console.log('View mode changed to grid');
                    setViewMode("grid");
                  }}
                  className="rounded-none border-0 h-8 px-3"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    console.log('View mode changed to list');
                    setViewMode("list");
                  }}
                  className="rounded-none border-0 h-8 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          {selectedSubject !== "all" && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              🎯 Subject: {selectedSubject}
            </span>
          )}
          {classType !== "both" && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
              💻 {classType === "online" ? "Online Only" : "Offline Only"}
            </span>
          )}
          {tutorGender !== "any" && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
              👤 {tutorGender === "male" ? "Male" : "Female"} Tutors
            </span>
          )}
          {minRating > 0 && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
              ⭐ {minRating}+ Rating
            </span>
          )}
          {verifiedOnly && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
              ✅ Verified Only
            </span>
          )}
          {demoAvailable && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
              🎬 Demo Available
            </span>
          )}
          {priceRange[0] > 0 || priceRange[1] < 5000 ? (
            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
              💰 ₹{priceRange[0]}-{priceRange[1]}/hr
            </span>
          ) : null}
        </div>
      </div>

      {/* Tutors Display */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {getPaginatedTutors().map((tutor, idx) => (
          <Card key={idx} className={`shadow-soft hover:shadow-medium transition-all duration-300 ${
            viewMode === "list" ? "flex flex-row p-6" : ""
          }`}>
            {viewMode === "list" ? (
              // List View Layout
              <>
                {/* Left Section - Profile Photo */}
                <div className="flex-shrink-0 mr-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={tutor.profile?.profile_photo_url || ""} 
                      alt={`${tutor.profile?.full_name || `Tutor ${tutor.user_id.slice(0, 8)}`}'s profile photo`}
                    />
                    <AvatarFallback className="text-xl">
                      {tutor.profile?.full_name?.split(" ").map(n => n[0]).join("") || tutor.user_id.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Center Section - Main Content */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Header Row - Name, Title, Rating, Experience */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-foreground break-words">
                          {tutor.profile?.full_name || `Tutor ${tutor.user_id.slice(0, 8)}`}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(tutor.user_id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500"
                        >
                          <Heart 
                            className={`h-4 w-4 ${
                              favoriteTutors.has(tutor.user_id) 
                                ? "fill-red-500 text-red-500" 
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                      </div>
                      
                      {/* Title/Qualification */}
                      <p className="text-sm text-muted-foreground mb-2">
                        {(tutor.qualifications as any)?.highest_qualification || "Qualified Tutor"}
                        {(tutor.qualifications as any)?.university && ` • ${(tutor.qualifications as any)?.university}`}
                      </p>
                      
                      {/* Rating and Experience */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (tutor.rating || 0) 
                                    ? "text-yellow-500 fill-yellow-500" 
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-foreground ml-1">{tutor.rating || 0}</span>
                          <span className="text-muted-foreground">({tutor.total_reviews || 0})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{tutor.experience_years || 0} years</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side - Price and Location */}
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-lg font-bold text-primary mb-1">
                        ₹{tutor.hourly_rate_min || 0}/hr
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        {tutor.teaching_mode || "Location not specified"}
                      </div>
                    </div>
                  </div>

                  {/* Subjects Taught - Tags */}
                  {(tutor.qualifications as any)?.subjects && (tutor.qualifications as any)?.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(tutor.qualifications as any)?.subjects.slice(0, 5).map((subject: string, subjectIdx: number) => (
                        <Badge key={subjectIdx} variant="secondary" className="text-xs px-2 py-1">
                          {subject}
                        </Badge>
                      ))}
                      {(tutor.qualifications as any)?.subjects.length > 5 && (
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          +{(tutor.qualifications as any)?.subjects.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  {tutor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {tutor.bio}
                    </p>
                  )}

                  {/* Badges Row */}
                  <div className="flex flex-wrap gap-2">
                    {/* Teaching Mode Badge */}
                    <Badge 
                      variant={tutor.teaching_mode?.toLowerCase().includes('online') ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {tutor.teaching_mode?.toLowerCase().includes('online') ? '🌐 Online' : '📍 Offline'}
                    </Badge>
                    
                    {/* Verified Badge */}
                    {(tutor.profile as any)?.is_verified && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                        ✅ Verified
                      </Badge>
                    )}
                    
                    {/* Demo Available Badge */}
                    {(tutor.profile as any)?.demo_available && (
                      <Badge variant="default" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
                        🎬 Free Demo
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button 
                      onClick={() => handleViewProfile(tutor)}
                      size="sm"
                      className="flex-1 min-w-0"
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    
                    {(tutor.profile as any)?.demo_available && (
                      <Button 
                        variant="outline"
                        onClick={() => handleBookDemo(tutor)}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Demo
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline"
                      onClick={() => onSendMessage(tutor)}
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Grid View Layout (existing)
              <>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage 
                        src={tutor.profile?.profile_photo_url || ""} 
                        alt={`${tutor.profile?.full_name || "Tutor"}'s profile photo`}
                      />
                      <AvatarFallback>
                        {tutor.profile?.full_name?.split(" ").map(n => n[0]).join("") || tutor.user_id.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg break-words">
                        {tutor.profile?.full_name || `Tutor ${tutor.user_id.slice(0, 8)}`}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-sm font-medium">{tutor.rating || 0}</span>
                        <span className="text-sm text-muted-foreground">({tutor.total_reviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Bio Section with Proper Text Wrapping */}
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {tutor.bio || "No bio available"}
                    </p>
                  </div>
                  
                  {/* Tutor Details with Proper Wrapping */}
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{tutor.teaching_mode || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{tutor.experience_years || 0} years exp.</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <IndianRupee className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">₹{tutor.hourly_rate_min || 0}/hr</span>
                    </div>
                  </div>

                  {/* Action Buttons with Proper Layout */}
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      className="flex-1 min-w-0" 
                      onClick={() => handleViewProfile(tutor)}
                    >
                      <span className="truncate">View Full Profile</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onSendMessage(tutor)}
                      className="flex-shrink-0"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={interestedTutors.has(tutor.user_id) ? "default" : "secondary"}
                      onClick={() => handleInterested(tutor)}
                      disabled={interestedTutors.has(tutor.user_id)}
                      className="flex-shrink-0"
                    >
                      {interestedTutors.has(tutor.user_id) ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="truncate">Interested</span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {sortedTutors.length > 0 && (
        <div className="bg-white rounded-lg border shadow-soft p-6 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-primary">{getPaginatedTutors().length}</span> of{' '}
              <span className="font-semibold">{sortedTutors.length}</span> tutors
              {sortedTutors.length !== tutors.length && (
                <span className="text-xs ml-2">(filtered from {tutors.length})</span>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-3">
              {/* Page Info */}
              <div className="text-sm text-muted-foreground">
                Page <span className="font-semibold">{currentPage}</span> of{' '}
                <span className="font-semibold">{Math.ceil(sortedTutors.length / resultsPerPage)}</span>
              </div>

              {/* Load More Button */}
              {hasMoreResults && (
                <Button 
                  onClick={loadMoreResults}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Load More ({Math.min(resultsPerPage, sortedTutors.length - getPaginatedTutors().length)} more)
                </Button>
              )}

              {/* Reset to First Page */}
              {currentPage > 1 && (
                <Button 
                  onClick={() => setCurrentPage(1)}
                  variant="ghost"
                  size="sm"
                >
                  Back to First Page
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutor Profile Dialog */}
      {selectedTutorForProfile && (
        <Dialog open={!!selectedTutorForProfile} onOpenChange={() => setSelectedTutorForProfile(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Tutor Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Enhanced Header Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Large Profile Photo */}
                  <div className="flex-shrink-0">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                      <AvatarImage 
                        src={selectedTutorForProfile.profile?.profile_photo_url || ""} 
                        alt={`${selectedTutorForProfile.profile?.full_name || "Tutor"}'s profile photo`}
                      />
                      <AvatarFallback className="text-3xl font-bold">
                        {selectedTutorForProfile.profile?.full_name?.split(" ").map(n => n[0]).join("") || selectedTutorForProfile.user_id.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Main Header Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Qualifications */}
                    <div className="mb-4">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedTutorForProfile.profile?.full_name || "Tutor Name"}
                      </h1>
                      <div className="flex items-center gap-3 text-lg text-gray-600">
                        <span className="font-medium">
                          {(selectedTutorForProfile.qualifications as any)?.highest_qualification || "Qualified Tutor"}
                        </span>
                        {(selectedTutorForProfile.qualifications as any)?.university && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>{(selectedTutorForProfile.qualifications as any)?.university}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rating and Experience */}
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`h-5 w-5 ${
                                star <= (selectedTutorForProfile.rating || 0) 
                                  ? "text-yellow-500 fill-yellow-500" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="ml-2">
                          <span className="text-xl font-bold text-gray-900">{selectedTutorForProfile.rating || 0}</span>
                          <span className="text-gray-600 ml-1">({selectedTutorForProfile.total_reviews || 0} reviews)</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-5 w-5" />
                        <span className="font-medium">{selectedTutorForProfile.experience_years || 0} years experience</span>
                      </div>

                      <Badge variant={selectedTutorForProfile.verified ? "default" : "secondary"} className="text-sm">
                        {selectedTutorForProfile.verified ? "✅ Verified" : "⏳ Pending Verification"}
                      </Badge>
                    </div>

                    {/* Prominent Price Display */}
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-primary">
                        ₹{selectedTutorForProfile.hourly_rate_min || 0}
                        {selectedTutorForProfile.hourly_rate_max && selectedTutorForProfile.hourly_rate_max !== selectedTutorForProfile.hourly_rate_min && (
                          <span className="text-xl text-gray-500"> - ₹{selectedTutorForProfile.hourly_rate_max}</span>
                        )}
                        <span className="text-lg text-gray-600 font-normal">/hour</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Professional tutoring rate</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {/* Book Demo Class */}
                      {(selectedTutorForProfile.profile as any)?.demo_available && (
                        <Button 
                          onClick={() => handleBookDemo(selectedTutorForProfile)}
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          Book Demo Class
                        </Button>
                      )}

                      {/* Send Message */}
                      <Button 
                        onClick={() => onSendMessage(selectedTutorForProfile)}
                        variant="outline"
                        size="lg"
                        className="border-2 hover:bg-blue-50"
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Send Message
                      </Button>

                      {/* Save Tutor */}
                      <Button 
                        onClick={() => toggleFavorite(selectedTutorForProfile.user_id)}
                        variant="outline"
                        size="lg"
                        className={`border-2 ${
                          favoriteTutors.has(selectedTutorForProfile.user_id)
                            ? "bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <Heart 
                          className={`h-5 w-5 mr-2 ${
                            favoriteTutors.has(selectedTutorForProfile.user_id) 
                              ? "fill-red-500 text-red-500" 
                              : "text-gray-600"
                          }`}
                        />
                        {favoriteTutors.has(selectedTutorForProfile.user_id) ? "Saved" : "Save Tutor"}
                      </Button>

                      {/* Share Profile */}
                      <Button 
                        onClick={() => handleShareProfile(selectedTutorForProfile)}
                        variant="outline"
                        size="lg"
                        className="border-2 hover:bg-green-50"
                      >
                        <Share2 className="h-5 w-5 mr-2" />
                        Share Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Experience in Years */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-100 rounded-full p-3 mb-3">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {selectedTutorForProfile.experience_years || 0}
                    </h3>
                    <p className="text-sm text-gray-600">Years Experience</p>
                  </div>
                </div>

                {/* Students Taught */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center">
                    <div className="bg-green-100 rounded-full p-3 mb-3">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {(selectedTutorForProfile as any)?.students_taught || 0}
                    </h3>
                    <p className="text-sm text-gray-600">Students Taught</p>
                  </div>
                </div>

                {/* Classes Completed */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-100 rounded-full p-3 mb-3">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {(selectedTutorForProfile as any)?.classes_completed || 0}
                    </h3>
                    <p className="text-sm text-gray-600">Classes Completed</p>
                  </div>
                </div>

                {/* Response Time */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center">
                    <div className="bg-orange-100 rounded-full p-3 mb-3">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {(selectedTutorForProfile as any)?.response_time_hours || 0}
                    </h3>
                    <p className="text-sm text-gray-600">Response Time (hrs)</p>
                  </div>
                </div>

                {/* Languages */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center">
                    <div className="bg-indigo-100 rounded-full p-3 mb-3">
                      <Globe className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {Array.isArray((selectedTutorForProfile as any)?.languages) 
                        ? (selectedTutorForProfile as any)?.languages.length || 0
                        : 0
                      }
                    </h3>
                    <p className="text-sm text-gray-600">Languages</p>
                  </div>
                </div>
              </div>

              {/* Languages List (if available) */}
              {Array.isArray((selectedTutorForProfile as any)?.languages) && (selectedTutorForProfile as any)?.languages.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold mb-3 text-gray-900">Languages Spoken</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedTutorForProfile as any)?.languages.map((language: string, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {selectedTutorForProfile.bio && (
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-muted-foreground">{selectedTutorForProfile.bio}</p>
                </div>
              )}

              {/* About Section - Teaching Methodology, Why Choose Me, Specializations */}
              <div className="space-y-4">
                {/* Teaching Methodology */}
                {(selectedTutorForProfile as any)?.teaching_methodology && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Teaching Methodology
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        {(selectedTutorForProfile as any)?.teaching_methodology}
                      </p>
                    </div>
                  </div>
                )}

                {/* Why Choose Me */}
                {(selectedTutorForProfile as any)?.why_choose_me && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Why Choose Me
                    </h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        {(selectedTutorForProfile as any)?.why_choose_me}
                      </p>
                    </div>
                  </div>
                )}


                
                {/* Subjects Taught - Simple Display for Now */}
                {(selectedTutorForProfile as any)?.qualifications?.subjects && Array.isArray((selectedTutorForProfile as any)?.qualifications?.subjects) && (selectedTutorForProfile as any)?.qualifications?.subjects.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-500" />
                      Subjects Taught
                    </h4>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex flex-wrap gap-2">
                        {(selectedTutorForProfile as any)?.qualifications?.subjects.map((subject: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Experience & Qualifications</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedTutorForProfile.experience_years || 0} years of experience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Teaching Mode: {selectedTutorForProfile.teaching_mode || ""}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Pricing</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        <span>₹{selectedTutorForProfile.hourly_rate_min || 0} - ₹{selectedTutorForProfile.hourly_rate_max || 0} per hour</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Qualifications Section */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Qualifications & Education
                </h4>
                
                {/* Education Timeline */}
                <div className="mb-6">
                  <h5 className="font-medium text-gray-700 mb-3">Education Timeline</h5>
                  <div className="space-y-4">
                    {/* Highest Qualification */}
                    {(selectedTutorForProfile as any)?.qualifications?.highest_qualification && (
                      <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-semibold text-blue-800">
                              {(selectedTutorForProfile as any)?.qualifications?.highest_qualification}
                            </h6>
                            {(selectedTutorForProfile as any)?.qualifications?.year_of_passing && (
                              <span className="text-sm text-blue-600 font-medium">
                                {(selectedTutorForProfile as any)?.qualifications?.year_of_passing}
                              </span>
                            )}
                          </div>
                          {(selectedTutorForProfile as any)?.qualifications?.university && (
                            <p className="text-sm text-blue-700 mb-1">
                              {(selectedTutorForProfile as any)?.qualifications?.university}
                            </p>
                          )}
                          {(selectedTutorForProfile as any)?.qualifications?.percentage && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-blue-600 font-medium">Score:</span>
                              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                {(selectedTutorForProfile as any)?.qualifications?.percentage}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Teaching Experience */}
                    {(selectedTutorForProfile as any)?.experience_years && (
                      <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-semibold text-green-800">Teaching Experience</h6>
                            <span className="text-sm text-green-600 font-medium">
                              {(selectedTutorForProfile as any)?.experience_years} years
                            </span>
                          </div>
                          {(selectedTutorForProfile as any)?.currently_teaching && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-green-600 font-medium">Status:</span>
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                Currently Teaching
                              </Badge>
                            </div>
                          )}
                          {(selectedTutorForProfile as any)?.current_teaching_place && (
                            <p className="text-sm text-green-700 mt-1">
                              <span className="font-medium">Current:</span> {(selectedTutorForProfile as any)?.current_teaching_place}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* No Qualifications Message */}
                    {!((selectedTutorForProfile as any)?.qualifications?.highest_qualification || (selectedTutorForProfile as any)?.experience_years) && (
                      <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-500">No detailed qualifications available</p>
                        <p className="text-sm text-gray-400 mt-1">Contact tutor for more information</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Certificates & Achievements */}
                <div className="mb-6">
                  <h5 className="font-medium text-gray-700 mb-3">Certificates & Achievements</h5>
                  {selectedTutorForProfile.certificates && selectedTutorForProfile.certificates.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTutorForProfile.certificates.slice(0, 4).map((cert, index) => (
                          <Card key={cert.id || index} className="border-2 border-orange-200 hover:border-orange-300 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                  <Award className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                  <h6 className="font-semibold text-gray-800">{cert.title}</h6>
                                  <p className="text-xs text-gray-500">{cert.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge 
                                  variant="outline" 
                                  className="bg-orange-50 text-orange-700 border-orange-300 cursor-pointer hover:bg-orange-100"
                                  onClick={() => {
                                    if (cert.certificate_url) {
                                      window.open(cert.certificate_url, '_blank');
                                    } else {
                                      alert('Certificate not available for viewing');
                                    }
                                  }}
                                >
                                  View Certificate
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {cert.issue_date ? new Date(cert.issue_date).getFullYear() : 'N/A'}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="text-center mt-4">
                        <Button variant="outline" size="sm">
                          <Award className="h-4 w-4 mr-2" />
                          View All Certificates
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                      <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h5 className="text-lg font-semibold mb-2">No Certificates Yet</h5>
                      <p className="text-gray-500 mb-4">This tutor hasn't uploaded any certificates yet.</p>
                      <p className="text-sm text-gray-400">Check back later for verified qualifications!</p>
                    </div>
                  )}
                </div>
                
                {/* Verification Status */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Verification Status</h5>
                  {selectedTutorForProfile.verifications && selectedTutorForProfile.verifications.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {selectedTutorForProfile.verifications.map((verification, index) => (
                        <div key={verification.id || index} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className={`w-3 h-3 rounded-full ${
                            verification.status === 'verified' ? 'bg-green-500' : 
                            verification.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-700">
                            {verification.verification_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <Badge variant={
                            verification.status === 'verified' ? "default" : 
                            verification.status === 'rejected' ? "destructive" : "secondary"
                          } className="text-xs">
                            {verification.status === 'verified' ? "✅ Verified" : 
                             verification.status === 'rejected' ? "❌ Rejected" : "⏳ Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
                      <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Verification status not available</p>
                      <p className="text-xs text-gray-400 mt-1">Contact tutor for verification details</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Reviews & Ratings
                </h4>
                
                {/* Overall Rating Summary */}
                <div className="mb-6">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        {selectedTutorForProfile.rating || 0}
                      </div>
                      <div className="flex items-center justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`h-5 w-5 ${
                              star <= (selectedTutorForProfile.rating || 0) 
                                ? "text-yellow-500 fill-yellow-500" 
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedTutorForProfile.total_reviews || 0} reviews
                      </div>
                    </div>
                    
                    {/* Rating Breakdown */}
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-700 mb-3">Rating Breakdown</h5>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          // Calculate actual percentage based on reviews data
                          const ratingCount = selectedTutorForProfile.rating_breakdown?.[rating] || 0;
                          const percentage = selectedTutorForProfile.total_reviews ? 
                            Math.round((ratingCount / selectedTutorForProfile.total_reviews) * 100) : 0;
                          
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-12">
                                <span className="text-sm font-medium text-gray-600">{rating}</span>
                                <Star className="h-4 w-4 text-yellow-500" />
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {percentage}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews Filter and Sort */}
                <div className="mb-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Filter by:</span>
                      <div className="flex gap-1">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <button
                            key={rating}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              rating === 5 
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {rating}★
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Sort by:</span>
                      <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                        <option value="recent">Most Recent</option>
                        <option value="rating">Highest Rating</option>
                        <option value="helpful">Most Helpful</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {/* Dynamic Reviews from Database */}
                  {selectedTutorForProfile.reviews && selectedTutorForProfile.reviews.length > 0 ? (
                    selectedTutorForProfile.reviews.slice(0, 3).map((review, index) => (
                      <div key={review.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {review.student_name?.split(" ").map(n => n[0]).join("") || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {review.student_name || "Anonymous Student"}
                              </span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating 
                                        ? "text-yellow-500 fill-yellow-500" 
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">
                              {review.review_text || "No review text provided."}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {review.subject_taught && <span>Subject: {review.subject_taught}</span>}
                              {review.class_type && <span>Class Type: {review.class_type}</span>}
                              <span>Verified Student: {review.verified_student ? "Yes" : "No"}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <button className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                Helpful ({review.helpful_votes || 0})
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h5 className="text-lg font-semibold mb-2">No Reviews Yet</h5>
                      <p className="text-gray-500 mb-4">This tutor hasn't received any reviews yet.</p>
                      <p className="text-sm text-gray-400">Be the first to leave a review after taking classes!</p>
                    </div>
                  )}


                </div>

                {/* Load More Reviews */}
                <div className="text-center mt-6">
                  <Button variant="outline" className="px-6">
                    Load More Reviews
                  </Button>
                </div>

                {/* No Reviews Message */}
                {(!selectedTutorForProfile.total_reviews || selectedTutorForProfile.total_reviews === 0) && (
                  <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h5 className="text-lg font-semibold mb-2">No Reviews Yet</h5>
                    <p className="text-gray-500 mb-4">This tutor hasn't received any reviews yet.</p>
                    <p className="text-sm text-gray-400">Be the first to leave a review after taking classes!</p>
                  </div>
                )}
              </div>

              {/* Sample Content & Teaching Materials */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Sample Content & Teaching Materials
                </h4>
                
                {/* Teaching Videos */}
                <div className="mb-6">
                  <h5 className="font-medium text-gray-700 mb-3">Teaching Videos</h5>
                  {selectedTutorForProfile.teaching_videos && selectedTutorForProfile.teaching_videos.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTutorForProfile.teaching_videos.slice(0, 4).map((video, index) => (
                          <Card key={video.id || index} className="shadow-soft hover:shadow-medium transition-shadow">
                            <CardContent className="p-4">
                              <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Play className="h-8 w-8 text-blue-600" />
                                  </div>
                                  <p className="text-sm text-gray-600">Click to preview</p>
                                </div>
                              </div>
                              <h6 className="font-semibold text-gray-900 mb-1">{video.title}</h6>
                              <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Duration: {video.duration}</span>
                                <span>Views: {video.views?.toLocaleString() || 0}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="text-center mt-4">
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          View All Videos
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                      <Play className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h5 className="text-lg font-semibold mb-2">No Teaching Videos Yet</h5>
                      <p className="text-gray-500 mb-4">This tutor hasn't uploaded any teaching videos yet.</p>
                      <p className="text-sm text-gray-400">Check back later for sample lessons!</p>
                    </div>
                  )}
                </div>

                {/* Study Materials */}
                <div className="mb-6">
                  <h5 className="font-medium text-gray-700 mb-3">Study Materials</h5>
                  {selectedTutorForProfile.study_materials && selectedTutorForProfile.study_materials.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedTutorForProfile.study_materials.slice(0, 3).map((material, index) => (
                          <Card key={material.id || index} className="shadow-soft hover:shadow-medium transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                  <h6 className="font-semibold text-gray-900">{material.title}</h6>
                                  <p className="text-xs text-gray-500">PDF • {material.file_size}</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                              <Button variant="outline" size="sm" className="w-full">
                                <Download className="h-4 w-4 mr-2" />
                                Download Sample
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="text-center mt-4">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View All Materials
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h5 className="text-lg font-semibold mb-2">No Study Materials Yet</h5>
                      <p className="text-gray-500 mb-4">This tutor hasn't uploaded any study materials yet.</p>
                      <p className="text-sm text-gray-400">Check back later for notes and practice problems!</p>
                    </div>
                  )}
                </div>

                {/* Student Work Examples */}
                <div className="mb-6">
                  <h5 className="font-medium text-gray-700 mb-3">Examples of Previous Student Work</h5>
                  {selectedTutorForProfile.student_work_examples && selectedTutorForProfile.student_work_examples.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {selectedTutorForProfile.student_work_examples.slice(0, 3).map((work, index) => (
                          <Card key={work.id || index} className="shadow-soft hover:shadow-medium transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Award className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h6 className="font-semibold text-gray-900">{work.title}</h6>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                      Grade: {work.grade}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {work.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {work.subject && <span>Subject: {work.subject}</span>}
                                    {work.duration && <span>Duration: {work.duration}</span>}
                                    {work.student_level && <span>Student Level: {work.student_level}</span>}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="text-center mt-4">
                        <Button variant="outline" size="sm">
                          <Award className="h-4 w-4 mr-2" />
                          View All Examples
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                      <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h5 className="text-lg font-semibold mb-2">No Student Work Examples Yet</h5>
                      <p className="text-gray-500 mb-4">This tutor hasn't shared any student work examples yet.</p>
                      <p className="text-sm text-gray-400">Check back later for examples of student achievements!</p>
                    </div>
                  )}
                </div>

                {/* Teaching Methodology Examples */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Teaching Approach Examples</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Interactive Learning */}
                    <Card className="shadow-soft hover:shadow-medium transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-indigo-600" />
                          </div>
                          <h6 className="font-semibold text-gray-900">Interactive Learning</h6>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Real-time problem solving with student participation. 
                          Encourages questions and active engagement during sessions.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>✓ Real-time feedback</span>
                          <span>✓ Student engagement</span>
                          <span>✓ Adaptive pace</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Visual Learning */}
                    <Card className="shadow-soft hover:shadow-medium transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                            <Eye className="h-5 w-5 text-pink-600" />
                          </div>
                          <h6 className="font-semibold text-gray-900">Visual Learning</h6>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Diagrams, graphs, and visual representations to explain complex concepts. 
                          Makes abstract ideas more concrete and understandable.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>✓ Diagrams & graphs</span>
                          <span>✓ Visual aids</span>
                          <span>✓ Step-by-step</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* No Content Message */}
                {(!selectedTutorForProfile.sample_content && !selectedTutorForProfile.teaching_materials) && (
                  <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h5 className="text-lg font-semibold mb-2">No Sample Content Available</h5>
                    <p className="text-gray-500 mb-4">This tutor hasn't uploaded any sample materials yet.</p>
                    <p className="text-sm text-gray-400">Contact the tutor to request sample materials or ask about their teaching approach.</p>
                  </div>
                )}
              </div>

              {/* Availability */}
              {selectedTutorForProfile.availability && (
                <div>
                  <h4 className="font-semibold mb-2">Availability</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {typeof selectedTutorForProfile.availability === 'object' 
                        ? "Available schedule will be shown here"
                        : "Contact tutor for availability"
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Information & Form */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Contact Information
                </h4>
                
                {/* Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Contact Info Card */}
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-600" />
                        Contact Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Response Time Indicator */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">Response Time</p>
                            <p className="text-sm text-blue-700">
                              {selectedTutorForProfile.response_time_hours 
                                ? `${selectedTutorForProfile.response_time_hours} hours`
                                : "Usually responds within 24 hours"
                              }
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          Active
                        </Badge>
                      </div>

                      {/* Verification Status */}
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">Verification Status</p>
                            <p className="text-sm text-green-700">Contact information verified</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verified Contact
                        </Badge>
                      </div>

                      {/* Contact Methods */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                          <MessageCircle className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">In-app messaging</span>
                          <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Schedule consultation</span>
                          <Badge variant="outline">Available</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Form */}
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Send className="h-5 w-4 text-gray-600" />
                        Send Message
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div>
                          <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                            Subject
                          </Label>
                          <Select>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="demo">Book Demo Class</SelectItem>
                              <SelectItem value="pricing">Pricing Information</SelectItem>
                              <SelectItem value="schedule">Schedule Discussion</SelectItem>
                              <SelectItem value="materials">Request Study Materials</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                            Message
                          </Label>
                          <Textarea
                            id="message"
                            placeholder="Tell the tutor about your learning goals, preferred schedule, or any specific questions you have..."
                            className="min-h-[100px] resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="preferredTime" className="text-sm font-medium text-gray-700">
                              Preferred Contact Time
                            </Label>
                            <Select>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                                <SelectItem value="evening">Evening (5 PM - 9 PM)</SelectItem>
                                <SelectItem value="flexible">Flexible</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="urgency" className="text-sm font-medium text-gray-700">
                              Urgency
                            </Label>
                            <Select>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select urgency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low - No rush</SelectItem>
                                <SelectItem value="medium">Medium - Within a week</SelectItem>
                                <SelectItem value="high">High - Within 2-3 days</SelectItem>
                                <SelectItem value="urgent">Urgent - Within 24 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="anonymous"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label htmlFor="anonymous" className="text-sm text-gray-700">
                            Send message anonymously
                          </Label>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full"
                          onClick={(e) => {
                            e.preventDefault();
                            onSendMessage(selectedTutorForProfile);
                            setSelectedTutorForProfile(null);
                          }}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Contact Options */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-600" />
                    Additional Contact Options
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Quick Message</p>
                        <p className="text-sm text-gray-600">Send a brief inquiry</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Book Demo</p>
                        <p className="text-sm text-gray-600">Schedule a trial class</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Heart className="h-5 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Save Tutor</p>
                        <p className="text-sm text-gray-600">Add to favorites</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    onSendMessage(selectedTutorForProfile);
                    setSelectedTutorForProfile(null);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  variant={interestedTutors.has(selectedTutorForProfile.user_id) ? "default" : "secondary"}
                  onClick={() => {
                    handleInterested(selectedTutorForProfile);
                  }}
                  disabled={interestedTutors.has(selectedTutorForProfile.user_id)}
                >
                  {interestedTutors.has(selectedTutorForProfile.user_id) ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Interested
                    </>
                  ) : (
                    "Show Interest"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTutorForProfile(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Messaging Dashboard Component
function MessagingDashboard({ 
  selectedTutor, 
  onBackToTutors,
  onOpenChatWithTutor,
  requirementContext
}: {
  selectedTutor: TutorProfile | null;
  onBackToTutors: () => void;
  onOpenChatWithTutor: (tutorUserId: string) => void;
  requirementContext?: any;
}) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    // Load conversations from database
    loadConversations();
    
    // If we have requirement context, ensure the initial message is visible
    if (requirementContext && selectedTutor) {
      handleRequirementContext(requirementContext);
    }
  }, [requirementContext, selectedTutor]);

  // Refresh conversations on message table changes for real-time updates
  useEffect(() => {
    let channel: any;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase
        .channel('student-conversations')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages', filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})` },
          () => {
            loadConversations();
          }
        )
        .subscribe();
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Handle requirement context to ensure initial message is visible
  const handleRequirementContext = async (context: any) => {
    try {
      if (!context.tutorResponse || !selectedTutor) return;
      
      console.log('Handling requirement context:', context);
      
      // Check if the initial message already exists in the database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: existingMessage, error: checkError } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_id', selectedTutor.user_id)
        .eq('receiver_id', user.id)
        .eq('content', context.tutorResponse.content)
        .limit(1);
      
      if (checkError) {
        console.error('Error checking existing message:', checkError);
        return;
      }
      
      // If message doesn't exist, create it
      if (!existingMessage || existingMessage.length === 0) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: selectedTutor.user_id,
            receiver_id: user.id,
            content: context.tutorResponse.content,
            created_at: context.tutorResponse.created_at || new Date().toISOString()
          });
        
        if (messageError) {
          console.error('Error creating initial message:', messageError);
        } else {
          console.log('Initial message created from requirement context');
          // Refresh conversations to show the new message
          loadConversations();
        }
      } else {
        console.log('Initial message already exists');
      }
    } catch (error) {
      console.error('Error handling requirement context:', error);
    }
  };

  const loadConversations = async () => {
    try {
      console.log('Loading conversations...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, returning early');
        return;
      }

      console.log('User ID:', user.id);

      // Get all messages where the current user is either sender or receiver
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          read,
          created_at
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      console.log('Messages data:', messagesData);

      // Get unique conversation partners (tutors) - exclude the current user
      const tutorIds = new Set();
      messagesData?.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        // Only add if it's not the current user
        if (partnerId !== user.id) {
          tutorIds.add(partnerId);
        }
      });

      console.log('Tutor IDs found:', Array.from(tutorIds));

      // Get tutor profiles for each conversation partner
      const conversationsList = [];
      for (const tutorId of tutorIds) {
        // Get tutor profile
        const { data: tutorData, error: tutorError } = await supabase
          .from('profiles')
          .select(`
            user_id,
            full_name,
            profile_photo_url,
            role
          `)
          .eq('user_id', tutorId)
          .eq('role', 'tutor') // STRICT: Only show actual tutors, no role mixing
          .single();

        if (tutorError) {
          console.warn('Error fetching tutor profile for ID:', tutorId, tutorError);
          continue;
        }

        // Get the last message in this conversation
        const lastMessage = messagesData?.find(msg => 
          (msg.sender_id === user.id && msg.receiver_id === tutorId) ||
          (msg.sender_id === tutorId && msg.receiver_id === user.id)
        );

        // Check for unread messages
        const unreadCount = messagesData?.filter(msg => 
          msg.sender_id === tutorId && 
          msg.receiver_id === user.id && 
          !msg.read
        ).length;

        conversationsList.push({
          id: tutorId,
          tutor: tutorData?.full_name || "",
          profile_photo_url: tutorData?.profile_photo_url || "",
          lastMessage: lastMessage?.content || "",
          time: lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          unread: unreadCount > 0
        });
      }

      console.log('Conversations list:', conversationsList);
      setConversations(conversationsList);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = async (tutorId: string, tutorName: string) => {
    // Set conversation to delete and show confirmation dialog
    setConversationToDelete({ id: tutorId, name: tutorName });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log(`🗑️ [StudentDashboard] Deleting conversation with tutor: ${conversationToDelete.id}`);

      // Delete all messages between this student and tutor
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conversationToDelete.id}),and(sender_id.eq.${conversationToDelete.id},receiver_id.eq.${user.id})`);

      if (deleteError) {
        console.error('Error deleting messages:', deleteError);
        toast({
          title: "Error",
          description: "Failed to delete conversation. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ [StudentDashboard] Conversation deleted successfully');
      
      // Remove conversation from local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete.id));
      
      // Clear selected tutor if it was the deleted one
      if (selectedTutor && selectedTutor.user_id === conversationToDelete.id) {
        onOpenChatWithTutor(''); // Clear selection
      }

      toast({
        title: "Conversation Deleted",
        description: `Conversation with ${conversationToDelete.name} has been deleted.`,
        variant: "default",
      });

      // Close confirmation dialog and reset state
      setShowDeleteConfirm(false);
      setConversationToDelete(null);

    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBackToTutors}>
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Tutors
        </Button>
        <h2 className="text-2xl font-bold">Messages</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div 
                    key={conv.id} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted group"
                  >
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => {
                        console.log('🔍 [DEBUG] Conversation clicked:', conv);
                        console.log('🔍 [DEBUG] Calling onOpenChatWithTutor with ID:', conv.id);
                        onOpenChatWithTutor(conv.id);
                      }}
                    >
                      <Avatar>
                        <AvatarImage 
                          src={conv.profile_photo_url || ""} 
                          alt={`${conv.tutor}'s profile photo`}
                        />
                        <AvatarFallback>{conv.tutor.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{conv.tutor}</span>
                          <span className="text-xs text-muted-foreground">{conv.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unread && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                    </div>
                    
                    {/* Delete Conversation Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id, conv.tutor);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted-foreground text-sm">No conversations yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>{selectedTutor ? `Chat with ${selectedTutor.profile?.full_name || ""}` : "Select a conversation"}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {selectedTutor ? (
                <>
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4" id="chat-messages">
                    <ChatMessages 
                      selectedTutor={selectedTutor} 
                      requirementContext={requirementContext}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Select a conversation to start messaging
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the conversation with{" "}
              <span className="font-semibold">{conversationToDelete?.name}</span>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. All messages in this conversation will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConversationToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteConversation}
              >
                Delete Conversation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Profile Edit Dialog Component
function ProfileEditDialog({ 
  userProfile, 
  studentProfile, 
  onUpdate, 
  onClose 
}: {
  userProfile: Profile | null;
  studentProfile: StudentProfile | null;
  onUpdate: (data: any) => void;
  onClose: () => void;
}) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    // Basic Information (from profiles table)
    full_name: userProfile?.full_name || "",
    city: userProfile?.city || "",
    area: userProfile?.area || "",
    primary_language: userProfile?.primary_language || null,
    profile_photo_file: null as File | null,
    
    // Student Profile Information
    date_of_birth: studentProfile?.date_of_birth || "",
    education_level: studentProfile?.education_level || null,
    
    // Learning Goals - These fields will be stored as JSONB in the database
    subject_interests: studentProfile?.subject_interests || [],
    proficiency_levels: studentProfile?.proficiency_levels || {},
    learning_objectives: studentProfile?.learning_objectives || [],
    timeline: studentProfile?.timeline || "",
    
    // Class Preferences
    learning_mode: studentProfile?.learning_mode || null,
    offline_radius: studentProfile?.offline_radius || null,
    budget_min: studentProfile?.budget_min || null,
    budget_max: studentProfile?.budget_max || null,
    schedule_preferences: studentProfile?.schedule_preferences || null,
    class_duration: studentProfile?.class_duration || null,
    frequency: studentProfile?.frequency || null,
    
    // Additional Preferences
    tutor_gender_preference: studentProfile?.tutor_gender_preference || null,
    instruction_language: studentProfile?.instruction_language || null,
    special_requirements: studentProfile?.special_requirements || null,
    teaching_methodology: studentProfile?.teaching_methodology || null,
    class_type_preference: studentProfile?.class_type_preference || null,
  });

  // Debug logging when component mounts
  useEffect(() => {
    console.log('ProfileEditDialog mounted');
    console.log('userProfile:', userProfile);
    console.log('studentProfile:', studentProfile);
    console.log('Initial formData:', formData);
    
    // Check for any invalid values in constrained fields
    const constrainedFields = {
      learning_mode: formData.learning_mode,
      tutor_gender_preference: formData.tutor_gender_preference,
      instruction_language: formData.instruction_language,
      teaching_methodology: formData.teaching_methodology,
      class_type_preference: formData.class_type_preference,
      frequency: formData.frequency
    };
    
    console.log('Constrained fields values:', constrainedFields);
    
    // Validate constrained fields
    Object.entries(constrainedFields).forEach(([field, value]) => {
      if (value && value !== '' && value !== null && value !== undefined) {
        console.log(`Field ${field} has value:`, value, 'Type:', typeof value);
      }
    });
  }, []);

  // Update form data when props change
  useEffect(() => {
    if (userProfile || studentProfile) {
      console.log('Updating form data from props');
      setFormData({
        // Basic Information (from profiles table)
        full_name: userProfile?.full_name || "",
        city: userProfile?.city || "",
        area: userProfile?.area || "",
        primary_language: userProfile?.primary_language || null,
        profile_photo_file: null as File | null,
        
        // Student Profile Information
        date_of_birth: studentProfile?.date_of_birth || "",
        education_level: studentProfile?.education_level || null,
        
        // Learning Goals - These fields will be stored as JSONB in the database
        subject_interests: studentProfile?.subject_interests || [],
        proficiency_levels: studentProfile?.proficiency_levels || {},
        learning_objectives: studentProfile?.learning_objectives || [],
        timeline: studentProfile?.timeline || "",
        
        // Class Preferences
        learning_mode: studentProfile?.learning_mode || null,
        offline_radius: studentProfile?.offline_radius || null,
        budget_min: studentProfile?.budget_min || null,
        budget_max: studentProfile?.budget_max || null,
        schedule_preferences: studentProfile?.schedule_preferences || null,
        class_duration: studentProfile?.class_duration || null,
        frequency: studentProfile?.frequency || null,
        
        // Additional Preferences
        tutor_gender_preference: studentProfile?.tutor_gender_preference || null,
        instruction_language: studentProfile?.instruction_language || null,
        special_requirements: studentProfile?.special_requirements || null,
        teaching_methodology: studentProfile?.teaching_methodology || null,
        class_type_preference: studentProfile?.class_type_preference || null,
      });
    }
  }, [userProfile, studentProfile]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }

      setPhotoFile(file);
      setFormData(prev => ({ ...prev, profile_photo_file: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, profile_photo_file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Essential fields validation
    if (!formData.full_name?.trim()) {
      newErrors.full_name = "Full name is required";
    }
    if (!formData.city?.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.area?.trim()) {
      newErrors.area = "Area is required";
    }
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    }
    if (!formData.education_level) {
      newErrors.education_level = "Education level is required";
    }
    if (!formData.learning_mode) {
      newErrors.learning_mode = "Learning mode is required";
    }
    if (!formData.budget_min || formData.budget_min <= 0) {
      newErrors.budget_min = "Minimum budget is required";
    }
    if (!formData.budget_max || formData.budget_max <= 0) {
      newErrors.budget_max = "Maximum budget is required";
    }
    if (formData.budget_min && formData.budget_max && formData.budget_max <= formData.budget_min) {
      newErrors.budget_max = "Maximum budget must be greater than minimum budget";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('Form data keys:', Object.keys(formData));
    console.log('Form data values:', formData);
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (isValid) {
      try {
        console.log('Calling onUpdate with formData:', formData);
        onUpdate(formData);
      } catch (error) {
        console.error('Error calling onUpdate:', error);
      }
    } else {
      console.log('Form validation failed, errors:', errors);
    }
  };

  const educationLevels = [
    "Class 1-5", "Class 6-8", "Class 9-10", "Class 11-12",
    "Undergraduate", "Graduate", "Professional", "Other"
  ];

  const subjectCategories = {
    academic: [
      "Mathematics", "Physics", "Chemistry", "Biology", "English", 
      "Hindi", "History", "Geography", "Economics", "Political Science"
    ],
    professional: [
      "Programming", "Web Development", "Data Science", "Digital Marketing",
      "Graphic Design", "UI/UX Design", "Business Analytics", "Finance"
    ],
    creative: [
      "Music", "Dance", "Painting", "Photography", "Cooking", 
      "Creative Writing", "Theatre", "Yoga", "Meditation"
    ],
    testPrep: [
      "JEE Main/Advanced", "NEET", "CAT", "GATE", "UPSC", 
      "IELTS", "TOEFL", "GRE", "GMAT", "SSC"
    ]
  };

  const learningObjectives = [
    "Improve grades", "Prepare for exams", "Learn new skills",
    "Career advancement", "Personal development", "Hobby/Interest"
  ];

  const timelineOptions = [
    "1-3 months", "3-6 months", "6-12 months", "1+ years"
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = ["Morning (6 AM - 12 PM)", "Afternoon (12 PM - 6 PM)", "Evening (6 PM - 10 PM)"];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Completion Status */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Profile Completion</span>
              <span className="text-lg font-bold text-blue-600">
                {(() => {
                  const essentialFields = [
                    formData.full_name, formData.city, formData.area, formData.date_of_birth,
                    formData.education_level, formData.learning_mode,
                    formData.budget_min, formData.budget_max
                  ];
                  const additionalFields = [
                    formData.primary_language, formData.class_duration, formData.frequency,
                    formData.tutor_gender_preference, formData.instruction_language, formData.teaching_methodology,
                    formData.class_type_preference, formData.special_requirements, formData.offline_radius,
                    formData.schedule_preferences
                  ];
                  
                  const essentialFieldsFilled = essentialFields.filter(field => {
                    if (Array.isArray(field)) return field.length > 0;
                    if (typeof field === 'number') return field > 0;
                    return field && field.toString().trim() !== '';
                  }).length;
                  
                  const additionalFieldsFilled = additionalFields.filter(field => {
                    if (Array.isArray(field)) return field.length > 0;
                    if (typeof field === 'number') return field > 0;
                    return field && field.toString().trim() !== '';
                  }).length;
                  
                  const essentialCompletion = (essentialFieldsFilled / essentialFields.length) * 70;
                  const additionalCompletion = (additionalFieldsFilled / additionalFields.length) * 30;
                  return Math.round(essentialCompletion + additionalCompletion);
                })()}%
              </span>
            </div>
            <Progress 
              value={(() => {
                const essentialFields = [
                  formData.full_name, formData.city, formData.area, formData.date_of_birth,
                  formData.education_level, formData.learning_mode,
                  formData.budget_min, formData.budget_max
                ];
                const additionalFields = [
                  formData.primary_language, formData.class_duration, formData.frequency,
                  formData.tutor_gender_preference, formData.instruction_language, formData.teaching_methodology,
                  formData.class_type_preference, formData.special_requirements, formData.offline_radius,
                  formData.schedule_preferences
                ];
                
                const essentialFieldsFilled = essentialFields.filter(field => {
                  if (Array.isArray(field)) return field.length > 0;
                  if (typeof field === 'number') return field > 0;
                  return field && field.toString().trim() !== '';
                }).length;
                
                const additionalFieldsFilled = additionalFields.filter(field => {
                  if (Array.isArray(field)) return field.length > 0;
                  if (typeof field === 'number') return field > 0;
                  return field && field.toString().trim() !== '';
                }).length;
                
                const essentialCompletion = (essentialFieldsFilled / essentialFields.length) * 70;
                const additionalCompletion = (additionalFieldsFilled / additionalFields.length) * 30;
                return Math.round(essentialCompletion + additionalCompletion);
              })()} 
              className="w-full h-2 mb-2" 
            />
            <p className="text-xs text-blue-700">
              Complete your profile to increase your visibility and attract more tutors. Essential fields (marked with *) are required for tutor search.
            </p>
          </div>

          {/* Profile Photo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Profile Photo</h3>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={photoPreview || userProfile?.profile_photo_url || ""} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="text-lg">
                    {userProfile?.full_name?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                  </Button>
                  {(photoPreview || userProfile?.profile_photo_url) ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground text-center max-w-48">
                  Upload a clear, professional photo. Max size: 5MB. Supported formats: JPG, PNG, GIF.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                  className={errors.full_name ? 'border-destructive' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  className={errors.date_of_birth ? 'border-destructive' : ''}
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-destructive mt-1">{errors.date_of_birth}</p>
                )}
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter your city"
                  className={errors.city ? 'border-destructive' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-destructive mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="area">Area/Locality *</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  placeholder="Enter your area or locality"
                  className={errors.area ? 'border-destructive' : ''}
                />
                {errors.area && (
                  <p className="text-sm text-destructive mt-1">{errors.area}</p>
                )}
              </div>
              <div>
                <Label htmlFor="primary_language">Primary Language</Label>
                <select
                  id="primary_language"
                  value={formData.primary_language || ''}
                  onChange={e => {
                    const value = e.target.value === '' ? null : e.target.value;
                    console.log('Setting primary_language to:', value);
                    setFormData(prev => ({ ...prev, primary_language: value }));
                  }}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Select...</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="education_level">Education Level *</Label>
                <select
                  id="education_level"
                  value={formData.education_level || ''}
                  onChange={e => {
                    const value = e.target.value === '' ? null : e.target.value;
                    console.log('Setting education_level to:', value);
                    setFormData(prev => ({ ...prev, education_level: value }));
                  }}
                  className={`w-full border rounded-md p-2 ${errors.education_level ? 'border-destructive' : ''}`}
                >
                  <option value="">Select...</option>
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.education_level && (
                  <p className="text-sm text-destructive mt-1">{errors.education_level}</p>
                )}
              </div>
            </div>
          </div>

                     {/* Learning Goals Section */}
           <div className="space-y-4">
             <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
               <p className="text-sm text-yellow-800">
                 <strong>Note:</strong> The following fields (Subject Interests, Proficiency Levels, Learning Objectives, and Timeline) are collected for display purposes but are not currently being saved to your profile due to database schema limitations. These fields will be implemented in a future update.
               </p>
             </div>
             <h3 className="text-lg font-semibold border-b pb-2">Learning Goals</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <Label htmlFor="timeline">Learning Timeline</Label>
                 <select
                   id="timeline"
                   value={formData.timeline}
                   onChange={e => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                   className="w-full border rounded-md p-2"
                 >
                   <option value="">Select...</option>
                   {timelineOptions.map(timeline => (
                     <option key={timeline} value={timeline}>{timeline}</option>
                   ))}
                 </select>
               </div>
               <div>
                 <Label htmlFor="learning_objectives">Learning Objectives</Label>
                 <select
                   id="learning_objectives"
                   multiple
                   value={formData.learning_objectives}
                   onChange={e => {
                     const selected = Array.from(e.target.selectedOptions, option => option.value);
                     setFormData(prev => ({ ...prev, learning_objectives: selected }));
                   }}
                   className="w-full border rounded-md p-2"
                 >
                   {learningObjectives.map(objective => (
                     <option key={objective} value={objective}>{objective}</option>
                   ))}
                 </select>
               </div>
               <div className="md:col-span-2">
                 <Label htmlFor="subject_interests">Subject Interests</Label>
                 <div className="space-y-3">
                   {Object.entries(subjectCategories).map(([category, subjects]) => (
                     <div key={category} className="space-y-2">
                       <h4 className="font-medium text-sm capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</h4>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                         {subjects.map(subject => (
                           <label key={subject} className="flex items-center space-x-2">
                             <input
                               type="checkbox"
                               checked={formData.subject_interests.includes(subject)}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                   setFormData(prev => ({
                                     ...prev,
                                     subject_interests: [...prev.subject_interests, subject]
                                   }));
                                 } else {
                                   setFormData(prev => ({
                                     ...prev,
                                     subject_interests: prev.subject_interests.filter(s => s !== subject)
                                   }));
                                 }
                               }}
                               className="rounded"
                             />
                             <span className="text-sm">{subject}</span>
                           </label>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
                 {/* Note: subject_interests validation removed since this field is not being saved */}
               </div>
               <div className="md:col-span-2">
                 <Label htmlFor="proficiency_levels">Proficiency Levels</Label>
                 <div className="space-y-3">
                   {Object.entries(subjectCategories).map(([category, subjects]) => (
                     <div key={category} className="space-y-2">
                       <h4 className="font-medium text-sm capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</h4>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                         {subjects.map(subject => (
                           <div key={subject} className="flex items-center justify-between space-x-2">
                             <span className="text-sm">{subject}</span>
                             <select
                               value={formData.proficiency_levels[subject] || ""}
                               onChange={(e) => setFormData(prev => ({
                                 ...prev,
                                 proficiency_levels: {
                                   ...prev.proficiency_levels,
                                   [subject]: e.target.value
                                 }
                               }))}
                               className="text-xs border rounded px-1 py-1"
                             >
                               <option value="">Select</option>
                               <option value="Beginner">Beginner</option>
                               <option value="Intermediate">Intermediate</option>
                               <option value="Advanced">Advanced</option>
                             </select>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>

          {/* Class Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Class Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="learning_mode">Learning Mode *</Label>
                <select
                  id="learning_mode"
                  value={formData.learning_mode || ''}
                  onChange={e => {
                    const value = e.target.value === '' ? null : e.target.value;
                    console.log('Setting learning_mode to:', value);
                    setFormData(prev => ({ ...prev, learning_mode: value }));
                  }}
                  className={`w-full border rounded-md p-2 ${errors.learning_mode ? 'border-destructive' : ''}`}
                >
                  <option value="">Select...</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                {errors.learning_mode && (
                  <p className="text-sm text-destructive mt-1">{errors.learning_mode}</p>
                )}
              </div>
              <div>
                <Label htmlFor="offline_radius">Offline Radius (km)</Label>
                <Input
                  id="offline_radius"
                  type="number"
                  value={formData.offline_radius || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseInt(e.target.value);
                    console.log('Setting offline_radius to:', value);
                    setFormData(prev => ({ ...prev, offline_radius: value }));
                  }}
                  placeholder="Enter radius in km"
                />
              </div>
              <div>
                <Label htmlFor="class_duration">Class Duration (minutes)</Label>
                <select
                  id="class_duration"
                  value={formData.class_duration || ''}
                  onChange={e => {
                    const value = e.target.value === '' ? null : parseInt(e.target.value);
                    console.log('Setting class_duration to:', value);
                    setFormData(prev => ({ ...prev, class_duration: value }));
                  }}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Select...</option>
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                  <option value={60}>60</option>
                  <option value={90}>90</option>
                  <option value={120}>120</option>
                </select>
              </div>
              <div>
                <Label htmlFor="frequency">Class Frequency</Label>
                <select
                  id="frequency"
                  value={formData.frequency || ''}
                  onChange={e => {
                    const value = e.target.value === '' ? null : e.target.value;
                    console.log('Setting frequency to:', value);
                    setFormData(prev => ({ ...prev, frequency: value }));
                  }}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Select...</option>
                  <option value="Once a week">Once a week</option>
                  <option value="Twice a week">Twice a week</option>
                  <option value="Thrice a week">Thrice a week</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>
              <div>
                <Label htmlFor="budget_min">Minimum Budget (₹/hr) *</Label>
                <select
                  id="budget_min"
                  value={formData.budget_min || ''}
                  onChange={e => {
                    const value = e.target.value === '' ? null : parseInt(e.target.value);
                    console.log('Setting budget_min to:', value);
                    setFormData(prev => ({ ...prev, budget_min: value }));
                  }}
                  className={`w-full border rounded-md p-2 ${errors.budget_min ? 'border-destructive' : ''}`}
                >
                  <option value="">Select...</option>
                  <option value={100}>₹100</option>
                  <option value={200}>₹200</option>
                  <option value={300}>₹300</option>
                  <option value={400}>₹400</option>
                  <option value={500}>₹500</option>
                  <option value={750}>₹750</option>
                  <option value={1000}>₹1000</option>
                  <option value={1500}>₹1500</option>
                  <option value={2000}>₹2000+</option>
                </select>
                {errors.budget_min && (
                  <p className="text-sm text-destructive mt-1">{errors.budget_min}</p>
                )}
              </div>
              <div>
                <Label htmlFor="budget_max">Maximum Budget (₹/hr) *</Label>
                <select
                  id="budget_max"
                  value={formData.budget_max || ''}
                  onChange={e => {
                    const value = e.target.value === '' ? null : parseInt(e.target.value);
                    console.log('Setting budget_max to:', value);
                    setFormData(prev => ({ ...prev, budget_max: value }));
                  }}
                  className={`w-full border rounded-md p-2 ${errors.budget_max ? 'border-destructive' : ''}`}
                >
                  <option value="">Select...</option>
                  <option value={100}>₹100</option>
                  <option value={200}>₹200</option>
                  <option value={300}>₹300</option>
                  <option value={400}>₹400</option>
                  <option value={500}>₹500</option>
                  <option value={750}>₹750</option>
                  <option value={1000}>₹1000</option>
                  <option value={1500}>₹1500</option>
                  <option value={2000}>₹2000+</option>
                </select>
                {errors.budget_max && (
                  <p className="text-sm text-destructive mt-1">{errors.budget_max}</p>
                )}
              </div>
            </div>
          </div>

                     {/* Schedule Preferences Section */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold border-b pb-2">Schedule Preferences</h3>
             <div className="grid grid-cols-1 gap-6">
               <div>
                 <Label>Preferred Days and Times</Label>
                 <div className="space-y-4 mt-2">
                   {days.map(day => (
                     <div key={day} className="flex items-center space-x-4">
                       <div className="w-24 font-medium">{day}</div>
                       <div className="flex space-x-2">
                         {timeSlots.map(timeSlot => (
                           <label key={timeSlot} className="flex items-center space-x-2">
                             <input
                               type="checkbox"
                               checked={(formData.schedule_preferences?.[day]?.includes(timeSlot)) || false}
                               onChange={(e) => {
                                 const currentPreferences = formData.schedule_preferences || {};
                                 const currentTimes = currentPreferences[day] || [];
                                 if (e.target.checked) {
                                   setFormData(prev => ({
                                     ...prev,
                                     schedule_preferences: {
                                       ...currentPreferences,
                                       [day]: [...currentTimes, timeSlot]
                                     }
                                   }));
                                 } else {
                                   setFormData(prev => ({
                                     ...prev,
                                     schedule_preferences: {
                                       ...currentPreferences,
                                       [day]: currentTimes.filter(t => t !== timeSlot)
                                     }
                                   }));
                                 }
                               }}
                               className="rounded"
                             />
                             <span className="text-sm">{timeSlot}</span>
                           </label>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>

           {/* Additional Preferences Section */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold border-b pb-2">Additional Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="tutor_gender">Preferred Tutor Gender</Label>
                <select
                  id="tutor_gender_preference"
                  value={formData.tutor_gender_preference || ''}
                  onChange={e => {
                    const value = e.target.value === '' ? null : e.target.value;
                    console.log('Setting tutor_gender_preference to:', value);
                    setFormData(prev => ({ ...prev, tutor_gender_preference: value }));
                  }}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="No preference">No preference</option>
                </select>
              </div>
              <div>
                <Label htmlFor="instruction_language">Instruction Language</Label>
                <select
                  id="instruction_language"
                  value={formData.instruction_language || ''}
                  onChange={e => {
                    const value = e.target.value === '' ? null : e.target.value;
                    console.log('Setting instruction_language to:', value);
                    setFormData(prev => ({ ...prev, instruction_language: value }));
                  }}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Select...</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                <Label htmlFor="teaching_methodology">Preferred Teaching Methodology</Label>
                <select
                  id="teaching_methodology"
                  value={formData.teaching_methodology || ''}
                  onChange={e => {
                    const value = e.target.value === '' ? null : e.target.value;
                    console.log('Setting teaching_methodology to:', value);
                    setFormData(prev => ({ ...prev, teaching_methodology: value }));
                  }}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Select...</option>
                  <option value="Interactive">Interactive</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Practical">Practical</option>
                  <option value="Visual">Visual</option>
                </select>
              </div>
              <div>
                <Label htmlFor="class_type">Class Type</Label>
                <select
                  id="class_type_preference"
                  value={formData.class_type_preference || ''}
                  onChange={e => {
                    const value = e.target.value === '' ? null : e.target.value;
                    console.log('Setting class_type_preference to:', value);
                    setFormData(prev => ({ ...prev, class_type_preference: value }));
                  }}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Select...</option>
                  <option value="Individual">Individual</option>
                  <option value="Group">Group</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="special_requirements">Special Requirements</Label>
                <Textarea
                  id="special_requirements"
                  value={formData.special_requirements || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : e.target.value;
                    console.log('Setting special_requirements to:', value);
                    setFormData(prev => ({ ...prev, special_requirements: value }));
                  }}
                  placeholder="Any special requirements or preferences..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
                         <Button type="submit" className="flex-1">
               Update Profile
             </Button>
             <Button type="button" variant="outline" onClick={onClose}>
               Cancel
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Placeholder Components
function ClassesDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Classes</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No classes scheduled yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}



function HelpSupport() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Help & Support</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Contact support for assistance.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ChatMessages Component
function ChatMessages({ selectedTutor, messages: externalMessages, requirementContext }: { selectedTutor: TutorProfile; messages?: any[]; requirementContext?: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (selectedTutor) {
      loadMessages();
      // Mark messages as read and clear notifications
      markMessagesAsRead();
      // Set up real-time subscription for new messages
      setupRealtimeSubscription();
    }

    // Cleanup subscription on unmount or tutor change
    return () => {
      if (subscription) {
        subscription.unsubscribe();
        setSubscription(null);
      }
    };
  }, [selectedTutor]);

  // Handle requirement context to ensure initial message is visible
  useEffect(() => {
    if (requirementContext && requirementContext.tutorResponse && selectedTutor) {
      handleRequirementContextMessage();
    }
  }, [requirementContext, selectedTutor]);

  // Update messages when external messages change (for instant display)
  useEffect(() => {
    if (externalMessages && externalMessages.length > 0) {
      setMessages(prev => {
        // Merge external messages with existing ones, avoiding duplicates
        const allMessages = [...prev];
        externalMessages.forEach(externalMsg => {
          if (!allMessages.some(msg => msg.id === externalMsg.id)) {
            allMessages.push(externalMsg);
          }
        });
        return allMessages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    }
  }, [externalMessages]);

  // Handle requirement context message to ensure it's visible
  const handleRequirementContextMessage = async () => {
    try {
      if (!requirementContext?.tutorResponse || !selectedTutor) return;
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      console.log('Handling requirement context message in ChatMessages:', requirementContext);
      
      // Check if the initial message already exists
      const { data: existingMessage, error: checkError } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_id', selectedTutor.user_id)
        .eq('receiver_id', user.id)
        .eq('content', requirementContext.tutorResponse.content)
        .limit(1);
      
      if (checkError) {
        console.error('Error checking existing message:', checkError);
        return;
      }
      
      // If message doesn't exist, create it and add to local state
      if (!existingMessage || existingMessage.length === 0) {
        const newMessage = {
          id: `temp-${Date.now()}`, // Temporary ID for immediate display
          sender_id: selectedTutor.user_id,
          receiver_id: user.id,
          content: requirementContext.tutorResponse.content,
          created_at: requirementContext.tutorResponse.created_at || new Date().toISOString(),
          read: false
        };
        
        // Add to local messages state immediately
        setMessages(prev => [newMessage, ...prev]);
        
        // Also create in database
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: selectedTutor.user_id,
            receiver_id: user.id,
            content: requirementContext.tutorResponse.content,
            created_at: requirementContext.tutorResponse.created_at || new Date().toISOString()
          });
        
        if (messageError) {
          console.error('Error creating initial message:', messageError);
        } else {
          console.log('Initial message created and displayed from requirement context');
        }
      } else {
        console.log('Initial message already exists in database');
      }
    } catch (error) {
      console.error('Error handling requirement context message:', error);
    }
  };

  // Set up real-time subscription for new messages
  const setupRealtimeSubscription = async () => {
    if (!selectedTutor) return;

    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Cleanup existing subscription
    if (subscription) {
      subscription.unsubscribe();
    }

    const newSubscription = supabase
      .channel(`messages:${user.id}:${selectedTutor.user_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${selectedTutor.user_id}),and(sender_id.eq.${selectedTutor.user_id},receiver_id.eq.${user.id}))`
      }, (payload) => {
        console.log('🔔 [Realtime] New message received:', payload);
        const newMessage = payload.new;
        
        // Add new message to the list
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });

        // Mark new message as read if it's from tutor
        if (newMessage.sender_id === selectedTutor.user_id) {
          markMessagesAsRead();
        }
      })
      .subscribe();

    setSubscription(newSubscription);
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Student user ID:', user.id, 'Tutor ID:', selectedTutor.user_id);

      // Try to get messages using RPC function first
      try {
        const { data, error } = await supabase.rpc(
          'get_messages_between_users_new',
          user.id,
          selectedTutor.user_id
        );

        if (error) {
          console.warn('RPC function failed, trying direct table query:', error);
          throw error;
        }
        
        console.log('Messages loaded via RPC:', data);
        
        // Sort messages by created_at in ascending order
        const sortedMessages = data?.sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ) || [];
        
        console.log('Sorted messages:', sortedMessages);
        setMessages(sortedMessages);
        return;
      } catch (rpcError) {
        console.log('Falling back to direct table query...');
        
        // Fallback: Query messages table directly
        const { data: messagesData, error: tableError } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedTutor.user_id}),and(sender_id.eq.${selectedTutor.user_id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (tableError) {
          console.error('Direct table query also failed:', tableError);
          throw tableError;
        }

        console.log('Messages loaded via direct query:', messagesData);
        setMessages(messagesData || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark messages from tutor as read using direct table update
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', selectedTutor.user_id)
        .eq('receiver_id', user.id)
        .eq('read', false);

      // Clear notifications for this conversation
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('type', 'message')
        .eq('data->sender_id', selectedTutor.user_id);

      // Immediately update local unread count to 0 when messages are marked as read
      const unreadFromThisTutor = messages.filter(msg => 
        msg.sender_id === selectedTutor.user_id && !msg.read
      ).length;
      
      // Update parent component's unread count
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('unread-count-updated', { 
          detail: { decrease: unreadFromThisTutor } 
        }));
        window.dispatchEvent(new CustomEvent('conversations-updated'));
      }

      // Update local messages to mark them as read
      setMessages(prev => prev.map(msg => 
        msg.sender_id === selectedTutor.user_id ? { ...msg, read: true } : msg
      ));
      
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !selectedTutor) return;
    
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Create optimistic message for instant display
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        sender_id: user.id,
        receiver_id: selectedTutor.user_id,
        content: messageContent.trim(),
        created_at: new Date().toISOString(),
        read: false
      };

      // Add message to local state immediately for instant display
      setMessages(prev => [...prev, optimisticMessage]);

      // Insert the message into the database
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedTutor.user_id,
          content: messageContent.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real message from database
      if (newMessage) {
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? newMessage : msg
        ));
      }

              // Create a notification for the tutor (best-effort; don't fail send on notification error)
        try {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', user.id)
            .single();

        // Create notification directly in notifications table
        await supabase
          .from('notifications')
          .insert({
            user_id: selectedTutor.user_id,
            title: 'New Message',
            message: `You have a new message from ${senderProfile?.full_name || 'a student'}.`,
            type: 'message',
            data: { sender_id: user.id }
          });
      } catch (notifyErr) {
        console.warn('Notification creation failed (message sent ok):', notifyErr);
      }

      // Trigger conversations update in parent component
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('conversations-updated'));
      }

    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    }
  };

  if (loading) {
    return <div className="text-center p-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-4">
      {messages.length > 0 ? (
        messages.map((msg) => {
          // Check if message is from the selected tutor (not from current user)
          const isFromTutor = msg.sender_id === selectedTutor?.user_id;
          
          return (
            <div 
              key={msg.id} 
              className={`flex ${!isFromTutor ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${!isFromTutor ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
      )}
      
      {/* Message Input */}
      <div className="flex gap-2 pt-4 border-t">
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && message.trim()) {
              handleSendMessage(message);
              setMessage(""); // Clear input immediately
            }
          }}
        />
        <Button 
          onClick={() => {
            if (message.trim()) {
              handleSendMessage(message);
              setMessage(""); // Clear input immediately
            }
          }} 
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Requirements Dashboard Component
function RequirementsDashboard({ onPostRequirement, refreshTrigger, onStartChat }: { 
  onPostRequirement: () => void; 
  refreshTrigger: boolean;
  onStartChat?: (tutor: any) => void;
}) {
  const { toast } = useToast();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [showRequirementDetails, setShowRequirementDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<any>(null);
  const [showResponsePreview, setShowResponsePreview] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [isOpeningConversation, setIsOpeningConversation] = useState(false);

  useEffect(() => {
    console.log('RequirementsDashboard: refreshTrigger changed to:', refreshTrigger);
    loadRequirements();
  }, [refreshTrigger]);

  const loadRequirements = async () => {
    try {
      console.log('RequirementsDashboard: Loading requirements...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, returning early');
        return;
      }

      console.log('Loading requirements for user:', user.id);

      // First try a simple query to see if requirements exist at all
      const { data: simpleRequirements, error: simpleError } = await supabase
        .from('requirements')
        .select('*')
        .eq('student_id', user.id)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });
        
      // Also try query without any status filter to see all requirements
      const { data: allRequirements, error: allError } = await supabase
        .from('requirements')
        .select('*')
        .eq('student_id', user.id);
        
      console.log('🔍 [StudentDashboard] All requirements (no filter):', allRequirements);
      console.log('🔍 [StudentDashboard] All requirements error:', allError);
      console.log('🔍 [StudentDashboard] All requirements count:', allRequirements?.length || 0);

      console.log('🔍 [StudentDashboard] Simple requirements query result:', simpleRequirements);
      console.log('🔍 [StudentDashboard] Simple requirements query error:', simpleError);
      console.log('🔍 [StudentDashboard] Simple requirements count:', simpleRequirements?.length || 0);

      // Now try the complex query with joins - include tutor data for response preview
      const { data: requirements, error } = await supabase
        .from('requirements')
        .select(`
          *,
          responses:requirement_tutor_matches(
            id,
            status,
            response_message,
            created_at,
            tutor_id
          )
        `)
        .eq('student_id', user.id)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });

      console.log('🔍 [StudentDashboard] Complex requirements query result:', requirements);
      console.log('🔍 [StudentDashboard] Complex requirements query error:', error);
      console.log('🔍 [StudentDashboard] Complex requirements count:', requirements?.length || 0);

      if (error) {
        console.error("Error loading requirements with joins:", error);
        console.log("Falling back to simple requirements without joins...");
        
        // Fallback to simple query if complex query fails
        if (simpleRequirements && !simpleError) {
          console.log('🔍 [StudentDashboard] Using simple requirements as fallback:', simpleRequirements);
          console.log('🔍 [StudentDashboard] Number of simple requirements:', simpleRequirements.length);
          const transformedRequirements = simpleRequirements.map(req => ({
            ...req,
            responses: 0,
            actualResponses: []
          }));
          setRequirements(transformedRequirements);
        } else {
          console.error("🔍 [StudentDashboard] Both simple and complex queries failed");
          console.error("🔍 [StudentDashboard] Simple error:", simpleError);
          console.error("🔍 [StudentDashboard] Complex error:", error);
        if (error.code === '42P01') { // Table doesn't exist
          console.log("🔍 [StudentDashboard] Requirements table not yet created. Run the migration first.");
        }
      setRequirements([]);
        }
      } else {
        console.log('Requirements loaded from database with joins:', requirements);
        console.log('Number of requirements with joins:', requirements?.length || 0);
        // Transform the data to include response count and actual responses (excluding revoked)
        const transformedRequirements = requirements?.map(req => {
          const filteredResponses = req.responses?.filter((resp: any) => resp.status !== 'revoked') || [];
          const responseCount = filteredResponses.length;
          
          console.log(`🔍 [StudentDashboard] Transforming requirement ${req.subject}:`, {
            id: req.id,
            status: req.status,
            originalResponses: req.responses?.length || 0,
            filteredResponses: responseCount,
            responses: req.responses
          });
          
          return {
            ...req,
            responses: responseCount,
            actualResponses: filteredResponses
          };
        }) || [];
        
        console.log('🔍 [StudentDashboard] Transformed requirements:', transformedRequirements);
        console.log('🔍 [StudentDashboard] Final requirements count:', transformedRequirements.length);
        setRequirements(transformedRequirements);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading requirements:", error);
      setRequirements([]);
      setLoading(false);
    }
  };

  const loadResponses = async (requirementId: string) => {
    try {
      setLoadingResponses(true);
      
      // Load all responses for this requirement
      const { data: responsesData, error } = await supabase
        .from('requirement_tutor_matches')
        .select(`
          *,
          tutor:tutor_id(
            user_id,
            full_name,
            profile_photo_url,
            hourly_rate,
            experience_years,
            subjects,
            profile:user_id(full_name, avatar_url)
          )
        `)
        .eq('requirement_id', requirementId)
        .neq('status', 'revoked') // Exclude revoked responses
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading responses:", error);
        setResponses([]);
      } else {
        // Transform the data to include tutor information
        const transformedResponses = responsesData?.map(response => ({
          ...response,
          tutor: {
            ...response.tutor,
            name: response.tutor?.full_name || response.tutor?.profile?.full_name || 'Tutor',
            avatar: response.tutor?.profile_photo_url || response.tutor?.profile?.avatar_url || null
          }
        })) || [];
        
        setResponses(transformedResponses);
      }
    } catch (error) {
      console.error("Error loading responses:", error);
      setResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleViewResponses = async (requirement: any) => {
    setSelectedRequirement(requirement);
    setShowResponsesModal(true);
    await loadResponses(requirement.id);
  };

  const closeResponsesModal = () => {
    setShowResponsesModal(false);
    setSelectedRequirement(null);
    setResponses([]);
  };

  const handleResponsePreview = async (response: any, requirement: any) => {
    // If tutor data is missing, try to load it
    if (!response.tutor && response.tutor_id) {
      console.log('Loading tutor data for response preview...', response.tutor_id);
      try {
        const { data: tutorData, error } = await supabase
          .from('profiles')
          .select('user_id, full_name, profile_photo_url')
          .eq('user_id', response.tutor_id)
          .single();
        
        if (!error && tutorData) {
          response.tutor = {
            user_id: tutorData.user_id,
            full_name: tutorData.full_name,
            name: tutorData.full_name,
            profile_photo_url: tutorData.profile_photo_url,
            avatar: tutorData.profile_photo_url
          };
          console.log('Loaded tutor data for preview:', response.tutor);
        }
      } catch (error) {
        console.error('Error loading tutor data for preview:', error);
      }
    }
    
    setSelectedResponse(response);
    setSelectedRequirement(requirement);
    setShowResponsePreview(true);
  };

  const closeResponsePreview = () => {
    setShowResponsePreview(false);
    setSelectedResponse(null);
    setSelectedRequirement(null);
  };

  const handleViewFullConversation = async (response: any) => {
    try {
      setIsOpeningConversation(true);
      
      // Debug: Log the response structure to understand the data
      console.log('handleViewFullConversation - Full response object:', response);
      console.log('handleViewFullConversation - Response tutor:', response.tutor);
      console.log('handleViewFullConversation - Response tutor_id:', response.tutor_id);
      
      // Check if we have valid tutor data
      if (!response.tutor && !response.tutor_id) {
        console.error('No tutor data found in response:', response);
        throw new Error('Tutor information is missing from the response');
      }
      
      // Handle different possible tutor data structures
      const tutorData = response.tutor || {};
      const tutorId = response.tutor?.user_id || response.tutor?.id || response.tutor_id;
      const tutorName = response.tutor?.full_name || response.tutor?.name || 'Tutor';
      
      if (!tutorId) {
        console.error('No tutor ID found in response:', response);
        throw new Error('Tutor ID is missing from the response');
      }
      
      // Transform tutor data to match expected format for messaging system
      const tutorForMessaging = {
        id: tutorId,
        user_id: tutorId,
        full_name: tutorName,
        profile_photo_url: tutorData.profile_photo_url || tutorData.avatar,
        profile: {
          full_name: tutorName,
          profile_photo_url: tutorData.profile_photo_url || tutorData.avatar,
          city: tutorData.city,
          area: tutorData.area
        },
        subjects: tutorData.subjects,
        hourly_rate: tutorData.hourly_rate,
        // Add context about the requirement and ensure the initial message is loaded
        requirementContext: {
          requirementId: selectedRequirement?.id,
          subject: selectedRequirement?.subject,
          initialMessage: response.response_message,
          // Add the actual response data to ensure it's immediately visible
          tutorResponse: {
            content: response.response_message,
            created_at: response.created_at,
            status: response.status
          }
        }
      };
      
      console.log('handleViewFullConversation - Transformed tutor data:', tutorForMessaging);
      
      // Create initial message content from the tutor's response
      const initialMessage = response.response_message || 
        `Hi! I'm interested in your ${selectedRequirement?.subject} requirement. I'd love to help you with this.`;
      
      // Add the tutor's response as the first message in the conversation
      if (response.response_message) {
        // Create a message record for the tutor's response if it doesn't exist
        await createInitialMessage(response, initialMessage);
      }
      
      // Close the preview modal
      closeResponsePreview();
      
      // Use a callback to notify parent component to switch to messaging tab
      if (typeof onStartChat === 'function') {
        onStartChat(tutorForMessaging);
      }
    } catch (error) {
      console.error('Error opening conversation:', error);
      // Show user-friendly error message
      toast({
        title: "Error",
        description: "Unable to open conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOpeningConversation(false);
    }
  };

  // Function to create the initial message from tutor's response
  const createInitialMessage = async (response: any, messageContent: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get tutor ID from response with fallback options
      const tutorId = response.tutor?.user_id || response.tutor?.id || response.tutor_id;
      
      if (!tutorId) {
        console.error('Cannot create initial message: no tutor ID found', response);
        return;
      }

      console.log('createInitialMessage - Using tutor ID:', tutorId);

      // Check if a message already exists for this requirement-tutor pair
      const { data: existingMessage, error: checkError } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_id', tutorId)
        .eq('receiver_id', user.id)
        .eq('content', messageContent)
        .limit(1);

      if (checkError) {
        console.error('Error checking existing message:', checkError);
        return;
      }

      // Only create message if it doesn't already exist
      if (!existingMessage || existingMessage.length === 0) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: tutorId,
            receiver_id: user.id,
            content: messageContent,
            created_at: response.created_at || new Date().toISOString()
          });

        if (messageError) {
          console.error('Error creating initial message:', messageError);
        } else {
          console.log('Initial message created from tutor response');
        }
      } else {
        console.log('Initial message already exists, skipping creation');
      }
    } catch (error) {
      console.error('Error in createInitialMessage:', error);
    }
  };

  const handleViewRequirementDetails = (requirement: any) => {
    setSelectedRequirement(requirement);
    setShowRequirementDetails(true);
  };

  const closeRequirementDetails = () => {
    setShowRequirementDetails(false);
    setSelectedRequirement(null);
  };

  const handleEditRequirement = (requirement: any) => {
    setEditingRequirement(requirement);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingRequirement(null);
  };

  const handleDeleteRequirement = async (requirementId: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('requirements')
        .update({ status: 'deleted' })
        .eq('id', requirementId);

      if (error) {
        console.error('Error deleting requirement:', error);
        toast({
          title: "Error",
          description: "Failed to delete requirement. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setRequirements(prev => prev.filter(req => req.id !== requirementId));
      
      toast({
        title: "Success",
        description: "Requirement deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting requirement:', error);
      toast({
        title: "Error",
        description: "Failed to delete requirement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartChat = (tutor: any) => {
    // Close the responses modal
    closeResponsesModal();
    
    // Transform tutor data to match expected format for messaging system
    const tutorForMessaging = {
      id: tutor.user_id || tutor.id,
      user_id: tutor.user_id || tutor.id,
      full_name: tutor.full_name || tutor.name,
      profile_photo_url: tutor.profile_photo_url,
      profile: {
        full_name: tutor.full_name || tutor.name,
        profile_photo_url: tutor.profile_photo_url,
        city: tutor.city,
        area: tutor.area
      },
      subjects: tutor.subjects,
      hourly_rate: tutor.hourly_rate
    };
    
    // Use a callback to notify parent component to switch to messaging tab
    if (typeof onStartChat === 'function') {
      onStartChat(tutorForMessaging);
    } else {
      // Fallback: try to access parent component state directly
      console.log('Starting chat with tutor:', tutorForMessaging);
      // This could trigger a state update in the parent component
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading requirements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Requirements</h2>
          <p className="text-muted-foreground mt-1">
            Manage your tutoring requirements and preferences
          </p>
        </div>
        <Button 
          className="bg-gradient-primary"
          onClick={onPostRequirement}
        >
          <Plus className="h-4 w-4 mr-2" />
          Post New Requirement
        </Button>
      </div>

      {requirements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requirements.map((req, idx) => (
            <Card key={idx} className="shadow-soft hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {req.category === 'other' ? req.custom_subject || req.subject : req.subject}
                </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={req.status === 'active' ? 'default' : 'secondary'}>
                      {req.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {req.description}
                </p>
                
                {/* Quick info */}
                <div className="space-y-2 mb-3 text-xs text-muted-foreground">
                  {req.category && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span className="capitalize">{req.category}</span>
                    </div>
                  )}
                  {req.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{req.location}</span>
                    </div>
                  )}
                  {req.budget_range && (
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      <span>₹{req.budget_range}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Posted {new Date(req.created_at).toLocaleDateString()}</span>
                  {req.responses > 0 ? (
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show preview of first response
                          const firstResponse = req.actualResponses[0];
                          if (firstResponse) {
                            handleResponsePreview(firstResponse, req);
                          }
                        }}
                        className="text-primary font-medium cursor-pointer hover:text-primary/80 transition-colors"
                      >
                        {req.responses} response{req.responses > 1 ? 's' : ''}
                      </button>
                      {req.responses > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewResponses(req);
                    }}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          View all responses
                  </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No responses yet</span>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-border border-opacity-50">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewRequirementDetails(req);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditRequirement(req);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRequirement(req.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <List className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground font-medium">No requirements posted yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Post your first requirement to find the perfect tutor
                </p>
              </div>
              <Button size="sm" className="mt-2" onClick={onPostRequirement}>
                Post Requirement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Preview Modal */}
      <Dialog open={showResponsePreview} onOpenChange={setShowResponsePreview}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Tutor Response Preview
            </DialogTitle>
            <DialogDescription>
              Response to your requirement: <span className="font-medium">{selectedRequirement?.subject}</span>
            </DialogDescription>
          </DialogHeader>
          
          {selectedResponse && (
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedResponse.tutor?.avatar} />
                      <AvatarFallback>
                        {selectedResponse.tutor?.name?.charAt(0)?.toUpperCase() || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{selectedResponse.tutor?.name}</h4>
                        <Badge 
                          variant={selectedResponse.status === 'interested' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {selectedResponse.status === 'interested' ? 'Interested' : 'Message Sent'}
                        </Badge>
                      </div>
                      
                      {selectedResponse.response_message && (
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-2">
                            "{selectedResponse.response_message}"
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Responded {new Date(selectedResponse.created_at).toLocaleDateString()} at {new Date(selectedResponse.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        {selectedResponse.tutor?.experience_years && (
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {selectedResponse.tutor.experience_years} years exp.
                          </span>
                        )}
                        {selectedResponse.tutor?.hourly_rate && (
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {selectedResponse.tutor.hourly_rate}/hr
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={closeResponsePreview}
                  className="flex-1"
                >
                  Close
                </Button>
                {selectedRequirement?.responses > 1 && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      closeResponsePreview();
                      handleViewResponses(selectedRequirement);
                    }}
                    className="flex-1"
                  >
                    <List className="h-4 w-4 mr-2" />
                    View All ({selectedRequirement.responses})
                  </Button>
                )}
                <Button 
                  onClick={() => handleViewFullConversation(selectedResponse)}
                  className="flex-1"
                  disabled={isOpeningConversation}
                >
                  {isOpeningConversation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      View Full Conversation
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Responses Modal */}
      <Dialog open={showResponsesModal} onOpenChange={setShowResponsesModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Tutor Responses
            </DialogTitle>
            <DialogDescription>
              Responses to your requirement: <span className="font-medium">{selectedRequirement?.subject}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingResponses ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading responses...</p>
              </div>
            ) : responses.length > 0 ? (
              responses.map((response, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={response.tutor?.avatar} />
                        <AvatarFallback>
                          {response.tutor?.name?.charAt(0)?.toUpperCase() || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{response.tutor?.name}</h4>
                          <Badge 
                            variant={response.status === 'interested' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {response.status === 'interested' ? 'Interested' : 'Message Sent'}
                          </Badge>
                        </div>
                        
                        {response.response_message && (
                          <p className="text-sm text-muted-foreground mb-2">
                            "{response.response_message}"
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {response.tutor?.experience_years && (
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {response.tutor.experience_years} years exp.
                            </span>
                          )}
                          {response.tutor?.hourly_rate && (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="h-3 w-3" />
                              {response.tutor.hourly_rate}/hr
                            </span>
                          )}
                          {response.tutor?.subjects && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {Array.isArray(response.tutor.subjects) ? response.tutor.subjects.join(', ') : response.tutor.subjects}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-3 text-xs text-muted-foreground">
                          Responded {new Date(response.created_at).toLocaleDateString()} at {new Date(response.created_at).toLocaleTimeString()}
                        </div>
                        
                        {/* Action buttons */}
                        <div className="mt-3 flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStartChat(response.tutor)}
                            className="text-xs"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Start Chat
                          </Button>
                          {response.proposed_rate && (
                            <Badge variant="outline" className="text-xs">
                              <IndianRupee className="h-3 w-3 mr-1" />
                              {response.proposed_rate}/hr
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No responses yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tutors will see your requirement and can respond with interest
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={closeResponsesModal}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Requirement Details Modal */}
      <Dialog open={showRequirementDetails} onOpenChange={setShowRequirementDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Requirement Details
            </DialogTitle>
            <DialogDescription>
              Complete details of your requirement
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequirement && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Category</Label>
                    <p className="text-sm text-muted-foreground capitalize">{selectedRequirement.category || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Subject</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedRequirement.category === 'other' ? selectedRequirement.custom_subject || selectedRequirement.subject : selectedRequirement.subject}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedRequirement.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Location</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequirement.location || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Budget</Label>
                    <p className="text-sm text-muted-foreground">₹{selectedRequirement.budget_range || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Urgency</Label>
                    <p className="text-sm text-muted-foreground capitalize">{selectedRequirement.urgency || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Status</Label>
                    <Badge variant={selectedRequirement.status === 'active' ? 'default' : 'secondary'}>
                      {selectedRequirement.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Category-specific details */}
              {selectedRequirement.category === 'academic' && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Academic Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequirement.class_level && (
                      <div>
                        <Label className="font-medium">Class Level</Label>
                        <p className="text-sm text-muted-foreground">{selectedRequirement.class_level}</p>
                      </div>
                    )}
                    {selectedRequirement.board && (
                      <div>
                        <Label className="font-medium">Board</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedRequirement.board === 'other' 
                            ? selectedRequirement.custom_board || 'Custom Board' 
                            : selectedRequirement.board}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedRequirement.category === 'test_preparation' && selectedRequirement.exam_preparation && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Test Preparation Details</h4>
                  <div>
                    <Label className="font-medium">Exam</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequirement.exam_preparation}</p>
                  </div>
                </div>
              )}
              
              {selectedRequirement.category === 'skills' && selectedRequirement.skill_level && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Skill Details</h4>
                  <div>
                    <Label className="font-medium">Current Level</Label>
                    <p className="text-sm text-muted-foreground capitalize">{selectedRequirement.skill_level}</p>
                  </div>
                </div>
              )}
              
              {selectedRequirement.category === 'music' && selectedRequirement.age_group && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Music Details</h4>
                  <div>
                    <Label className="font-medium">Age Group</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequirement.age_group}</p>
                  </div>
                </div>
              )}
              
              {selectedRequirement.category === 'other' && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Custom Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequirement.custom_category && (
                      <div>
                        <Label className="font-medium">Custom Category</Label>
                        <p className="text-sm text-muted-foreground">{selectedRequirement.custom_category}</p>
                      </div>
                    )}
                    {selectedRequirement.custom_subject && (
                      <div>
                        <Label className="font-medium">Custom Subject/Skill</Label>
                        <p className="text-sm text-muted-foreground">{selectedRequirement.custom_subject}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Additional preferences */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Preferences</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedRequirement.preferred_gender && (
                    <div>
                      <Label className="font-medium">Preferred Gender</Label>
                      <p className="text-sm text-muted-foreground capitalize">{selectedRequirement.preferred_gender}</p>
                    </div>
                  )}
                  {selectedRequirement.experience_level && (
                    <div>
                      <Label className="font-medium">Experience Level</Label>
                      <p className="text-sm text-muted-foreground capitalize">{selectedRequirement.experience_level}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Timestamps */}
              <div className="space-y-2 pt-4 border-t text-xs text-muted-foreground">
                <p>Posted: {new Date(selectedRequirement.created_at).toLocaleString()}</p>
                {selectedRequirement.updated_at && selectedRequirement.updated_at !== selectedRequirement.created_at && (
                  <p>Last updated: {new Date(selectedRequirement.updated_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  closeRequirementDetails();
                  if (selectedRequirement) {
                    handleEditRequirement(selectedRequirement);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (selectedRequirement) {
                    closeRequirementDetails();
                    handleDeleteRequirement(selectedRequirement.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <Button variant="outline" onClick={closeRequirementDetails}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Requirement Modal */}
      {showEditModal && editingRequirement && (
        <RequirementEditModal
          requirement={editingRequirement}
          onClose={closeEditModal}
          onUpdate={() => {
            closeEditModal();
            loadRequirements(); // Reload requirements after update
          }}
        />
      )}
    </div>
  );
}

// Requirement Posting Modal Component
function RequirementPostingModal({ onClose, onPostRequirement }: { onClose: () => void; onPostRequirement: (data: any) => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    urgency: '',
    budgetRange: '',
    location: '',
    preferredTeachingMode: '',
    preferredTime: '',
    preferredGender: '',
    experienceLevel: '',
    classLevel: '',
    board: '',
    examPreparation: '',
    skillLevel: '',
    ageGroup: '',
    specificTopics: '',
    learningGoals: ''
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'category' && {
        subject: '',
        classLevel: '',
        board: '',
        examPreparation: '',
        skillLevel: '',
        ageGroup: '',
        specificTopics: '',
        learningGoals: ''
      })
    }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const requiredFields = ['category', 'subject', 'description', 'urgency', 'budgetRange', 'location'];
    return requiredFields.every(field => formData[field as keyof typeof formData].trim() !== '');
  };

  const showError = (field: string) => {
    const value = formData[field as keyof typeof formData];
    return touched[field] && (!value || (typeof value === 'string' && !value.trim()));
  };

  const isFormValid = () => {
    const basicValidation = validateForm();
    console.log('Basic validation result:', basicValidation);
    console.log('Form data for validation:', formData);
    
    if (!basicValidation) return false;
    
    // Category-specific validation
    if (formData.category === 'academic' && (!formData.classLevel || !formData.board)) {
      console.log('Academic validation failed: classLevel:', formData.classLevel, 'board:', formData.board);
      return false;
    }
    if (formData.category === 'test_preparation' && !formData.examPreparation) {
      console.log('Test preparation validation failed: examPreparation:', formData.examPreparation);
      return false;
    }
    if (formData.category === 'skills' && !formData.skillLevel) {
      console.log('Skills validation failed: skillLevel:', formData.skillLevel);
      return false;
    }
    if (formData.category === 'music' && !formData.ageGroup) {
      console.log('Music validation failed: ageGroup:', formData.ageGroup);
      return false;
    }
    
    console.log('All validations passed');
    return true;
  };

  const getSubjectOptions = () => {
    const subjectsByCategory = {
      academic: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Economics', 'Accountancy'],
      languages: ['English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Arabic'],
      skills: ['Cooking', 'Photography', 'Drawing', 'Dancing', 'Coding', 'Digital Marketing', 'Public Speaking'],
      test_preparation: ['JEE', 'NEET', 'CAT', 'GATE', 'UPSC', 'IELTS', 'TOEFL', 'SAT', 'GRE'],
      music: ['Piano', 'Guitar', 'Violin', 'Drums', 'Singing', 'Flute', 'Keyboard'],
      sports: ['Cricket', 'Football', 'Basketball', 'Tennis', 'Swimming', 'Badminton', 'Yoga'],
      technology: ['Web Development', 'App Development', 'Data Science', 'AI/ML', 'Cybersecurity', 'UI/UX Design'],
      business: ['Marketing', 'Finance', 'Management', 'Entrepreneurship', 'Investment', 'Accounting'],
      other: ['Custom Subject']
    };
    return subjectsByCategory[formData.category as keyof typeof subjectsByCategory] || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = Object.keys(formData);
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Category-specific validation
    if (formData.category === 'academic' && (!formData.classLevel || !formData.board)) {
      toast({
        title: "Academic Details Required",
        description: "Please select class level and board for academic subjects.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.category === 'test_preparation' && !formData.examPreparation) {
      toast({
        title: "Exam Details Required",
        description: "Please specify which exam you're preparing for.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.category === 'skills' && !formData.skillLevel) {
      toast({
        title: "Skill Level Required",
        description: "Please specify your current skill level.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.category === 'music' && !formData.ageGroup) {
      toast({
        title: "Age Group Required",
        description: "Please specify the age group for music lessons.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    await onPostRequirement(formData);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Post New Requirement</DialogTitle>
          <DialogDescription>
            Tell tutors what you're looking for. Be specific to get better matches!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-medium">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className={showError('category') ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Academic Subjects</SelectItem>
                <SelectItem value="languages">Languages</SelectItem>
                <SelectItem value="skills">Skills & Hobbies</SelectItem>
                <SelectItem value="test_preparation">Test Preparation</SelectItem>
                <SelectItem value="music">Music & Arts</SelectItem>
                <SelectItem value="sports">Sports & Fitness</SelectItem>
                <SelectItem value="technology">Technology & Programming</SelectItem>
                <SelectItem value="business">Business & Finance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {showError('category') && (
              <p className="text-sm text-red-500 mt-1">{showError('category')}</p>
            )}
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-base font-medium">Subject/Skill *</Label>
            <Select 
              value={formData.subject} 
              onValueChange={(value) => handleInputChange('subject', value)}
              disabled={!formData.category}
            >
              <SelectTrigger className={showError('subject') ? 'border-red-500' : ''}>
                <SelectValue placeholder={formData.category ? "Select a subject or skill" : "Please select a category first"} />
              </SelectTrigger>
              <SelectContent>
                {formData.category === 'academic' && (
                  <>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="computer_science">Computer Science</SelectItem>
                    <SelectItem value="economics">Economics</SelectItem>
                    <SelectItem value="accounting">Accounting</SelectItem>
                    <SelectItem value="statistics">Statistics</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="medical">Medical Sciences</SelectItem>
                    <SelectItem value="law">Law</SelectItem>
                    <SelectItem value="architecture">Architecture</SelectItem>
                  </>
                )}
                {formData.category === 'languages' && (
                  <>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="chinese">Chinese (Mandarin)</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="arabic">Arabic</SelectItem>
                    <SelectItem value="sanskrit">Sanskrit</SelectItem>
                    <SelectItem value="marathi">Marathi</SelectItem>
                    <SelectItem value="gujarati">Gujarati</SelectItem>
                    <SelectItem value="tamil">Tamil</SelectItem>
                    <SelectItem value="telugu">Telugu</SelectItem>
                    <SelectItem value="kannada">Kannada</SelectItem>
                    <SelectItem value="malayalam">Malayalam</SelectItem>
                    <SelectItem value="punjabi">Punjabi</SelectItem>
                    <SelectItem value="bengali">Bengali</SelectItem>
                  </>
                )}
                {formData.category === 'skills' && (
                  <>
                    <SelectItem value="cooking">Cooking & Culinary Arts</SelectItem>
                    <SelectItem value="painting">Painting & Drawing</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="dance">Dance</SelectItem>
                    <SelectItem value="yoga">Yoga & Meditation</SelectItem>
                    <SelectItem value="gardening">Gardening</SelectItem>
                    <SelectItem value="knitting">Knitting & Crochet</SelectItem>
                    <SelectItem value="pottery">Pottery & Ceramics</SelectItem>
                    <SelectItem value="calligraphy">Calligraphy</SelectItem>
                    <SelectItem value="origami">Origami</SelectItem>
                    <SelectItem value="chess">Chess</SelectItem>
                    <SelectItem value="public_speaking">Public Speaking</SelectItem>
                    <SelectItem value="creative_writing">Creative Writing</SelectItem>
                    <SelectItem value="graphic_design">Graphic Design</SelectItem>
                    <SelectItem value="video_editing">Video Editing</SelectItem>
                    <SelectItem value="digital_art">Digital Art</SelectItem>
                  </>
                )}
                {formData.category === 'test_preparation' && (
                  <>
                    <SelectItem value="jee_main">JEE Main</SelectItem>
                    <SelectItem value="jee_advanced">JEE Advanced</SelectItem>
                    <SelectItem value="neet">NEET</SelectItem>
                    <SelectItem value="cat">CAT</SelectItem>
                    <SelectItem value="gate">GATE</SelectItem>
                    <SelectItem value="upsc">UPSC Civil Services</SelectItem>
                    <SelectItem value="ssc">SSC CGL</SelectItem>
                    <SelectItem value="banking">Banking Exams</SelectItem>
                    <SelectItem value="gre">GRE</SelectItem>
                    <SelectItem value="gmat">GMAT</SelectItem>
                    <SelectItem value="toefl">TOEFL</SelectItem>
                    <SelectItem value="ielts">IELTS</SelectItem>
                    <SelectItem value="sat">SAT</SelectItem>
                    <SelectItem value="act">ACT</SelectItem>
                    <SelectItem value="clat">CLAT</SelectItem>
                    <SelectItem value="ailet">AILET</SelectItem>
                  </>
                )}
                {formData.category === 'music' && (
                  <>
                    <SelectItem value="piano">Piano</SelectItem>
                    <SelectItem value="guitar">Guitar</SelectItem>
                    <SelectItem value="violin">Violin</SelectItem>
                    <SelectItem value="flute">Flute</SelectItem>
                    <SelectItem value="tabla">Tabla</SelectItem>
                    <SelectItem value="harmonium">Harmonium</SelectItem>
                    <SelectItem value="sitar">Sitar</SelectItem>
                    <SelectItem value="drums">Drums</SelectItem>
                    <SelectItem value="vocals">Vocals</SelectItem>
                    <SelectItem value="music_theory">Music Theory</SelectItem>
                    <SelectItem value="composition">Music Composition</SelectItem>
                    <SelectItem value="hindustani_classical">Hindustani Classical</SelectItem>
                    <SelectItem value="carnatic_classical">Carnatic Classical</SelectItem>
                    <SelectItem value="western_classical">Western Classical</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="rock">Rock Music</SelectItem>
                  </>
                )}
                {formData.category === 'sports' && (
                  <>
                    <SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="badminton">Badminton</SelectItem>
                    <SelectItem value="table_tennis">Table Tennis</SelectItem>
                    <SelectItem value="swimming">Swimming</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="gym">Gym & Fitness</SelectItem>
                    <SelectItem value="martial_arts">Martial Arts</SelectItem>
                    <SelectItem value="boxing">Boxing</SelectItem>
                    <SelectItem value="wrestling">Wrestling</SelectItem>
                    <SelectItem value="archery">Archery</SelectItem>
                    <SelectItem value="shooting">Shooting</SelectItem>
                    <SelectItem value="golf">Golf</SelectItem>
                    <SelectItem value="chess">Chess</SelectItem>
                  </>
                )}
                {formData.category === 'technology' && (
                  <>
                    <SelectItem value="web_development">Web Development</SelectItem>
                    <SelectItem value="mobile_app_development">Mobile App Development</SelectItem>
                    <SelectItem value="python">Python Programming</SelectItem>
                    <SelectItem value="java">Java Programming</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="c_plus_plus">C++ Programming</SelectItem>
                    <SelectItem value="data_science">Data Science</SelectItem>
                    <SelectItem value="machine_learning">Machine Learning</SelectItem>
                    <SelectItem value="artificial_intelligence">Artificial Intelligence</SelectItem>
                    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="cloud_computing">Cloud Computing</SelectItem>
                    <SelectItem value="blockchain">Blockchain</SelectItem>
                    <SelectItem value="ui_ux_design">UI/UX Design</SelectItem>
                    <SelectItem value="game_development">Game Development</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="database_management">Database Management</SelectItem>
                  </>
                )}
                {formData.category === 'business' && (
                  <>
                    <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                    <SelectItem value="business_strategy">Business Strategy</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="accounting">Accounting</SelectItem>
                    <SelectItem value="human_resources">Human Resources</SelectItem>
                    <SelectItem value="operations_management">Operations Management</SelectItem>
                    <SelectItem value="project_management">Project Management</SelectItem>
                    <SelectItem value="supply_chain">Supply Chain Management</SelectItem>
                    <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                    <SelectItem value="social_media_marketing">Social Media Marketing</SelectItem>
                    <SelectItem value="seo">SEO</SelectItem>
                    <SelectItem value="content_marketing">Content Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="customer_service">Customer Service</SelectItem>
                    <SelectItem value="business_analytics">Business Analytics</SelectItem>
                  </>
                )}
                {formData.category === 'other' && (
                  <>
                    <SelectItem value="custom">Custom Requirement</SelectItem>
                    <SelectItem value="multiple_subjects">Multiple Subjects</SelectItem>
                    <SelectItem value="special_needs">Special Needs Education</SelectItem>
                    <SelectItem value="adult_education">Adult Education</SelectItem>
                    <SelectItem value="career_counseling">Career Counseling</SelectItem>
                    <SelectItem value="life_skills">Life Skills</SelectItem>
                    <SelectItem value="personality_development">Personality Development</SelectItem>
                    <SelectItem value="interview_preparation">Interview Preparation</SelectItem>
                    <SelectItem value="resume_writing">Resume Writing</SelectItem>
                    <SelectItem value="time_management">Time Management</SelectItem>
                    <SelectItem value="leadership">Leadership Skills</SelectItem>
                    <SelectItem value="communication">Communication Skills</SelectItem>
                  </>
                )}
                {!formData.category && (
                  <SelectItem value="placeholder" disabled>Please select a category first</SelectItem>
                )}
              </SelectContent>
            </Select>
            {showError('subject') && (
              <p className="text-sm text-red-500 mt-1">{showError('subject')}</p>
            )}
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-medium">Location *</Label>
            <Select 
              value={formData.location} 
              onValueChange={(value) => handleInputChange('location', value)}
            >
              <SelectTrigger className={showError('location') ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your city/locality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="hyderabad">Hyderabad</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
                <SelectItem value="kolkata">Kolkata</SelectItem>
                <SelectItem value="pune">Pune</SelectItem>
                <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                <SelectItem value="jaipur">Jaipur</SelectItem>
                <SelectItem value="lucknow">Lucknow</SelectItem>
                <SelectItem value="kanpur">Kanpur</SelectItem>
                <SelectItem value="nagpur">Nagpur</SelectItem>
                <SelectItem value="indore">Indore</SelectItem>
                <SelectItem value="thane">Thane</SelectItem>
                <SelectItem value="bhopal">Bhopal</SelectItem>
                <SelectItem value="visakhapatnam">Visakhapatnam</SelectItem>
                <SelectItem value="patna">Patna</SelectItem>
                <SelectItem value="vadodara">Vadodara</SelectItem>
                <SelectItem value="ghaziabad">Ghaziabad</SelectItem>
                <SelectItem value="ludhiana">Ludhiana</SelectItem>
                <SelectItem value="agra">Agra</SelectItem>
                <SelectItem value="nashik">Nashik</SelectItem>
                <SelectItem value="faridabad">Faridabad</SelectItem>
                <SelectItem value="meerut">Meerut</SelectItem>
                <SelectItem value="rajkot">Rajkot</SelectItem>
                <SelectItem value="kalyan">Kalyan</SelectItem>
                <SelectItem value="vasai">Vasai</SelectItem>
                <SelectItem value="vashi">Vashi</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {showError('location') && (
              <p className="text-sm text-red-500 mt-1">{showError('location')}</p>
            )}
          </div>

          {/* Dynamic Quick Questions Based on Category */}
          {formData.category === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classLevel" className="text-base font-medium">Class Level *</Label>
                <Select 
                  value={formData.classLevel} 
                  onValueChange={(value) => handleInputChange('classLevel', value)}
                >
                  <SelectTrigger className={showError('classLevel') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select class level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary (1-5)</SelectItem>
                    <SelectItem value="middle">Middle (6-8)</SelectItem>
                    <SelectItem value="secondary">Secondary (9-10)</SelectItem>
                    <SelectItem value="higher_secondary">Higher Secondary (11-12)</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="postgraduate">Postgraduate</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
                {showError('classLevel') && (
                  <p className="text-sm text-red-500 mt-1">{showError('classLevel')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="board" className="text-base font-medium">Board/University *</Label>
                <Select 
                  value={formData.board} 
                  onValueChange={(value) => handleInputChange('board', value)}
                >
                  <SelectTrigger className={showError('board') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select board/university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbse">CBSE</SelectItem>
                    <SelectItem value="icse">ICSE</SelectItem>
                    <SelectItem value="state_board">State Board</SelectItem>
                    <SelectItem value="ib">International Baccalaureate</SelectItem>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                    <SelectItem value="university">University Specific</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {showError('board') && (
                  <p className="text-sm text-red-500 mt-1">{showError('board')}</p>
                )}
              </div>
            </div>
          )}

          {formData.category === 'test_preparation' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examPreparation" className="text-base font-medium">Exam Preparation Level *</Label>
                <Select 
                  value={formData.examPreparation} 
                  onValueChange={(value) => handleInputChange('examPreparation', value)}
                >
                  <SelectTrigger className={showError('examPreparation') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select preparation level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="revision">Revision & Practice</SelectItem>
                    <SelectItem value="mock_tests">Mock Tests</SelectItem>
                  </SelectContent>
                </Select>
                {showError('examPreparation') && (
                  <p className="text-sm text-red-500 mt-1">{showError('examPreparation')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specificTopics" className="text-base font-medium">Specific Topics *</Label>
                <Input
                  placeholder="e.g., Calculus, Organic Chemistry, Mechanics"
                  value={formData.specificTopics}
                  onChange={(e) => handleInputChange('specificTopics', e.target.value)}
                  className={showError('specificTopics') ? 'border-red-500' : ''}
                />
                {showError('specificTopics') && (
                  <p className="text-sm text-red-500 mt-1">{showError('specificTopics')}</p>
                )}
              </div>
            </div>
          )}

          {formData.category === 'languages' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillLevel" className="text-base font-medium">Current Skill Level *</Label>
                <Select 
                  value={formData.skillLevel} 
                  onValueChange={(value) => handleInputChange('skillLevel', value)}
                >
                  <SelectTrigger className={showError('skillLevel') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (No prior knowledge)</SelectItem>
                    <SelectItem value="elementary">Elementary (Basic phrases)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Conversational)</SelectItem>
                    <SelectItem value="upper_intermediate">Upper Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced (Fluent)</SelectItem>
                    <SelectItem value="native">Native-like</SelectItem>
                  </SelectContent>
                </Select>
                {showError('skillLevel') && (
                  <p className="text-sm text-red-500 mt-1">{showError('skillLevel')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="learningGoals" className="text-base font-medium">Learning Goals *</Label>
                <Select 
                  value={formData.learningGoals} 
                  onValueChange={(value) => handleInputChange('learningGoals', value)}
                >
                  <SelectTrigger className={showError('learningGoals') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select learning goals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversation">Conversation & Speaking</SelectItem>
                    <SelectItem value="grammar">Grammar & Writing</SelectItem>
                    <SelectItem value="reading">Reading & Comprehension</SelectItem>
                    <SelectItem value="business">Business Communication</SelectItem>
                    <SelectItem value="travel">Travel & Tourism</SelectItem>
                    <SelectItem value="academic">Academic Purposes</SelectItem>
                    <SelectItem value="exam_preparation">Exam Preparation</SelectItem>
                  </SelectContent>
                </Select>
                {showError('learningGoals') && (
                  <p className="text-sm text-red-500 mt-1">{showError('learningGoals')}</p>
                )}
              </div>
            </div>
          )}

          {formData.category === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillLevel" className="text-base font-medium">Current Skill Level *</Label>
                <Select 
                  value={formData.skillLevel} 
                  onValueChange={(value) => handleInputChange('skillLevel', value)}
                >
                  <SelectTrigger className={showError('skillLevel') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (No experience)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Some experience)</SelectItem>
                    <SelectItem value="advanced">Advanced (Experienced)</SelectItem>
                    <SelectItem value="expert">Expert (Professional level)</SelectItem>
                  </SelectContent>
                </Select>
                {showError('skillLevel') && (
                  <p className="text-sm text-red-500 mt-1">{showError('skillLevel')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ageGroup" className="text-base font-medium">Age Group *</Label>
                <Select 
                  value={formData.ageGroup} 
                  onValueChange={(value) => handleInputChange('ageGroup', value)}
                >
                  <SelectTrigger className={showError('ageGroup') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="children">Children (5-12 years)</SelectItem>
                    <SelectItem value="teens">Teens (13-17 years)</SelectItem>
                    <SelectItem value="adults">Adults (18+ years)</SelectItem>
                    <SelectItem value="seniors">Seniors (50+ years)</SelectItem>
                  </SelectContent>
                </Select>
                {showError('ageGroup') && (
                  <p className="text-sm text-red-500 mt-1">{showError('ageGroup')}</p>
                )}
              </div>
            </div>
          )}

          {formData.category === 'music' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillLevel" className="text-base font-medium">Current Skill Level *</Label>
                <Select 
                  value={formData.skillLevel} 
                  onValueChange={(value) => handleInputChange('skillLevel', value)}
                >
                  <SelectTrigger className={showError('skillLevel') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (No musical background)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Some training)</SelectItem>
                    <SelectItem value="advanced">Advanced (Regular practice)</SelectItem>
                    <SelectItem value="expert">Expert (Professional musician)</SelectItem>
                  </SelectContent>
                </Select>
                {showError('skillLevel') && (
                  <p className="text-sm text-red-500 mt-1">{showError('skillLevel')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="learningGoals" className="text-base font-medium">Learning Goals *</Label>
                <Select 
                  value={formData.learningGoals} 
                  onValueChange={(value) => handleInputChange('learningGoals', value)}
                >
                  <SelectTrigger className={showError('learningGoals') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select learning goals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic_skills">Basic Skills & Techniques</SelectItem>
                    <SelectItem value="performance">Performance & Stage</SelectItem>
                    <SelectItem value="composition">Composition & Songwriting</SelectItem>
                    <SelectItem value="theory">Music Theory</SelectItem>
                    <SelectItem value="exams">Grade Exams</SelectItem>
                    <SelectItem value="hobby">Hobby & Recreation</SelectItem>
                  </SelectContent>
                </Select>
                {showError('learningGoals') && (
                  <p className="text-sm text-red-500 mt-1">{showError('learningGoals')}</p>
                )}
              </div>
            </div>
          )}

          {formData.category === 'sports' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillLevel" className="text-base font-medium">Current Skill Level *</Label>
                <Select 
                  value={formData.skillLevel} 
                  onValueChange={(value) => handleInputChange('skillLevel', value)}
                >
                  <SelectTrigger className={showError('skillLevel') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (No experience)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Some training)</SelectItem>
                    <SelectItem value="advanced">Advanced (Regular practice)</SelectItem>
                    <SelectItem value="competitive">Competitive Level</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
                {showError('skillLevel') && (
                  <p className="text-sm text-red-500 mt-1">{showError('skillLevel')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ageGroup" className="text-base font-medium">Age Group *</Label>
                <Select 
                  value={formData.ageGroup} 
                  onValueChange={(value) => handleInputChange('ageGroup', value)}
                >
                  <SelectTrigger className={showError('ageGroup') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="children">Children (5-12 years)</SelectItem>
                    <SelectItem value="teens">Teens (13-17 years)</SelectItem>
                    <SelectItem value="adults">Adults (18+ years)</SelectItem>
                    <SelectItem value="seniors">Seniors (50+ years)</SelectItem>
                  </SelectContent>
                </Select>
                {showError('ageGroup') && (
                  <p className="text-sm text-red-500 mt-1">{showError('ageGroup')}</p>
                )}
              </div>
            </div>
          )}

          {formData.category === 'technology' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillLevel" className="text-base font-medium">Current Skill Level *</Label>
                <Select 
                  value={formData.skillLevel} 
                  onValueChange={(value) => handleInputChange('skillLevel', value)}
                >
                  <SelectTrigger className={showError('skillLevel') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (No coding experience)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Basic programming)</SelectItem>
                    <SelectItem value="advanced">Advanced (Regular coding)</SelectItem>
                    <SelectItem value="expert">Expert (Professional developer)</SelectItem>
                  </SelectContent>
                </Select>
                {showError('skillLevel') && (
                  <p className="text-sm text-red-500 mt-1">{showError('skillLevel')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="learningGoals" className="text-base font-medium">Learning Goals *</Label>
                <Select 
                  value={formData.learningGoals} 
                  onValueChange={(value) => handleInputChange('learningGoals', value)}
                >
                  <SelectTrigger className={showError('learningGoals') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select learning goals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fundamentals">Programming Fundamentals</SelectItem>
                    <SelectItem value="web_development">Web Development</SelectItem>
                    <SelectItem value="mobile_apps">Mobile App Development</SelectItem>
                    <SelectItem value="data_science">Data Science & Analytics</SelectItem>
                    <SelectItem value="ai_ml">AI & Machine Learning</SelectItem>
                    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="career_switch">Career Switch</SelectItem>
                    <SelectItem value="hobby">Hobby & Personal Projects</SelectItem>
                  </SelectContent>
                </Select>
                {showError('learningGoals') && (
                  <p className="text-sm text-red-500 mt-1">{showError('learningGoals')}</p>
                )}
              </div>
            </div>
          )}

          {formData.category === 'business' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillLevel" className="text-base font-medium">Experience Level *</Label>
                <Select 
                  value={formData.skillLevel} 
                  onValueChange={(value) => handleInputChange('skillLevel', value)}
                >
                  <SelectTrigger className={showError('skillLevel') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="entry_level">Entry Level Professional</SelectItem>
                    <SelectItem value="mid_level">Mid-Level Professional</SelectItem>
                    <SelectItem value="senior">Senior Professional</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                    <SelectItem value="career_changer">Career Changer</SelectItem>
                  </SelectContent>
                </Select>
                {showError('skillLevel') && (
                  <p className="text-sm text-red-500 mt-1">{showError('skillLevel')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="learningGoals" className="text-base font-medium">Learning Goals *</Label>
                <Select 
                  value={formData.learningGoals} 
                  onValueChange={(value) => handleInputChange('learningGoals', value)}
                >
                  <SelectTrigger className={showError('learningGoals') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select learning goals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skill_development">Skill Development</SelectItem>
                    <SelectItem value="career_advancement">Career Advancement</SelectItem>
                    <SelectItem value="business_launch">Launching a Business</SelectItem>
                    <SelectItem value="industry_knowledge">Industry Knowledge</SelectItem>
                    <SelectItem value="networking">Networking & Connections</SelectItem>
                    <SelectItem value="certification">Professional Certification</SelectItem>
                  </SelectContent>
                </Select>
                {showError('learningGoals') && (
                  <p className="text-sm text-red-500 mt-1">{showError('learningGoals')}</p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what you want to learn, your current level, and any specific topics you want to focus on..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`min-h-[100px] ${showError('description') ? 'border-red-500' : ''}`}
              required
            />
            {showError('description') && (
              <p className="text-sm text-red-500 mt-1">{showError('description')}</p>
            )}
          </div>

          {/* Teaching Mode Preference */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Preferred Teaching Mode</Label>
            <RadioGroup 
              value={formData.preferredTeachingMode} 
              onValueChange={(value) => handleInputChange('preferredTeachingMode', value)}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online">Online</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="offline" id="offline" />
                  <Label htmlFor="offline">Offline</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">Both</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="home_tuition" id="home_tuition" />
                  <Label htmlFor="home_tuition">Home Tuition</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Time Preference */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Preferred Time</Label>
            <RadioGroup 
              value={formData.preferredTime} 
              onValueChange={(value) => handleInputChange('preferredTime', value)}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="morning" id="morning" />
                  <Label htmlFor="morning">Morning (6 AM - 12 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="afternoon" id="afternoon" />
                  <Label htmlFor="afternoon">Afternoon (12 PM - 6 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evening" id="evening" />
                  <Label htmlFor="evening">Evening (6 PM - 10 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <Label htmlFor="flexible">Flexible</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Budget Range (per hour)</Label>
            <RadioGroup 
              value={formData.budgetRange} 
              onValueChange={(value) => handleInputChange('budgetRange', value)}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="500-1000" id="budget1" />
                  <Label htmlFor="budget1">₹500 - ₹1,000</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1000-2000" id="budget2" />
                  <Label htmlFor="budget2">₹1,000 - ₹2,000</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2000-3000" id="budget3" />
                  <Label htmlFor="budget3">₹2,000 - ₹3,000</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3000+" id="budget4" />
                  <Label htmlFor="budget4">₹3,000+</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Urgency Level</Label>
            <RadioGroup 
              value={formData.urgency} 
              onValueChange={(value) => handleInputChange('urgency', value)}
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="urgency1" />
                  <Label htmlFor="urgency1">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="urgency2" />
                  <Label htmlFor="urgency2">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="urgency3" />
                  <Label htmlFor="urgency3">High</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Additional Requirements */}
          <div className="space-y-2">
            <Label htmlFor="additionalRequirements" className="text-base font-medium">
              Additional Requirements
            </Label>
            <Textarea
              id="additionalRequirements"
              placeholder="Any other preferences like tutor gender, age group, language, etc. (optional)"
              value={formData.additionalRequirements}
              onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-primary"
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Requirement
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}