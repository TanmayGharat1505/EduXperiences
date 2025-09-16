import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInstitutionDashboard } from '@/hooks/useInstitutionDashboard';
import { AddCourseModal } from '@/components/courses/AddCourseModal';
import { ViewCourseModal } from '@/components/courses/ViewCourseModal';
import { EditCourseModal } from '@/components/courses/EditCourseModal';
import InstitutionProfileEditDialog from '@/components/institution/InstitutionProfileEditDialog';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Settings, 
  Bell,
  Plus,
  Eye,
  Star,
  Shield,
  CheckCircle,
  Clock,
  Upload,
  Loader2,
  AlertCircle,
  MessageSquare,
  UserPlus,
  DollarSign,
  EyeIcon,
  Phone,
  BarChart3,
  Activity,
  GraduationCap,
  CreditCard,
  ThumbsUp,
  Edit3,
  Calendar,
  UserCheck,
  FileText,
  Menu,
  LogOut,
  Home as HomeIcon,
  Megaphone,
  Search,
  Grid3X3,
  List,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin,
  User,
  DollarSign as DollarSignIcon,
  X,
  RefreshCw
} from 'lucide-react';

interface DashboardState {
  activeTab: string;
  showProfileDialog: boolean;
  selectedStudent: any;
  refreshTrigger: number;
  showEditProfileDialog: boolean;
}

// Global helper function to get current user ID safely
let currentUserGlobal: any = null;

const setCurrentUserGlobal = (user: any) => {
  currentUserGlobal = user;
};

const getCurrentUserId = () => {
  if (!currentUserGlobal) {
    console.error('❌ [InstitutionDashboard] No current user available');
    return null;
  }
  return currentUserGlobal.id;
};

export default function InstitutionDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Centralized user state to prevent profile mixing
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  
  const { profile, registrationData, stats, recentActivity, loading, error, refreshData } = useInstitutionDashboard();

  // Profile update function
  const handleProfileUpdate = async (updatedProfile: any) => {
    try {
      // Refresh the dashboard data to show updated profile
      await refreshData();
      toast({
        title: "Profile Updated",
        description: "Your institution profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error refreshing profile data:', error);
      toast({
        title: "Error",
        description: "Profile updated but failed to refresh data. Please reload the page.",
        variant: "destructive",
      });
    }
  };
  
  // Initialize user authentication once
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          navigate('/login');
          return;
        }
        if (!user) {
          navigate('/login');
          return;
        }
        setCurrentUser(user);
        setCurrentUserGlobal(user);
        console.log('🔐 [InstitutionDashboard] User initialized:', user.id, user.email);
      } catch (error) {
        console.error('Error initializing user:', error);
        navigate('/login');
      } finally {
        setUserLoading(false);
      }
    };
    
    initializeUser();
  }, [navigate]);
  
  const [state, setState] = useState<DashboardState>({
    activeTab: "dashboard",
    showProfileDialog: false,
    selectedStudent: null,
    refreshTrigger: 0,
    showEditProfileDialog: false,
  });
  
  // Show loading while user is being initialized
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Redirect if no user
  if (!currentUser) {
    return null;
  }

  // Navigation menu items
  const navMenu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <HomeIcon className="h-4 w-4" />,
    },
    {
      id: "inquiries",
      label: "Student Inquiries",
      icon: <MessageSquare className="h-4 w-4" />,
      badge: stats.newInquiries > 0 ? stats.newInquiries : undefined,
    },
    {
      id: "students",
      label: "My Students",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "courses",
      label: "Courses & Batches",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: "faculty",
      label: "Faculty Management",
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      id: "admissions",
      label: "Admissions",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "fees",
      label: "Fee Management",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: "marketing",
      label: "Marketing Tools",
      icon: <Megaphone className="h-4 w-4" />,
    },
    {
      id: "settings",
      label: "Profile Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex flex-col">
        <SidebarProvider>
          <div className="flex flex-1">
            <Sidebar className="bg-sidebar border-r">
              <SidebarContent>
                <div className="p-4 border-b">
                  <h2 className="text-lg font-bold text-primary">EduXperience</h2>
                  <p className="text-sm text-muted-foreground">Institution Dashboard</p>
          </div>
              </SidebarContent>
            </Sidebar>
            <main className="flex-1 p-6 md:p-10 bg-background overflow-y-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-600">Loading dashboard...</p>
                </div>
              </div>
            </main>
            </div>
        </SidebarProvider>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex flex-col">
        <SidebarProvider>
          <div className="flex flex-1">
            <Sidebar className="bg-sidebar border-r">
              <SidebarContent>
                <div className="p-4 border-b">
                  <h2 className="text-lg font-bold text-primary">EduXperience</h2>
                  <p className="text-sm text-muted-foreground">Institution Dashboard</p>
          </div>
              </SidebarContent>
            </Sidebar>
            <main className="flex-1 p-6 md:p-10 bg-background overflow-y-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={refreshData} variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            </main>
            </div>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <SidebarProvider>
        <div className="flex flex-1">
          {/* Sidebar Navigation */}
          <Sidebar className="bg-sidebar border-r">
            <SidebarContent>
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-primary">EduXperience</h2>
                <p className="text-sm text-muted-foreground">
                  {registrationData?.name || profile?.organization_name || "Institution Dashboard"}
                </p>
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
                profile={profile}
                registrationData={registrationData}
                stats={stats}
                recentActivity={recentActivity}
                onViewProfile={() => setState(prev => ({ ...prev, showEditProfileDialog: true }))}
                onRefresh={refreshData}
              />
            )}

            {state.activeTab === "inquiries" && (
              <InquiriesDashboard />
            )}

            {state.activeTab === "students" && (
              <StudentsDashboard />
            )}

            {state.activeTab === "courses" && (
              <CoursesDashboard />
            )}

            {state.activeTab === "faculty" && (
              <FacultyDashboard />
            )}

            {state.activeTab === "admissions" && (
              <AdmissionsDashboard />
            )}

            {state.activeTab === "fees" && (
              <FeesDashboard />
            )}

            {state.activeTab === "reports" && (
              <ReportsDashboard />
            )}

            {state.activeTab === "marketing" && (
              <MarketingDashboard />
            )}

            {state.activeTab === "settings" && (
              <SettingsDashboard />
            )}
          </main>
        </div>
      </SidebarProvider>

      {/* Edit Profile Dialog */}
      {state.showEditProfileDialog && (
        <InstitutionProfileEditDialog
          profile={profile}
          onUpdate={handleProfileUpdate}
          onClose={() => setState(prev => ({ ...prev, showEditProfileDialog: false }))}
        />
      )}
    </div>
  );
}

// Dashboard Home Component
function DashboardHome({ 
  profile, 
  registrationData,
  stats, 
  recentActivity,
  onViewProfile,
  onRefresh
}: {
  profile: any;
  registrationData: any;
  stats: any;
  recentActivity: any[] | undefined;
  onViewProfile: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={profile?.logo_url || ""} 
              alt={`${registrationData?.name || profile?.organization_name || "Institution"}'s logo`}
            />
            <AvatarFallback className="text-xl font-semibold">
              {registrationData?.name ? 
                registrationData.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() :
                <Building2 className="h-8 w-8" />
              }
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, <span className="text-primary">{registrationData?.name || profile?.organization_name || "Institution"}</span>
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">Profile Completion</span>
              <Progress value={stats.profileCompletion || 0} className="w-40 h-2" />
              <span className="text-sm font-semibold">{stats.profileCompletion || 0}%</span>
              <Button size="sm" className="ml-4 bg-gradient-primary" onClick={onViewProfile}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
                </Button>
              </div>
            </div>
            </div>
      </section>

            {/* Institution Header */}
            <div className="mb-6 lg:mb-8">
              <Card className="overflow-hidden shadow-lg border-0 bg-white">
                <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Left Side - Institution Info */}
                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  {/* Institution Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>
                  
                  {/* Institution Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                        {registrationData?.name || profile?.organization_name || 'Institution Name'}
                      </h1>
                      <Badge variant="outline" className={
                        profile?.verified 
                          ? "text-green-600 border-green-200" 
                          : "text-yellow-600 border-yellow-200"
                      }>
                        {profile?.verified ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Verification
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {profile?.description || registrationData?.name || 'Educational institution providing quality education'}
                      {(profile?.established_year || registrationData?.establishment_year) && ` since ${profile?.established_year || registrationData?.establishment_year}`}
                    </p>
                    
                    {/* Registration Details */}
                    {registrationData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{registrationData.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Registration:</span>
                          <span className="font-medium">{registrationData.registration_number}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Contact:</span>
                          <span className="font-medium">{registrationData.primary_contact}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{registrationData.city}, {registrationData.state}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Rating and Reviews */}
                    {stats.overallRating > 0 && (
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.round(stats.overallRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700 ml-1">
                            {stats.overallRating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({stats.totalReviews} reviews)
                        </span>
                      </div>
                    )}
                    
                    {/* Key Metrics */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">
                          {stats.totalStudents.toLocaleString()} students enrolled
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">
                          {stats.activeCourses} active courses
                        </span>
                      </div>
                      {profile?.established_year && (
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-purple-500" />
                          <span className="text-gray-600">
                            Est. {profile.established_year}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Actions and Status */}
                <div className="flex flex-col lg:items-end space-y-4">
                  {/* Profile Completion */}
                  <div className="w-full lg:w-64">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                      <span className="text-sm text-gray-500">{stats.profileCompletion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.profileCompletion}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Institution Information Card */}
        {registrationData && (
          <div className="mb-6 lg:mb-8">
            <Card className="overflow-hidden shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="w-6 h-6 text-primary" />
                  Institution Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Institution Name:</span>
                        <span className="font-medium">{registrationData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{registrationData.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Established:</span>
                        <span className="font-medium">{registrationData.establishment_year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration No:</span>
                        <span className="font-medium font-mono text-xs">{registrationData.registration_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PAN:</span>
                        <span className="font-medium font-mono text-xs">{registrationData.pan}</span>
                      </div>
                      {registrationData.gst && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST:</span>
                          <span className="font-medium font-mono text-xs">{registrationData.gst}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Official Email:</span>
                        <span className="font-medium">{registrationData.official_email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Primary Contact:</span>
                        <span className="font-medium">{registrationData.primary_contact}</span>
                      </div>
                      {registrationData.secondary_contact && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Secondary Contact:</span>
                          <span className="font-medium">{registrationData.secondary_contact}</span>
                        </div>
                      )}
                      {registrationData.website && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Website:</span>
                          <a href={registrationData.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                            {registrationData.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Address Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium text-right">{registrationData.complete_address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">City:</span>
                        <span className="font-medium">{registrationData.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">State:</span>
                        <span className="font-medium">{registrationData.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pincode:</span>
                        <span className="font-medium">{registrationData.pincode}</span>
                      </div>
                      {registrationData.landmark && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Landmark:</span>
                          <span className="font-medium">{registrationData.landmark}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Owner Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner Name:</span>
                      <span className="font-medium">{registrationData.owner_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner Contact:</span>
                      <span className="font-medium">{registrationData.owner_contact}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Verification Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Primary Contact Verified:</span>
                      <Badge variant={registrationData.primary_contact_verified ? "default" : "secondary"}>
                        {registrationData.primary_contact_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Owner Contact Verified:</span>
                      <Badge variant={registrationData.owner_contact_verified ? "default" : "secondary"}>
                        {registrationData.owner_contact_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Stats Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Quick Stats</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">Real-time metrics</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* New Inquiries */}
            <Card className="relative shadow-md hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">New Inquiries</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats.newInquiries}</p>
                    <p className="text-xs text-gray-500">Last 7 days</p>
                  </div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    {stats.newInquiries > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {stats.newInquiries}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students This Month */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Students This Month</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats.studentsThisMonth}</p>
                    <p className="text-xs text-gray-500">New enrollments</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue This Month */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Revenue This Month</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      ₹{stats.revenueThisMonth.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Current month</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Views */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Profile Views</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats.profileViews}</p>
                    <p className="text-xs text-gray-500">Total views</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <EyeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Requests */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Contact Requests</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats.contactRequests}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Phone className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity Section - Grouped by Category */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Latest updates across your institution</p>
            </div>
            <Button variant="outline" size="sm" className="shadow-sm mt-3 sm:mt-0 w-full sm:w-auto">
              <Activity className="w-4 h-4 mr-2" />
              View All Activity
            </Button>
          </div>
          
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-6">
              {/* Group activities by type */}
              {(() => {
                const groupedActivities = recentActivity.reduce((groups: Record<string, any[]>, activity: any) => {
                  if (!groups[activity.type]) {
                    groups[activity.type] = [];
                  }
                  groups[activity.type].push(activity);
                  return groups;
                }, {});

                return Object.entries(groupedActivities).map(([type, activities]: [string, any[]]) => (
                  <Card key={type} className="shadow-md border-0 bg-white">
                    <CardHeader className="pb-4 bg-gray-50/50">
                      <CardTitle className="text-lg flex items-center space-x-3">
                        {type === 'inquiry' && (
                          <>
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <span>Student Inquiries ({activities.length})</span>
                          </>
                        )}
                        {type === 'admission' && (
                          <>
                            <GraduationCap className="w-4 h-4 text-green-600" />
                            <span>New Admissions ({activities.length})</span>
                          </>
                        )}
                        {type === 'payment' && (
                          <>
                            <CreditCard className="w-4 h-4 text-orange-600" />
                            <span>Fee Payments ({activities.length})</span>
                          </>
                        )}
                        {type === 'review' && (
                          <>
                            <ThumbsUp className="w-4 h-4 text-purple-600" />
                            <span>Reviews ({activities.length})</span>
                          </>
                        )}
                        {type === 'course_update' && (
                          <>
                            <Edit3 className="w-4 h-4 text-indigo-600" />
                            <span>Course Updates ({activities.length})</span>
                          </>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-200">
                        {activities.map((activity: any) => (
                          <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-3">
                              {/* Activity Icon */}
                              <div className="flex-shrink-0">
                                {activity.type === 'inquiry' && (
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                  </div>
                                )}
                                {activity.type === 'admission' && (
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <GraduationCap className="w-4 h-4 text-green-600" />
                                  </div>
                                )}
                                {activity.type === 'payment' && (
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-orange-600" />
                                  </div>
                                )}
                                {activity.type === 'review' && (
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <ThumbsUp className="w-4 h-4 text-purple-600" />
                                  </div>
                                )}
                                {activity.type === 'course_update' && (
                                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <Edit3 className="w-4 h-4 text-indigo-600" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Activity Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {activity.title}
                                  </h3>
                                  <span className="text-xs text-gray-500">
                                    {new Date(activity.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {activity.description}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  {activity.user_name && (
                                    <span className="text-xs text-gray-500">
                                      by {activity.user_name}
                                    </span>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    {activity.amount && (
                                      <Badge variant="outline" className="text-green-600 border-green-200">
                                        ₹{activity.amount.toLocaleString()}
                                      </Badge>
                                    )}
                                    {activity.rating && (
                                      <div className="flex items-center space-x-1">
                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        <span className="text-xs text-gray-600">{activity.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                <p className="text-gray-500">
                  Activity will appear here as students interact with your institution.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Common tasks and shortcuts</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Add New Course */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white group">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Add New Course</h3>
                <p className="text-sm text-gray-500 mb-4">Create a new course offering</p>
                <Button 
                  size="sm" 
                  className="w-full shadow-sm"
                  onClick={() => {
                    // TODO: Navigate to course creation page
                    console.log('Navigate to add new course');
                  }}
                >
                  Add Course
                </Button>
              </CardContent>
            </Card>

            {/* Update Availability */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white group">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Update Availability</h3>
                <p className="text-sm text-gray-500 mb-4">Manage your schedule</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full shadow-sm"
                  onClick={() => {
                    // TODO: Navigate to availability management
                    console.log('Navigate to update availability');
                  }}
                >
                  Update Schedule
                </Button>
              </CardContent>
            </Card>

            {/* View All Inquiries */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white group">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">View All Inquiries</h3>
                <p className="text-sm text-gray-500 mb-4">Manage student messages</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full shadow-sm"
                  onClick={() => {
                    // TODO: Navigate to inquiries management
                    console.log('Navigate to view all inquiries');
                  }}
                >
                  View Messages
                </Button>
              </CardContent>
            </Card>

            {/* Manage Students */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white group">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <UserCheck className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Manage Students</h3>
                <p className="text-sm text-gray-500 mb-4">View and manage enrolled students</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full shadow-sm"
                  onClick={() => {
                    // TODO: Navigate to student management
                    console.log('Navigate to manage students');
                  }}
                >
                  Manage Students
                </Button>
              </CardContent>
            </Card>

            {/* Update Profile */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white group">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                  <Settings className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Update Profile</h3>
                <p className="text-sm text-gray-500 mb-4">Edit institution information</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full shadow-sm"
                  onClick={() => {
                    // TODO: Navigate to profile settings
                    console.log('Navigate to update profile');
                  }}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Additional Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Additional content can be added here */}
          </div>

          {/* Right Column - Notifications & Info */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No new notifications</p>
                </div>
              </CardContent>
            </Card>

             {/* Institution Status */}
             <Card>
               <CardHeader>
                 <CardTitle>Institution Status</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-gray-600">Account Status</span>
                   <Badge variant="outline" className="text-green-600 border-green-200">
                     <CheckCircle className="w-3 h-3 mr-1" />
                     Active
                   </Badge>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-gray-600">Verification</span>
                   <Badge variant="outline" className={
                     profile?.verified 
                       ? "text-green-600 border-green-200" 
                       : "text-yellow-600 border-yellow-200"
                   }>
                     {profile?.verified ? (
                       <>
                         <CheckCircle className="w-3 h-3 mr-1" />
                         Verified
                       </>
                     ) : (
                       <>
                         <Clock className="w-3 h-3 mr-1" />
                         Pending Review
                       </>
                     )}
                   </Badge>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-gray-600">Profile Completion</span>
                   <span className="text-sm font-medium">{stats.profileCompletion}%</span>
                 </div>
                 {stats.overallRating > 0 && (
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-600">Overall Rating</span>
                     <div className="flex items-center space-x-1">
                       <Star className="w-4 h-4 text-yellow-400 fill-current" />
                       <span className="text-sm font-medium">{stats.overallRating}</span>
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>

            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">1</span>
                  </div>
                  <span className="text-sm text-gray-600">Complete your institution profile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">2</span>
                  </div>
                  <span className="text-sm text-gray-600">Add your first course</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">3</span>
                  </div>
                  <span className="text-sm text-gray-600">Invite faculty members</span>
                </div>
                <Button className="w-full mt-4" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Setup Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
          </div>
  );
}

// Placeholder components for other dashboard sections
function InquiriesDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Student Inquiries</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Inquiries management will be implemented here.</p>
        </CardContent>
      </Card>
        </div>
  );
}

function StudentsDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Students</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Student management will be implemented here.</p>
        </CardContent>
      </Card>
      </div>
  );
}

function CoursesDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State for data
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal state
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isViewCourseModalOpen, setIsViewCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  
  // Batch form state
  const [batchFormData, setBatchFormData] = useState({
    batchName: '',
    courseId: '',
    startDate: '',
    endDate: '',
    classTimings: '',
    daysOfWeek: [] as string[],
    maxCapacity: '',
    assignedFaculty: '',
    classroomAssignment: '',
    feeSchedule: {
      type: 'fixed',
      amount: '',
      currency: 'USD',
      installments: 1
    }
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Set up real-time subscription for course enrollments
  useEffect(() => {
    let subscription: any = null;

  const setupSubscription = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('No user found for real-time subscription');
      return;
    }

      console.log('Setting up real-time subscription for course enrollments...');

      // Subscribe to course_enrollments changes
      subscription = supabase
        .channel('course_enrollments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'course_enrollments'
          },
          (payload) => {
            console.log('🔄 Course enrollment change detected:', payload);
            console.log('Event type:', payload.eventType);
            console.log('New record:', payload.new);
            console.log('Old record:', payload.old);
            
            // Only refresh if it's an enrollment change (not just any change)
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
              console.log('🔄 Refreshing enrollment data due to enrollment change...');
              refreshEnrollmentData();
            }
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
        });

      return subscription;
    };

    setupSubscription();

    return () => {
      if (subscription) {
        console.log('Unsubscribing from real-time updates...');
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Fetch courses, batches, and enrolled students
      const [coursesData, batchesData, studentsData] = await Promise.all([
        loadCourses(userId),
        loadBatches(userId),
        loadEnrolledStudents(userId)
      ]);
      
      setCourses(coursesData);
      setBatches(batchesData);
      setEnrolledStudents(studentsData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Targeted refresh function for real-time updates
  const refreshEnrollmentData = async () => {
    try {
      setIsRefreshing(true);
      console.log('🔄 Refreshing enrollment data...');
      
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('No user found for refresh');
        return;
      }
      
      // Fetch courses, batches, and enrolled students with fresh data
      const [coursesData, batchesData, studentsData] = await Promise.all([
        loadCourses(userId),
        loadBatches(userId),
        loadEnrolledStudents(userId)
      ]);
      
      setCourses(coursesData);
      setBatches(batchesData);
      setEnrolledStudents(studentsData);
      
      console.log('✅ Enrollment data refreshed successfully');
    } catch (err) {
      console.error('Error refreshing enrollment data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Test function to simulate enrollment changes (for debugging)
  const testEnrollmentUpdate = () => {
    console.log('🧪 Testing enrollment update...');
    refreshEnrollmentData();
  };

  // Test function to debug student profile loading
  const testStudentProfileLoading = async () => {
    console.log('🧪 Testing student profile loading...');
    
    try {
      // First, let's check if there are any enrollments
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('No user found');
        return;
      }

      // Get institution courses
      const { data: courses } = await supabase
        .from('institution_courses' as any)
        .select('id')
        .eq('institution_id', userId);

      if (!courses || courses.length === 0) {
        console.log('No institution courses found');
        return;
      }

      const courseIds = (courses as any[]).map((c: any) => c.id);
      console.log('Course IDs:', courseIds);

      // Get enrollments
      const { data: enrollments } = await supabase
        .from('course_enrollments' as any)
        .select('student_id')
        .in('course_id', courseIds)
        .eq('status', 'enrolled')
        .limit(1);

      if (!enrollments || enrollments.length === 0) {
        console.log('No enrollments found');
        return;
      }

      const studentId = (enrollments as any[])[0].student_id;
      console.log('Testing with student ID:', studentId);

      // Test profile query
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .eq('id', studentId);

      if (error) {
        console.error('Profile query error:', error);
      } else if (!profiles || profiles.length === 0) {
        console.warn('No profile found for student_id:', studentId);
      } else {
        console.log('Profile query success:', profiles[0]);
      }
    } catch (err) {
      console.error('Test error:', err);
    }
  };

  // Test function to compare course vs batch enrollment loading
  const testCourseVsBatchEnrollments = async () => {
    console.log('🧪 Testing course vs batch enrollment loading...');
    
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('No user found');
        return;
      }

      console.log('=== COURSE ENROLLMENT TEST ===');
      // Test course enrollment loading (same as loadCourses)
      const { data: courses } = await supabase
        .from('institution_courses' as any)
        .select('id, title')
        .eq('institution_id', userId);

      if (courses && courses.length > 0) {
        const course = (courses as any[])[0];
        console.log('Testing course:', course.title, 'ID:', course.id);
        
        const { data: courseEnrollments, error: courseError } = await supabase
          .from('course_enrollments' as any)
          .select('id, student_id, status')
          .eq('course_id', course.id)
          .eq('status', 'enrolled');

        console.log('Course enrollments result:', { enrollments: courseEnrollments, error: courseError });
      }

      console.log('=== BATCH ENROLLMENT TEST ===');
      // Test batch enrollment loading (same as loadBatches)
      const { data: batches } = await supabase
        .from('institution_batches' as any)
        .select('id, batch_name, course_id')
        .eq('institution_id', userId);

      if (batches && batches.length > 0) {
        const batch = (batches as any[])[0];
        console.log('Testing batch:', (batch as any).batch_name, 'Course ID:', (batch as any).course_id);
        
        const { data: batchEnrollments, error: batchError } = await supabase
          .from('course_enrollments' as any)
          .select('id, student_id, status')
          .eq('course_id', (batch as any).course_id)
          .eq('status', 'enrolled');

        console.log('Batch enrollments result:', { enrollments: batchEnrollments, error: batchError });
      }

      console.log('=== COMPARISON ===');
      console.log('Courses found:', courses?.length || 0);
      console.log('Batches found:', batches?.length || 0);
      
    } catch (err) {
      console.error('Test error:', err);
    }
  };

  // Expose test functions to window for debugging
  useEffect(() => {
    (window as any).testEnrollmentUpdate = testEnrollmentUpdate;
    (window as any).testStudentProfileLoading = testStudentProfileLoading;
    (window as any).testCourseVsBatchEnrollments = testCourseVsBatchEnrollments;
    return () => {
      delete (window as any).testEnrollmentUpdate;
      delete (window as any).testStudentProfileLoading;
      delete (window as any).testCourseVsBatchEnrollments;
    };
  }, []);

  const loadCourses = async (userId: string) => {
    try {
      console.log('Loading courses for institution user:', userId);
      
      const { data: institutionCourses, error: coursesError } = await supabase
        .from('institution_courses' as any)
        .select('*')
        .eq('institution_id', userId)
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('Error loading institution courses:', coursesError);
        return [];
      }

      console.log('Institution courses loaded:', institutionCourses);
      console.log('Number of courses found:', institutionCourses?.length || 0);
      
      // Load enrollment counts for each course
      const coursesWithEnrollments = await Promise.all(
        (institutionCourses || []).map(async (course: any) => {
          try {
            console.log(`Loading enrollments for course: ${course.title} (ID: ${course.id})`);
            
            const { data: enrollments, error: enrollmentError } = await supabase
              .from('course_enrollments' as any)
              .select('id, student_id, status')
              .eq('course_id', course.id)
              .eq('status', 'enrolled');

            if (enrollmentError) {
              console.error('Error loading enrollments for course:', course.id, enrollmentError);
              return {
                ...course,
                enrollment_count: 0
              };
            }

            console.log(`Found ${(enrollments as any[])?.length || 0} enrollments for course: ${course.title}`);
            console.log('Enrollment details:', enrollments);

            return {
              ...course,
              enrollment_count: (enrollments as any[])?.length || 0
            };
          } catch (error) {
            console.error('Error in enrollment query for course:', course.id, error);
            return {
              ...course,
              enrollment_count: 0
            };
          }
        })
      );
      
      // Additional debugging - check all courses without filter
      const { data: allCourses, error: allCoursesError } = await supabase
        .from('institution_courses' as any)
        .select('id, title, institution_id, created_at')
        .order('created_at', { ascending: false });
      
      console.log('All courses in database (for debugging):', allCourses);
      console.log('Current user ID:', userId);
      
      return coursesWithEnrollments;
    } catch (err) {
      console.error('Error loading courses:', err);
      return [];
    }
  };

  const loadBatches = async (userId: string) => {
    try {
      console.log('Loading batches for institution user:', userId);
      
      const { data: institutionBatches, error: batchesError } = await supabase
        .from('institution_batches' as any)
        .select('*')
        .eq('institution_id', userId)
        .order('created_at', { ascending: false });

      console.log('Raw batches data:', institutionBatches);
      console.log('Batches error:', batchesError);

      if (batchesError) {
        console.error('❌ Error loading institution batches:', batchesError);
        return [];
      }

      if (!institutionBatches || institutionBatches.length === 0) {
        console.log('ℹ️ No batches found for institution user:', userId);
        return [];
      }

      console.log('✅ Found', institutionBatches.length, 'batches for institution user');

      // Load enrollment counts for each batch's course
      const batchesWithEnrollment = await Promise.all(
        (institutionBatches || []).map(async (batch: any) => {
          try {
            // Get the course ID from the batch
            const courseId = batch.course_id;
            console.log(`Loading enrollments for batch: ${batch.batch_name} (Course ID: ${courseId})`);
            
            // Count enrollments for this course
            const { data: enrollments, error: enrollmentError } = await supabase
              .from('course_enrollments' as any)
              .select('id, student_id, status')
              .eq('course_id', courseId)
              .eq('status', 'enrolled');

            if (enrollmentError) {
              console.error('Error loading enrollments for batch course:', courseId, enrollmentError);
              return {
                ...batch,
                current_enrollment: 0
              };
            }

            console.log(`Found ${(enrollments as any[])?.length || 0} enrollments for batch: ${batch.batch_name}`);
            console.log('Batch enrollment details:', enrollments);

            return {
              ...batch,
              current_enrollment: (enrollments as any[])?.length || 0
            };
          } catch (error) {
            console.error('Error in batch enrollment query:', batch.id, error);
            return {
              ...batch,
              current_enrollment: 0
            };
          }
        })
      );

      return batchesWithEnrollment;
    } catch (err) {
      console.error('Error loading batches:', err);
      return [];
    }
  };

  const loadEnrolledStudents = async (userId: string) => {
    try {
      console.log('Loading enrolled students for institution:', userId);
      
      // Step 1: Get all courses for this institution
      const { data: institutionCourses, error: coursesError } = await supabase
        .from('institution_courses' as any)
        .select('id, title, description, category, level, duration')
        .eq('institution_id', userId)
        .eq('status', 'Active');

      if (coursesError) {
        console.error('Error loading institution courses:', coursesError);
        return [];
      }

      if (!institutionCourses || institutionCourses.length === 0) {
        console.log('No institution courses found');
        return [];
      }

      const courseIds = (institutionCourses as any[]).map(course => course.id);
      console.log('Institution course IDs:', courseIds);

      // Step 2: Get enrollments for these courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments' as any)
        .select('*')
        .in('course_id', courseIds)
        .eq('status', 'enrolled')
        .order('enrolled_at', { ascending: false });

      if (enrollmentsError) {
        console.error('Error loading enrollments:', enrollmentsError);
        return [];
      }

      if (!enrollments || enrollments.length === 0) {
        console.log('No enrollments found for institution courses');
        return [];
      }

      console.log('Raw enrollments data:', enrollments);
      console.log('Number of enrollments found:', enrollments?.length || 0);
      
      if (enrollments && enrollments.length > 0) {
        console.log('Sample enrollment:', enrollments[0]);
        console.log('Student IDs in enrollments:', enrollments.map((e: any) => e.student_id));
        
        // Check if any enrollments are self-enrollments (student_id = institution_id)
        const selfEnrollments = enrollments.filter((e: any) => e.student_id === userId);
        const realStudentEnrollments = enrollments.filter((e: any) => e.student_id !== userId);
        
        console.log('Self-enrollments (institution enrolling in own course):', selfEnrollments.length);
        console.log('Real student enrollments:', realStudentEnrollments.length);
        
        // Check for data integrity issue: student_id = institution_id
        if (selfEnrollments.length > 0) {
          console.warn('⚠️ DATA INTEGRITY ISSUE DETECTED:');
          console.warn('Student ID matches Institution ID - this suggests a data modeling problem');
          console.warn('Student ID:', userId);
          console.warn('This means the same user is both student and institution, which is incorrect');
        }
        
        // Test if we can find any of these student IDs in profiles
        const studentIds = enrollments.map((e: any) => e.student_id);
        console.log('Testing profile access for student IDs:', studentIds);
        
        // Try to find at least one profile
        const { data: testProfiles, error: testError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .in('id', studentIds.slice(0, 3)); // Test first 3 student IDs
        
        if (testError) {
          console.error('Test profile query error:', testError);
        } else {
          console.log('Test profile query result:', testProfiles);
        }
      }

      // Step 3: Fetch student profiles and combine with course data
      const studentsWithCourses = await Promise.all(
        (enrollments as any[]).map(async (enrollment: any) => {
          try {
            // Get student profile
            const { data: studentProfiles, error: profileError } = await supabase
              .from('profiles')
              .select('id, full_name, role, created_at, updated_at')
              .eq('id', enrollment.student_id);

            if (profileError) {
              console.error('Error loading student profile for student_id:', enrollment.student_id, profileError);
              console.error('Profile error details:', {
                code: profileError.code,
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint
              });
              return null;
            }

            if (!studentProfiles || studentProfiles.length === 0) {
              console.warn('No profile found for student_id:', enrollment.student_id);
              return null;
            }

            const studentProfile = studentProfiles[0];

            // Find the course details
            const course = (institutionCourses as any[]).find((c: any) => c.id === enrollment.course_id);

            return {
              ...enrollment,
              student_profile: studentProfile,
              course: course,
              student_name: (studentProfile as any)?.full_name || 'Unknown Student',
              student_email: 'No email available', // Email not available in profiles table
              course_title: (course as any)?.title || 'Unknown Course'
            };
          } catch (error) {
            console.error('Error processing enrollment:', error);
            return null;
          }
        })
      );

      // Filter out null results
      const validStudents = studentsWithCourses.filter(student => student !== null);
      console.log('Processed enrolled students:', validStudents);

      return validStudents;
    } catch (err) {
      console.error('Error loading enrolled students:', err);
      return [];
    }
  };


  const handleCreateCourse = async (courseData: any) => {
    try {
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      console.log('Creating course for user:', userId);

      // Upload syllabus file if provided
      let syllabusUrl = null;
      if (courseData.syllabus) {
        const fileExt = courseData.syllabus.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('institution-course-files')
          .upload(fileName, courseData.syllabus);
        
        if (uploadError) {
          console.error('Error uploading syllabus:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('institution-course-files')
            .getPublicUrl(fileName);
          syllabusUrl = publicUrl;
        }
      }

      // Upload course images if provided
      let imageUrls = [];
      if (courseData.images && courseData.images.length > 0) {
        for (const image of courseData.images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('institution-course-images')
            .upload(fileName, image);
          
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('institution-course-images')
              .getPublicUrl(fileName);
            imageUrls.push(publicUrl);
          }
        }
      }

      // Create course in database
      const { data: newCourse, error } = await supabase
        .from('institution_courses' as any)
        .insert([{
          institution_id: userId,
          title: courseData.courseName,
          description: courseData.description,
          category: courseData.category,
          duration: courseData.duration,
          fee_structure: courseData.feeStructure,
          prerequisites: courseData.prerequisites || [],
          syllabus_url: syllabusUrl,
          certificate_details: courseData.certificateDetails,
          images: imageUrls,
          level: 'Beginner', // Default level
          status: 'Active'
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCourses(prev => [newCourse, ...prev]);
      
      console.log('Course created successfully:', newCourse);
      
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course);
    setIsViewCourseModalOpen(true);
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setIsEditCourseModalOpen(true);
  };

  const handleUpdateCourse = async (courseId: string, courseData: any) => {
    try {
      // Upload syllabus file if provided
      let syllabusUrl = null;
      if (courseData.syllabus) {
        const userId = getCurrentUserId();
        if (userId) {
          const fileExt = courseData.syllabus.name.split('.').pop();
          const fileName = `${userId}/${Date.now()}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('institution-course-files')
            .upload(fileName, courseData.syllabus);
          
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('institution-course-files')
              .getPublicUrl(fileName);
            syllabusUrl = publicUrl;
          }
        }
      }

      // Upload course images if provided
      let imageUrls = [];
      if (courseData.images && courseData.images.length > 0) {
        const userId = getCurrentUserId();
        if (userId) {
          for (const image of courseData.images) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('institution-course-images')
              .upload(fileName, image);
            
            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('institution-course-images')
                .getPublicUrl(fileName);
              imageUrls.push(publicUrl);
            }
          }
        }
      }

      // Update course in database
      const updateData: any = {
        title: courseData.courseName,
        description: courseData.description,
        category: courseData.category,
        duration: courseData.duration,
        fee_structure: courseData.feeStructure,
        prerequisites: courseData.prerequisites || [],
        certificate_details: courseData.certificateDetails,
        level: courseData.level || 'Beginner',
        status: courseData.status || 'Active'
      };

      if (syllabusUrl) {
        updateData.syllabus_url = syllabusUrl;
      }

      if (imageUrls.length > 0) {
        updateData.images = imageUrls;
      }

      const { data: updatedCourse, error } = await supabase
        .from('institution_courses' as any)
        .update(updateData)
        .eq('id', courseId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === courseId ? updatedCourse : course
      ));
      
      // Close modals
      setIsEditCourseModalOpen(false);
      setIsViewCourseModalOpen(false);
      setSelectedCourse(null);
      
      console.log('Course updated successfully:', updatedCourse);
      
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const handleCloseModals = () => {
    setIsViewCourseModalOpen(false);
    setIsEditCourseModalOpen(false);
    setSelectedCourse(null);
  };

  const handleCreateBatch = async () => {
    try {
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!batchFormData.batchName || !batchFormData.courseId || !batchFormData.startDate || 
          !batchFormData.endDate || !batchFormData.classTimings || batchFormData.daysOfWeek.length === 0 ||
          !batchFormData.maxCapacity || !batchFormData.assignedFaculty || !batchFormData.classroomAssignment) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Create batch in institution_batches table
      const { error } = await supabase
        .from('institution_batches' as any)
        .insert({
          batch_name: batchFormData.batchName,
          course_id: batchFormData.courseId,
          institution_id: userId,
          start_date: batchFormData.startDate,
          end_date: batchFormData.endDate,
          class_timings: batchFormData.classTimings,
          days_of_week: batchFormData.daysOfWeek,
          max_capacity: parseInt(batchFormData.maxCapacity),
          assigned_faculty: batchFormData.assignedFaculty,
          classroom_assignment: batchFormData.classroomAssignment,
          fee_schedule: batchFormData.feeSchedule,
          price: parseFloat(batchFormData.feeSchedule.amount) || 0,
          status: 'Active'
        });

      if (error) {
        console.error('Error creating batch:', error);
        throw error;
      }

      // Reset form
      setBatchFormData({
        batchName: '',
        courseId: '',
        startDate: '',
        endDate: '',
        classTimings: '',
        daysOfWeek: [],
        maxCapacity: '',
        assignedFaculty: '',
        classroomAssignment: '',
        feeSchedule: {
          type: 'fixed',
          amount: '',
          currency: 'USD',
          installments: 1
        }
      });

      // Close modal
      setIsCreateBatchModalOpen(false);
      
      toast({
        title: "Batch Created",
        description: "Batch has been created successfully.",
      });

      // Refresh batches
      await loadBatches(userId);
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: "Failed to create batch. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title || course.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (course.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'all' || (course.category || '').toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || batch.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string | undefined) => {
    if (!status) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    switch (status.toLowerCase()) {
      case 'active':
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft':
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelColor = (level: string | undefined) => {
    if (!level) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Empty state component for courses
  const CoursesEmptyState = () => (
    <div className="text-center py-12">
      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
      <p className="text-gray-500 mb-6">
        {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
          ? 'No courses match your current filters. Try adjusting your search criteria.'
          : 'Get started by creating your first course.'}
      </p>
      <Button 
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => setIsAddCourseModalOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Course
      </Button>
    </div>
  );

  // Empty state component for batches
  const BatchesEmptyState = () => (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
      <p className="text-gray-500 mb-6">
        {searchQuery || statusFilter !== 'all'
          ? 'No batches match your current filters. Try adjusting your search criteria.'
          : 'Create your first batch to start managing student groups.'}
      </p>
      <Button variant="outline" onClick={() => setIsCreateBatchModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Batch
      </Button>
    </div>
  );

  // Loading state component
  const LoadingState = () => (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-500">Loading courses and batches...</p>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 text-red-400 mb-4">
        <AlertCircle className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading data</h3>
      <p className="text-gray-500 mb-6">{error}</p>
      <Button onClick={fetchData} variant="outline">
        Try Again
      </Button>
    </div>
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Courses & Batches</h2>
          <p className="text-muted-foreground mt-1">
            Manage your courses and batches efficiently
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsAddCourseModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Course
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add New Batch
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses or batches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              {activeTab === 'courses' && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="languages">Languages</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {/* Refresh Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshEnrollmentData}
                disabled={loading || isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Updating...' : 'Refresh'}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="courses" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Courses ({filteredCourses.length})</span>
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Batches ({filteredBatches.length})</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4" />
            <span>Students ({enrolledStudents.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {filteredCourses.length === 0 ? (
            <CoursesEmptyState />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                          {course.title || course.category}
                        </CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {course.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className={getStatusColor(course.status)}>
                        {course.status || 'Unknown'}
                      </Badge>
                      <Badge variant="outline" className={getLevelColor(course.level)}>
                        {course.level || 'All Levels'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{course.duration || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium text-green-600">
                          ₹{course.fee_structure?.amount?.toLocaleString() || 'Free'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {new Date(course.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewCourse(course)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow duration-200 border-0 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{course.title || course.category}</h3>
                          <div className="flex space-x-2">
                            <Badge variant="outline" className={getStatusColor(course.status)}>
                              {course.status || 'Unknown'}
                            </Badge>
                            <Badge variant="outline" className={getLevelColor(course.level)}>
                              {course.level || 'All Levels'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{course.description || 'No description available'}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <p className="font-medium">{course.duration || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <p className="font-medium text-green-600">
                              ₹{course.fee_structure?.amount?.toLocaleString() || 'Free'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Enrolled:</span>
                            <p className="font-medium text-blue-600 flex items-center gap-1">
                              {course.enrollment_count || 0} students
                              {isRefreshing && (
                                <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <p className="font-medium">
                              {new Date(course.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-6">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewCourse(course)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches" className="space-y-6">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Batches</h3>
              <p className="text-sm text-muted-foreground">Manage student batches and class schedules</p>
            </div>
            <Button onClick={() => setIsCreateBatchModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Batch
            </Button>
          </div>

          {filteredBatches.length === 0 ? (
            <BatchesEmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBatches.map((batch) => (
                <Card key={batch.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{batch.batch_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Course: {batch.course?.title || 'Unknown'}</p>
                      </div>
                      <Badge variant="outline">{batch.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{batch.class_timings}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="flex items-center gap-1">
                          Capacity: {batch.current_enrollment || 0}/{batch.max_capacity}
                          {isRefreshing && (
                            <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Faculty: {batch.assigned_faculty}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Enrolled Students</h3>
              <p className="text-sm text-muted-foreground">Manage students enrolled in your courses</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshEnrollmentData}
              disabled={loading || isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Refresh'}
            </Button>
          </div>

          {enrolledStudents.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <UserCheck className="w-12 h-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No Students Enrolled</h3>
                  <p className="text-muted-foreground">
                    Students will appear here once they enroll in your courses.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {enrolledStudents.map((student) => (
                <Card key={`${student.student_id}-${student.course_id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {student.student_name?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-lg">{student.student_name}</h4>
                          <p className="text-muted-foreground">{student.student_email}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="outline" className="text-blue-600">
                              {student.course_title}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Enrolled: {new Date(student.enrolled_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={student.status === 'enrolled' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {student.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onSubmit={handleCreateCourse}
      />

      {/* View Course Modal */}
      <ViewCourseModal
        isOpen={isViewCourseModalOpen}
        onClose={handleCloseModals}
        course={selectedCourse}
        onEdit={() => {
          setIsViewCourseModalOpen(false);
          setIsEditCourseModalOpen(true);
        }}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        isOpen={isEditCourseModalOpen}
        onClose={handleCloseModals}
        course={selectedCourse}
        onSubmit={handleUpdateCourse}
      />

      {/* Create Batch Modal */}
      <Dialog open={isCreateBatchModalOpen} onOpenChange={setIsCreateBatchModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Create New Batch
            </DialogTitle>
            <DialogDescription>
              Create a new batch for your course with detailed scheduling and capacity information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchName">Batch Name/ID *</Label>
                <Input
                  id="batchName"
                  placeholder="e.g., Batch-2024-001, Morning Batch"
                  value={batchFormData.batchName}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, batchName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseId">Course Selection *</Label>
                <Select
                  value={batchFormData.courseId}
                  onValueChange={(value) => setBatchFormData(prev => ({ ...prev, courseId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title || course.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={batchFormData.startDate}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={batchFormData.endDate}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Class Timings and Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classTimings">Class Timings *</Label>
                <Input
                  id="classTimings"
                  placeholder="e.g., 9:00 AM - 11:00 AM"
                  value={batchFormData.classTimings}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, classTimings: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Days of Week *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={batchFormData.daysOfWeek.includes(day)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBatchFormData(prev => ({
                              ...prev,
                              daysOfWeek: [...prev.daysOfWeek, day]
                            }));
                          } else {
                            setBatchFormData(prev => ({
                              ...prev,
                              daysOfWeek: prev.daysOfWeek.filter(d => d !== day)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={day} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Capacity and Faculty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Maximum Capacity *</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  placeholder="e.g., 30"
                  value={batchFormData.maxCapacity}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, maxCapacity: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedFaculty">Assigned Faculty *</Label>
                <Input
                  id="assignedFaculty"
                  placeholder="e.g., Dr. John Smith, Prof. Jane Doe"
                  value={batchFormData.assignedFaculty}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, assignedFaculty: e.target.value }))}
                />
              </div>
            </div>

            {/* Classroom Assignment */}
            <div className="space-y-2">
              <Label htmlFor="classroomAssignment">Classroom Assignment *</Label>
              <Input
                id="classroomAssignment"
                placeholder="e.g., Room 101, Lab A, Online Meeting Room"
                value={batchFormData.classroomAssignment}
                onChange={(e) => setBatchFormData(prev => ({ ...prev, classroomAssignment: e.target.value }))}
              />
            </div>

            {/* Fee Schedule */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Fee Schedule *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feeType">Fee Type</Label>
                  <Select
                    value={batchFormData.feeSchedule.type}
                    onValueChange={(value) => setBatchFormData(prev => ({
                      ...prev,
                      feeSchedule: { ...prev.feeSchedule, type: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="installment">Installment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeAmount">Amount</Label>
                  <Input
                    id="feeAmount"
                    type="number"
                    placeholder="e.g., 5000"
                    value={batchFormData.feeSchedule.amount}
                    onChange={(e) => setBatchFormData(prev => ({
                      ...prev,
                      feeSchedule: { ...prev.feeSchedule, amount: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeCurrency">Currency</Label>
                  <Select
                    value={batchFormData.feeSchedule.currency}
                    onValueChange={(value) => setBatchFormData(prev => ({
                      ...prev,
                      feeSchedule: { ...prev.feeSchedule, currency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {batchFormData.feeSchedule.type === 'installment' && (
                <div className="space-y-2">
                  <Label htmlFor="installments">Number of Installments</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    max="12"
                    value={batchFormData.feeSchedule.installments}
                    onChange={(e) => setBatchFormData(prev => ({
                      ...prev,
                      feeSchedule: { ...prev.feeSchedule, installments: parseInt(e.target.value) || 1 }
                    }))}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateBatchModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateBatch}>
                <Users className="w-4 h-4 mr-2" />
                Create Batch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FacultyDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Faculty Management</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Faculty management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AdmissionsDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admissions</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Admissions management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function FeesDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Fee Management</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Fee management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reports & Analytics</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Reports and analytics will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function MarketingDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Marketing Tools</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Marketing tools will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profile Settings</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Profile settings will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
