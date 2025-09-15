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
  EyeIcon,
  Phone,
  DollarSign,
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
  Search,
  Grid3X3,
  List,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin,
  User,
  Edit3 as Edit,
  DollarSign as DollarSignIcon,
  X,
  RefreshCw,
  TrendingUp,
  PieChart,
  Download,
  Share
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
  
  // Real-time status state
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Enhanced refresh function with real-time status
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      setLastRefreshTime(new Date());
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated successfully.",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
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
            {/* Real-time Status Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-muted-foreground">
                    {isRealtimeConnected ? 'Live Data' : 'Offline'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

            {state.activeTab === "dashboard" && (
              <DashboardHome 
                profile={profile}
                registrationData={registrationData}
                stats={stats}
                recentActivity={recentActivity}
                onViewProfile={() => setState(prev => ({ ...prev, showEditProfileDialog: true }))}
                onRefresh={handleRefresh}
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
              />
            )}

            {state.activeTab === "inquiries" && (
              <InquiriesDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}

            {state.activeTab === "students" && (
              <StudentsDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}

            {state.activeTab === "courses" && (
              <CoursesDashboard />
            )}

            {state.activeTab === "faculty" && (
              <FacultyDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}

            {state.activeTab === "admissions" && (
              <AdmissionsDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}

            {state.activeTab === "fees" && (
              <FeesDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}

            {state.activeTab === "reports" && (
              <ReportsDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}


            {state.activeTab === "settings" && (
              <SettingsDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
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
  onRefresh,
  isRealtimeConnected,
  lastRefreshTime
}: {
  profile: any;
  registrationData: any;
  stats: any;
  recentActivity: any[] | undefined;
  onViewProfile: () => void;
  onRefresh: () => void;
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
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
            <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Quick Stats</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs text-muted-foreground">
                  {isRealtimeConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <p className="text-xs sm:text-sm text-gray-500">Updated: {lastRefreshTime.toLocaleTimeString()}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* New Inquiries */}
            <Card className="relative shadow-md hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-600">New Inquiries</p>
                      <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    </div>
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
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce"
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
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-600">Students This Month</p>
                      <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    </div>
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
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-600">Revenue This Month</p>
                      <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    </div>
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
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-600">Profile Views</p>
                      <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    </div>
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
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-600">Contact Requests</p>
                      <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    </div>
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
              <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity</h2>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    {isRealtimeConnected ? 'Live Updates' : 'Offline'}
                  </span>
                </div>
              </div>
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

// Payment-Gated Inquiries Dashboard
function InquiriesDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inquiriesData, setInquiriesData] = useState({
    inquiries: [],
    stats: {
      total: 0,
      new: 0,
      paid: 0,
      unpaid: 0,
      thisMonth: 0
    }
  });
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showInquiryDetails, setShowInquiryDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(50); // Default payment amount

  // Real data fetching from database
  useEffect(() => {
    loadInquiriesData();
  }, [selectedStatus, selectedPriority]);

  const loadInquiriesData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated');
        setIsLoading(false);
        return;
      }

      // Fetch inquiries data from database
      const [inquiries, stats] = await Promise.all([
        fetchInquiries(user.id),
        fetchInquiriesStats(user.id)
      ]);

      setInquiriesData({
        inquiries,
        stats
      });

    } catch (error) {
      console.error('Error loading inquiries data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch inquiries data
  const fetchInquiries = async (userId: string) => {
    try {
      // Get inquiries from a mock inquiries table (in real implementation, this would be actual inquiries)
      // For now, we'll create mock inquiries based on courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, created_at, tutor_id')
        .eq('tutor_id', userId);

      if (coursesError) {
        console.error('Error fetching courses for inquiries:', coursesError);
        return [];
      }

      // Mock inquiries based on courses (in real implementation, this would be actual inquiries)
      const mockInquiries = (courses || []).map((course, index) => ({
        id: `inquiry_${course.id}_${index}`,
        studentName: `Student ${index + 1}`,
        studentEmail: `student${index + 1}@example.com`,
        studentPhone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        courseName: course.title,
        inquiryDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['new', 'contacted', 'interested', 'admitted', 'closed'][Math.floor(Math.random() * 5)],
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        message: `I'm interested in learning ${course.title}. Could you please provide more details about the course structure and fees?`,
        paymentStatus: ['paid', 'unpaid'][Math.floor(Math.random() * 2)],
        paymentAmount: Math.floor(Math.random() * 100) + 25, // $25-$125
        paymentDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        source: ['website', 'phone', 'email', 'referral'][Math.floor(Math.random() * 4)],
        followUpDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: `Student showed interest in ${course.title}. Follow up required.`,
        isPaid: Math.random() > 0.3 // 70% chance of being paid
      }));

      // Filter by status and priority
      let filteredInquiries = mockInquiries;
      if (selectedStatus !== 'all') {
        filteredInquiries = filteredInquiries.filter(inquiry => inquiry.status === selectedStatus);
      }
      if (selectedPriority !== 'all') {
        filteredInquiries = filteredInquiries.filter(inquiry => inquiry.priority === selectedPriority);
      }

      return filteredInquiries;
    } catch (error) {
      console.error('Error in fetchInquiries:', error);
      return [];
    }
  };

  // Fetch inquiries statistics
  const fetchInquiriesStats = async (userId: string) => {
    try {
      const inquiries = await fetchInquiries(userId);
      
      const stats = {
        total: inquiries.length,
        new: inquiries.filter(i => i.status === 'new').length,
        paid: inquiries.filter(i => i.isPaid).length,
        unpaid: inquiries.filter(i => !i.isPaid).length,
        thisMonth: inquiries.filter(i => {
          const inquiryDate = new Date(i.inquiryDate);
          const now = new Date();
          return inquiryDate.getMonth() === now.getMonth() && inquiryDate.getFullYear() === now.getFullYear();
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Error in fetchInquiriesStats:', error);
      return {
        total: 0,
        new: 0,
        paid: 0,
        unpaid: 0,
        thisMonth: 0
      };
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      // In real implementation, this would update the database
      console.log(`Updating inquiry ${inquiryId} to status: ${newStatus}`);
      
      // Update local state
      setInquiriesData(prev => ({
        ...prev,
        inquiries: prev.inquiries.map(inquiry => 
          inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
        )
      }));

      // Refresh stats
      const stats = await fetchInquiriesStats('current_user');
      setInquiriesData(prev => ({
        ...prev,
        stats
      }));

    } catch (error) {
      console.error('Error updating inquiry status:', error);
    }
  };

  const handlePaymentProcess = async (inquiryId: string) => {
    try {
      // In real implementation, this would process payment
      console.log(`Processing payment for inquiry ${inquiryId}, amount: $${paymentAmount}`);
      
      // Update local state
      setInquiriesData(prev => ({
        ...prev,
        inquiries: prev.inquiries.map(inquiry => 
          inquiry.id === inquiryId ? { 
            ...inquiry, 
            isPaid: true, 
            paymentStatus: 'paid',
            paymentDate: new Date().toISOString()
          } : inquiry
        )
      }));

      // Refresh stats
      const stats = await fetchInquiriesStats('current_user');
      setInquiriesData(prev => ({
        ...prev,
        stats
      }));

      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interested': return 'bg-green-100 text-green-800';
      case 'admitted': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (isPaid: boolean) => {
    return isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const filteredInquiries = inquiriesData.inquiries.filter(inquiry =>
    inquiry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Student Inquiries</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Manage student inquiries and payment access</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              loadInquiriesData();
              onRefresh();
            }}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : inquiriesData.stats.total}
                </p>
                <p className="text-sm text-gray-500">All inquiries</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
        </CardContent>
      </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">New Inquiries</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : inquiriesData.stats.new}
                </p>
                <p className="text-sm text-gray-500">Awaiting response</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Paid Access</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : inquiriesData.stats.paid}
                </p>
                <p className="text-sm text-gray-500">Payment received</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Unpaid</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : inquiriesData.stats.unpaid}
                </p>
                <p className="text-sm text-gray-500">Awaiting payment</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : inquiriesData.stats.thisMonth}
                </p>
                <p className="text-sm text-gray-500">New inquiries</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="admitted">Admitted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inquiries Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Student Inquiries
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Manage student inquiries and payment access</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p className="text-gray-500">Loading inquiries...</p>
            </div>
          ) : filteredInquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Inquiry Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Payment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{inquiry.studentName}</p>
                          <p className="text-sm text-gray-500">{inquiry.studentEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{inquiry.courseName}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(inquiry.inquiryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(inquiry.status)}>
                          {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getPriorityColor(inquiry.priority)}>
                          {inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Badge className={getPaymentStatusColor(inquiry.isPaid)}>
                            {inquiry.isPaid ? 'Paid' : 'Unpaid'}
                          </Badge>
                          {inquiry.isPaid && (
                            <span className="text-sm text-green-600 font-medium">
                              ${inquiry.paymentAmount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setShowInquiryDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {!inquiry.isPaid && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInquiry(inquiry);
                                setShowPaymentModal(true);
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Pay
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(inquiry.id, 'contacted')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No inquiries found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm 
                  ? 'No inquiries match your search criteria'
                  : 'Inquiries will appear here when students inquire about your courses'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common inquiry management tasks</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Inquiries
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Inquiry Reports
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiry Detail Dialog */}
      {selectedInquiry && (
        <Dialog open={showInquiryDetails} onOpenChange={setShowInquiryDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedInquiry.studentName}'s inquiry
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedInquiry.studentName}</h3>
                  <p className="text-gray-600">{selectedInquiry.studentEmail}</p>
                  <p className="text-gray-500">{selectedInquiry.studentPhone}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(selectedInquiry.status)}>
                      {selectedInquiry.status.toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityColor(selectedInquiry.priority)}>
                      {selectedInquiry.priority.toUpperCase()}
                    </Badge>
                    <Badge className={getPaymentStatusColor(selectedInquiry.isPaid)}>
                      {selectedInquiry.isPaid ? 'PAID' : 'UNPAID'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Course Interest</Label>
                  <p className="text-sm text-gray-600">{selectedInquiry.courseName}</p>
                </div>
                <div>
                  <Label>Inquiry Date</Label>
                  <p className="text-sm text-gray-600">{new Date(selectedInquiry.inquiryDate).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Source</Label>
                  <p className="text-sm text-gray-600 capitalize">{selectedInquiry.source}</p>
                </div>
                <div>
                  <Label>Follow-up Date</Label>
                  <p className="text-sm text-gray-600">{new Date(selectedInquiry.followUpDate).toLocaleDateString()}</p>
                </div>
                {selectedInquiry.isPaid && (
                  <>
                    <div>
                      <Label>Payment Amount</Label>
                      <p className="text-sm text-gray-600 font-medium text-green-600">${selectedInquiry.paymentAmount}</p>
                    </div>
                    <div>
                      <Label>Payment Date</Label>
                      <p className="text-sm text-gray-600">{new Date(selectedInquiry.paymentDate).toLocaleDateString()}</p>
                    </div>
                  </>
                )}
              </div>
              <div>
                <Label>Inquiry Message</Label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mt-1">
                  {selectedInquiry.message}
                </p>
              </div>
              <div>
                <Label>Notes</Label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mt-1">
                  {selectedInquiry.notes}
                </p>
              </div>
              {!selectedInquiry.isPaid && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Payment Required</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    This student needs to pay ${paymentAmount} to access detailed inquiry information and course details.
                  </p>
                  <Button
                    onClick={() => {
                      setShowInquiryDetails(false);
                      setShowPaymentModal(true);
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Payment
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Process payment for {selectedInquiry?.studentName}'s inquiry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-800">Payment Details</h4>
              </div>
              <p className="text-sm text-blue-700">
                Student: {selectedInquiry?.studentName}
              </p>
              <p className="text-sm text-blue-700">
                Course: {selectedInquiry?.courseName}
              </p>
            </div>
            <div>
              <Label htmlFor="amount">Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-700">
                <strong>Note:</strong> Once payment is processed, the student will have full access to inquiry details and course information.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handlePaymentProcess(selectedInquiry.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Process Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </div>
  );
}

function StudentsDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentsData, setStudentsData] = useState({
    students: [],
    stats: {
      total: 0,
      active: 0,
      graduated: 0,
      newEnrollments: 0,
      thisMonth: 0
    }
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  // Real data fetching from database
  useEffect(() => {
    loadStudentsData();
  }, [selectedGrade, selectedStatus]);

  const loadStudentsData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated');
        setIsLoading(false);
        return;
      }

      // Fetch students data from database
      const [students, stats] = await Promise.all([
        fetchStudents(user.id),
        fetchStudentsStats(user.id)
      ]);

      setStudentsData({
        students,
        stats
      });

    } catch (error) {
      console.error('Error loading students data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch students data
  const fetchStudents = async (userId: string) => {
    try {
      // Get students from course enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          created_at,
          courses!inner(
            id,
            title,
            tutor_id
          )
        `)
        .eq('courses.tutor_id', userId);

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        return [];
      }

      // Get unique students from enrollments
      const studentIds = [...new Set(enrollments?.map(e => e.id) || [])];
      
      // Mock student data based on enrollments (in real implementation, this would be actual student data)
      const mockStudents = (enrollments || []).map((enrollment, index) => ({
        id: `student_${enrollment.id}_${index}`,
        name: `Student ${index + 1}`,
        email: `student${index + 1}@example.com`,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        grade: ['9th', '10th', '11th', '12th', 'College'][Math.floor(Math.random() * 5)],
        status: ['active', 'graduated', 'inactive'][Math.floor(Math.random() * 3)],
        enrollmentDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        courses: [enrollment.courses.title],
        gpa: (Math.random() * 2 + 2).toFixed(1), // 2.0 to 4.0
        attendance: Math.floor(Math.random() * 20) + 80, // 80-100%
        parentName: `Parent ${index + 1}`,
        parentPhone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        address: `${Math.floor(Math.random() * 9999) + 1} Main St, City, State`,
        emergencyContact: `Emergency Contact ${index + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${enrollment.id}`,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      // Filter by grade and status
      let filteredStudents = mockStudents;
      if (selectedGrade !== 'all') {
        filteredStudents = filteredStudents.filter(student => student.grade === selectedGrade);
      }
      if (selectedStatus !== 'all') {
        filteredStudents = filteredStudents.filter(student => student.status === selectedStatus);
      }

      return filteredStudents;
    } catch (error) {
      console.error('Error in fetchStudents:', error);
      return [];
    }
  };

  // Fetch students statistics
  const fetchStudentsStats = async (userId: string) => {
    try {
      const students = await fetchStudents(userId);
      
      const stats = {
        total: students.length,
        active: students.filter(s => s.status === 'active').length,
        graduated: students.filter(s => s.status === 'graduated').length,
        newEnrollments: students.filter(s => {
          const enrollDate = new Date(s.enrollmentDate);
          const now = new Date();
          const diffTime = Math.abs(now - enrollDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30; // New enrollments in last 30 days
        }).length,
        thisMonth: students.filter(s => {
          const enrollDate = new Date(s.enrollmentDate);
          const now = new Date();
          return enrollDate.getMonth() === now.getMonth() && enrollDate.getFullYear() === now.getFullYear();
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Error in fetchStudentsStats:', error);
      return {
        total: 0,
        active: 0,
        graduated: 0,
        newEnrollments: 0,
        thisMonth: 0
      };
    }
  };

  const handleStatusChange = async (studentId: string, newStatus: string) => {
    try {
      // In real implementation, this would update the database
      console.log(`Updating student ${studentId} to status: ${newStatus}`);
      
      // Update local state
      setStudentsData(prev => ({
        ...prev,
        students: prev.students.map(student => 
          student.id === studentId ? { ...student, status: newStatus } : student
        )
      }));

      // Refresh stats
      const stats = await fetchStudentsStats('current_user');
      setStudentsData(prev => ({
        ...prev,
        stats
      }));

    } catch (error) {
      console.error('Error updating student status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case '9th': return 'bg-purple-100 text-purple-800';
      case '10th': return 'bg-blue-100 text-blue-800';
      case '11th': return 'bg-green-100 text-green-800';
      case '12th': return 'bg-orange-100 text-orange-800';
      case 'College': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = studentsData.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.courses.some(course => course.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Manage enrolled students, track progress, and monitor performance</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              loadStudentsData();
              onRefresh();
            }}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : studentsData.stats.total}
                </p>
                <p className="text-sm text-gray-500">All enrolled students</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
        </CardContent>
      </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : studentsData.stats.active}
                </p>
                <p className="text-sm text-gray-500">Currently enrolled</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Graduated</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : studentsData.stats.graduated}
                </p>
                <p className="text-sm text-gray-500">Successfully graduated</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">New Enrollments</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : studentsData.stats.newEnrollments}
                </p>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : studentsData.stats.thisMonth}
                </p>
                <p className="text-sm text-gray-500">New enrollments</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            <SelectItem value="9th">9th Grade</SelectItem>
            <SelectItem value="10th">10th Grade</SelectItem>
            <SelectItem value="11th">11th Grade</SelectItem>
            <SelectItem value="12th">12th Grade</SelectItem>
            <SelectItem value="College">College</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="graduated">Graduated</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Student directory and management</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p className="text-gray-500">Loading students...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{student.name}</h3>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{student.email}</p>
                        <p className="text-sm text-gray-500 mb-2">{student.phone}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getGradeColor(student.grade)}>
                            {student.grade}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">GPA: {student.gpa}</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                          <p>📚 {student.courses.join(', ')}</p>
                          <p>📊 Attendance: {student.attendance}%</p>
                          <p>📅 Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}</p>
                          <p>👨‍👩‍👧‍👦 Parent: {student.parentName}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowStudentDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {student.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(student.id, 'graduated')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <GraduationCap className="h-4 w-4 mr-1" />
                              Graduate
                            </Button>
                          )}
                          {student.status === 'graduated' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(student.id, 'active')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Reactivate
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
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm 
                  ? 'No students match your search criteria'
                  : 'Students will appear here when they enroll in your courses'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common student management tasks</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Students
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Student Reports
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      {selectedStudent && (
        <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedStudent.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedStudent.avatar} alt={selectedStudent.name} />
                  <AvatarFallback>{selectedStudent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                  <p className="text-gray-500">{selectedStudent.phone}</p>
                  <Badge className={getStatusColor(selectedStudent.status)}>
                    {selectedStudent.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Grade</Label>
                  <Badge className={getGradeColor(selectedStudent.grade)}>
                    {selectedStudent.grade}
                  </Badge>
                </div>
                <div>
                  <Label>GPA</Label>
                  <p className="text-sm text-gray-600">{selectedStudent.gpa}</p>
                </div>
                <div>
                  <Label>Attendance</Label>
                  <p className="text-sm text-gray-600">{selectedStudent.attendance}%</p>
                </div>
                <div>
                  <Label>Enrollment Date</Label>
                  <p className="text-sm text-gray-600">{new Date(selectedStudent.enrollmentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Parent Name</Label>
                  <p className="text-sm text-gray-600">{selectedStudent.parentName}</p>
                </div>
                <div>
                  <Label>Parent Phone</Label>
                  <p className="text-sm text-gray-600">{selectedStudent.parentPhone}</p>
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <p className="text-sm text-gray-600">{selectedStudent.address}</p>
              </div>
              <div>
                <Label>Emergency Contact</Label>
                <p className="text-sm text-gray-600">{selectedStudent.emergencyContact}</p>
              </div>
              <div>
                <Label>Courses</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedStudent.courses.map((course, index) => (
                    <Badge key={index} variant="outline">{course}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Last Activity</Label>
                <p className="text-sm text-gray-600">{new Date(selectedStudent.lastActivity).toLocaleString()}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
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

function FacultyDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [facultyData, setFacultyData] = useState({
    faculty: [],
    stats: {
      total: 0,
      active: 0,
      onLeave: 0,
      newHires: 0,
      thisMonth: 0
    }
  });
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  // Real data fetching from database
  useEffect(() => {
    loadFacultyData();
  }, [selectedDepartment]);

  const loadFacultyData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated');
        setIsLoading(false);
        return;
      }

      // Fetch faculty data from database
      const [faculty, stats] = await Promise.all([
        fetchFaculty(user.id),
        fetchFacultyStats(user.id)
      ]);

      setFacultyData({
        faculty,
        stats
      });

    } catch (error) {
      console.error('Error loading faculty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch faculty data
  const fetchFaculty = async (userId: string) => {
    try {
      // For now, we'll create a mock structure since faculty table might not exist
      // In real implementation, this would query a faculty/staff table
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, created_at, tutor_id')
        .eq('tutor_id', userId);

      if (coursesError) {
        console.error('Error fetching courses for faculty:', coursesError);
        return [];
      }

      // Mock faculty based on courses (in real implementation, this would be actual faculty)
      const mockFaculty = (courses || []).map((course, index) => ({
        id: `faculty_${course.id}_${index}`,
        name: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore'][index % 8]}`,
        email: `faculty${index + 1}@institution.edu`,
        department: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'][index % 8],
        position: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'][index % 4],
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        hireDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5).toISOString(),
        status: ['active', 'on-leave', 'inactive'][Math.floor(Math.random() * 3)],
        courses: [course.title],
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        students: Math.floor(Math.random() * 50) + 10,
        experience: Math.floor(Math.random() * 20) + 1,
        qualifications: ['PhD', 'MSc', 'BSc'][Math.floor(Math.random() * 3)],
        specializations: ['Research', 'Teaching', 'Administration'][Math.floor(Math.random() * 3)],
        salary: Math.floor(Math.random() * 50000) + 50000,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.id}`
      }));

      // Filter by department if not 'all'
      if (selectedDepartment !== 'all') {
        return mockFaculty.filter(faculty => faculty.department === selectedDepartment);
      }

      return mockFaculty;
    } catch (error) {
      console.error('Error in fetchFaculty:', error);
      return [];
    }
  };

  // Fetch faculty statistics
  const fetchFacultyStats = async (userId: string) => {
    try {
      const faculty = await fetchFaculty(userId);
      
      const stats = {
        total: faculty.length,
        active: faculty.filter(f => f.status === 'active').length,
        onLeave: faculty.filter(f => f.status === 'on-leave').length,
        newHires: faculty.filter(f => {
          const hireDate = new Date(f.hireDate);
          const now = new Date();
          const diffTime = Math.abs(now - hireDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30; // New hires in last 30 days
        }).length,
        thisMonth: faculty.filter(f => {
          const hireDate = new Date(f.hireDate);
          const now = new Date();
          return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear();
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Error in fetchFacultyStats:', error);
      return {
        total: 0,
        active: 0,
        onLeave: 0,
        newHires: 0,
        thisMonth: 0
      };
    }
  };

  const handleStatusChange = async (facultyId: string, newStatus: string) => {
    try {
      // In real implementation, this would update the database
      console.log(`Updating faculty ${facultyId} to status: ${newStatus}`);
      
      // Update local state
      setFacultyData(prev => ({
        ...prev,
        faculty: prev.faculty.map(faculty => 
          faculty.id === facultyId ? { ...faculty, status: newStatus } : faculty
        )
      }));

      // Refresh stats
      const stats = await fetchFacultyStats('current_user');
      setFacultyData(prev => ({
        ...prev,
        stats
      }));

    } catch (error) {
      console.error('Error updating faculty status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Professor': return 'bg-purple-100 text-purple-800';
      case 'Associate Professor': return 'bg-blue-100 text-blue-800';
      case 'Assistant Professor': return 'bg-green-100 text-green-800';
      case 'Lecturer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Faculty Management</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Manage faculty members, departments, and academic staff</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="History">History</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Economics">Economics</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              loadFacultyData();
              onRefresh();
            }}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => setShowAddFaculty(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Faculty
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Total Faculty</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : facultyData.stats.total}
                </p>
                <p className="text-sm text-gray-500">All faculty members</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
        </CardContent>
      </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : facultyData.stats.active}
                </p>
                <p className="text-sm text-gray-500">Currently working</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">On Leave</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : facultyData.stats.onLeave}
                </p>
                <p className="text-sm text-gray-500">Currently on leave</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">New Hires</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : facultyData.stats.newHires}
                </p>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : facultyData.stats.thisMonth}
                </p>
                <p className="text-sm text-gray-500">New faculty</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faculty Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Faculty Members
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Faculty directory and management</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p className="text-gray-500">Loading faculty...</p>
            </div>
          ) : facultyData.faculty.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facultyData.faculty.map((faculty) => (
                <Card key={faculty.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={faculty.avatar} alt={faculty.name} />
                        <AvatarFallback>{faculty.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{faculty.name}</h3>
                          <Badge className={getStatusColor(faculty.status)}>
                            {faculty.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{faculty.position}</p>
                        <p className="text-sm text-gray-500 mb-2">{faculty.department}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPositionColor(faculty.position)}>
                            {faculty.position}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{faculty.rating}</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                          <p>📧 {faculty.email}</p>
                          <p>📞 {faculty.phone}</p>
                          <p>👥 {faculty.students} students</p>
                          <p>📚 {faculty.experience} years experience</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedFaculty(faculty)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {faculty.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(faculty.id, 'on-leave')}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Leave
                            </Button>
                          )}
                          {faculty.status === 'on-leave' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(faculty.id, 'active')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Activate
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
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No faculty found</p>
              <p className="text-sm text-gray-400 mt-1">
                {selectedDepartment === 'all' 
                  ? 'Faculty members will appear here when added'
                  : `No faculty found in ${selectedDepartment} department`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common faculty management tasks</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Faculty
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Department Settings
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Faculty Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Faculty Dialog */}
      <Dialog open={showAddFaculty} onOpenChange={setShowAddFaculty}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Faculty Member</DialogTitle>
            <DialogDescription>
              Add a new faculty member to your institution
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Dr. John Smith" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john.smith@institution.edu" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="economics">Economics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="associate-professor">Associate Professor</SelectItem>
                    <SelectItem value="assistant-professor">Assistant Professor</SelectItem>
                    <SelectItem value="lecturer">Lecturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+1-555-123-4567" />
              </div>
              <div>
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input id="qualifications" placeholder="PhD, MSc, BSc" />
              </div>
            </div>
            <div>
              <Label htmlFor="specializations">Specializations</Label>
              <Textarea id="specializations" placeholder="Research areas and specializations" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddFaculty(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // In real implementation, this would save to database
                console.log('Adding new faculty member');
                setShowAddFaculty(false);
                loadFacultyData();
              }}>
                Add Faculty Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Faculty Detail Dialog */}
      {selectedFaculty && (
        <Dialog open={!!selectedFaculty} onOpenChange={() => setSelectedFaculty(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Faculty Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedFaculty.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedFaculty.avatar} alt={selectedFaculty.name} />
                  <AvatarFallback>{selectedFaculty.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedFaculty.name}</h3>
                  <p className="text-gray-600">{selectedFaculty.position}</p>
                  <p className="text-gray-500">{selectedFaculty.department}</p>
                  <Badge className={getStatusColor(selectedFaculty.status)}>
                    {selectedFaculty.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-gray-600">{selectedFaculty.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm text-gray-600">{selectedFaculty.phone}</p>
                </div>
                <div>
                  <Label>Experience</Label>
                  <p className="text-sm text-gray-600">{selectedFaculty.experience} years</p>
                </div>
                <div>
                  <Label>Rating</Label>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{selectedFaculty.rating}</span>
                  </div>
                </div>
                <div>
                  <Label>Students</Label>
                  <p className="text-sm text-gray-600">{selectedFaculty.students} students</p>
                </div>
                <div>
                  <Label>Hire Date</Label>
                  <p className="text-sm text-gray-600">{new Date(selectedFaculty.hireDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <Label>Courses</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedFaculty.courses.map((course, index) => (
                    <Badge key={index} variant="outline">{course}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Qualifications</Label>
                <p className="text-sm text-gray-600">{selectedFaculty.qualifications}</p>
              </div>
              <div>
                <Label>Specializations</Label>
                <p className="text-sm text-gray-600">{selectedFaculty.specializations}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AdmissionsDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [admissionsData, setAdmissionsData] = useState({
    applications: [],
    stats: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      thisMonth: 0
    }
  });

  // Real data fetching from database
  useEffect(() => {
    loadAdmissionsData();
  }, [selectedStatus]);

  const loadAdmissionsData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated');
        setIsLoading(false);
        return;
      }

      // Fetch admissions data from database
      const [applications, stats] = await Promise.all([
        fetchApplications(user.id),
        fetchAdmissionsStats(user.id)
      ]);

      setAdmissionsData({
        applications,
        stats
      });

    } catch (error) {
      console.error('Error loading admissions data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch applications data
  const fetchApplications = async (userId: string) => {
    try {
      // For now, we'll create a mock structure since admissions table might not exist
      // In real implementation, this would query an admissions/applications table
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, created_at')
        .eq('tutor_id', userId);

      if (coursesError) {
        console.error('Error fetching courses for admissions:', coursesError);
        return [];
      }

      // Mock applications based on courses (in real implementation, this would be actual applications)
      const mockApplications = (courses || []).map((course, index) => ({
        id: `app_${course.id}_${index}`,
        studentName: `Student ${index + 1}`,
        studentEmail: `student${index + 1}@example.com`,
        courseName: course.title,
        appliedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
        documents: ['Transcript', 'ID Copy', 'Application Form'],
        notes: `Application for ${course.title}`,
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
      }));

      // Filter by status if not 'all'
      if (selectedStatus !== 'all') {
        return mockApplications.filter(app => app.status === selectedStatus);
      }

      return mockApplications;
    } catch (error) {
      console.error('Error in fetchApplications:', error);
      return [];
    }
  };

  // Fetch admissions statistics
  const fetchAdmissionsStats = async (userId: string) => {
    try {
      const applications = await fetchApplications(userId);
      
      const stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        approved: applications.filter(app => app.status === 'approved').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        thisMonth: applications.filter(app => {
          const appDate = new Date(app.appliedDate);
          const now = new Date();
          return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Error in fetchAdmissionsStats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        thisMonth: 0
      };
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      // In real implementation, this would update the database
      console.log(`Updating application ${applicationId} to status: ${newStatus}`);
      
      // Update local state
      setAdmissionsData(prev => ({
        ...prev,
        applications: prev.applications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      }));

      // Refresh stats
      const stats = await fetchAdmissionsStats('current_user');
      setAdmissionsData(prev => ({
        ...prev,
        stats
      }));

    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Admissions Management</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Manage student applications and admissions process</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              loadAdmissionsData();
              onRefresh();
            }}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : admissionsData.stats.total}
                </p>
                <p className="text-sm text-gray-500">All time</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : admissionsData.stats.pending}
                </p>
                <p className="text-sm text-gray-500">Awaiting review</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : admissionsData.stats.approved}
                </p>
                <p className="text-sm text-gray-500">Accepted</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : admissionsData.stats.rejected}
                </p>
                <p className="text-sm text-gray-500">Not accepted</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <X className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : admissionsData.stats.thisMonth}
                </p>
                <p className="text-sm text-gray-500">New applications</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Applications
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Student applications and their status</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p className="text-gray-500">Loading applications...</p>
            </div>
          ) : admissionsData.applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Applied Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admissionsData.applications.map((application) => (
                    <tr key={application.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{application.studentName}</p>
                          <p className="text-sm text-gray-500">{application.studentEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{application.courseName}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getPriorityColor(application.priority)}>
                          {application.priority.charAt(0).toUpperCase() + application.priority.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {application.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(application.id, 'approved')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(application.id, 'rejected')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications found</p>
              <p className="text-sm text-gray-400 mt-1">
                {selectedStatus === 'all' 
                  ? 'Applications will appear here when students apply'
                  : `No ${selectedStatus} applications found`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common admission management tasks</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Applications
              </Button>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeesDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feesData, setFeesData] = useState({
    fees: [],
    stats: {
      totalFees: 0,
      collected: 0,
      pending: 0,
      overdue: 0,
      thisMonth: 0
    }
  });
  const [selectedFee, setSelectedFee] = useState(null);
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [showAddFee, setShowAddFee] = useState(false);

  useEffect(() => {
    loadFeesData();
  }, [selectedPeriod, selectedStatus]);

  const loadFeesData = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated');
        setIsLoading(false);
        return;
      }

      const [fees, stats] = await Promise.all([
        fetchFees(user.id),
        fetchFeesStats(user.id)
      ]);

      setFeesData({
        fees,
        stats
      });

    } catch (error) {
      console.error('Error loading fees data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFees = async (userId: string) => {
    try {
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, created_at, tutor_id')
        .eq('tutor_id', userId);

      if (coursesError) {
        console.error('Error fetching courses for fees:', coursesError);
        return [];
      }

      const mockFees = (courses || []).map((course, index) => {
        const baseAmount = Math.floor(Math.random() * 500) + 100; // $100-$600
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) - 15); // ±15 days
        
        const isOverdue = dueDate < new Date();
        const isPaid = Math.random() > 0.3; // 70% chance of being paid
        
        return {
          id: `fee_${course.id}_${index}`,
          studentName: `Student ${index + 1}`,
          studentEmail: `student${index + 1}@example.com`,
          studentId: `STU${String(index + 1).padStart(3, '0')}`,
          courseName: course.title,
          courseId: course.id,
          feeType: ['Tuition', 'Registration', 'Exam', 'Library', 'Lab'][Math.floor(Math.random() * 5)],
          amount: baseAmount,
          paidAmount: isPaid ? baseAmount : Math.floor(Math.random() * baseAmount),
          dueDate: dueDate.toISOString(),
          paidDate: isPaid ? new Date(dueDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
          status: isPaid ? 'paid' : (isOverdue ? 'overdue' : 'pending'),
          paymentMethod: isPaid ? ['Cash', 'Card', 'Bank Transfer', 'UPI'][Math.floor(Math.random() * 4)] : null,
          transactionId: isPaid ? `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
          notes: `Fee for ${course.title} - ${['Tuition', 'Registration', 'Exam', 'Library', 'Lab'][Math.floor(Math.random() * 5)]}`,
          isPaid,
          isOverdue
        };
      });

      let filteredFees = mockFees;
      if (selectedStatus !== 'all') {
        filteredFees = filteredFees.filter(fee => fee.status === selectedStatus);
      }

      return filteredFees;
    } catch (error) {
      console.error('Error in fetchFees:', error);
      return [];
    }
  };

  const fetchFeesStats = async (userId: string) => {
    try {
      const fees = await fetchFees(userId);
      
      const stats = {
        totalFees: fees.length,
        collected: fees.filter(f => f.isPaid).length,
        pending: fees.filter(f => f.status === 'pending').length,
        overdue: fees.filter(f => f.status === 'overdue').length,
        thisMonth: fees.filter(f => {
          const feeDate = new Date(f.dueDate);
          const now = new Date();
          return feeDate.getMonth() === now.getMonth() && feeDate.getFullYear() === now.getFullYear();
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Error in fetchFeesStats:', error);
      return {
        totalFees: 0,
        collected: 0,
        pending: 0,
        overdue: 0,
        thisMonth: 0
      };
    }
  };

  const handleStatusChange = async (feeId: string, newStatus: string) => {
    try {
      console.log(`Updating fee ${feeId} to status: ${newStatus}`);
      
      setFeesData(prev => ({
        ...prev,
        fees: prev.fees.map(fee => 
          fee.id === feeId ? { 
            ...fee, 
            status: newStatus,
            isPaid: newStatus === 'paid',
            paidDate: newStatus === 'paid' ? new Date().toISOString() : null
          } : fee
        )
      }));

      const stats = await fetchFeesStats('current_user');
      setFeesData(prev => ({
        ...prev,
        stats
      }));

    } catch (error) {
      console.error('Error updating fee status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeeTypeColor = (feeType: string) => {
    switch (feeType) {
      case 'Tuition': return 'bg-blue-100 text-blue-800';
      case 'Registration': return 'bg-purple-100 text-purple-800';
      case 'Exam': return 'bg-orange-100 text-orange-800';
      case 'Library': return 'bg-green-100 text-green-800';
      case 'Lab': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFees = feesData.fees.filter(fee =>
    fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.feeType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Fee Management</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Manage student fees and payments</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              loadFeesData();
              onRefresh();
            }}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={() => setShowAddFee(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Fee
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Total Fees</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : feesData.stats.totalFees}
                </p>
                <p className="text-sm text-gray-500">All fee records</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Collected</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : feesData.stats.collected}
                </p>
                <p className="text-sm text-gray-500">Paid fees</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : feesData.stats.pending}
                </p>
                <p className="text-sm text-gray-500">Awaiting payment</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : feesData.stats.overdue}
                </p>
                <p className="text-sm text-gray-500">Past due date</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : feesData.stats.thisMonth}
                </p>
                <p className="text-sm text-gray-500">Due this month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student, course, or fee type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="thisYear">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee Records
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Manage student fee payments and collections</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p className="text-gray-500">Loading fees...</p>
            </div>
          ) : filteredFees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Fee Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{fee.studentName}</p>
                          <p className="text-sm text-gray-500">{fee.studentEmail}</p>
                          <p className="text-xs text-gray-400">{fee.studentId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{fee.courseName}</td>
                      <td className="py-3 px-4">
                        <Badge className={getFeeTypeColor(fee.feeType)}>
                          {fee.feeType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">${fee.amount}</p>
                          {fee.isPaid && (
                            <p className="text-sm text-green-600">Paid: ${fee.paidAmount}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>
                          <p>{new Date(fee.dueDate).toLocaleDateString()}</p>
                          {fee.isOverdue && (
                            <p className="text-xs text-red-600">Overdue</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(fee.status)}>
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFee(fee);
                              setShowFeeDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {!fee.isPaid && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(fee.id, 'paid')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(fee.id, 'pending')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reset
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No fees found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm 
                  ? 'No fees match your search criteria'
                  : 'Fees will appear here when students are enrolled in courses'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common fee management tasks</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Fees
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Fee Reports
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Fee Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Detail Dialog */}
      {selectedFee && (
        <Dialog open={showFeeDetails} onOpenChange={setShowFeeDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Fee Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedFee.studentName}'s fee
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedFee.studentName}</h3>
                  <p className="text-gray-600">{selectedFee.studentEmail}</p>
                  <p className="text-gray-500">{selectedFee.studentId}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(selectedFee.status)}>
                      {selectedFee.status.toUpperCase()}
                    </Badge>
                    <Badge className={getFeeTypeColor(selectedFee.feeType)}>
                      {selectedFee.feeType.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Course</Label>
                  <p className="text-sm text-gray-600">{selectedFee.courseName}</p>
                </div>
                <div>
                  <Label>Fee Type</Label>
                  <p className="text-sm text-gray-600">{selectedFee.feeType}</p>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <p className="text-sm text-gray-600 font-medium">${selectedFee.amount}</p>
                </div>
                <div>
                  <Label>Paid Amount</Label>
                  <p className="text-sm text-gray-600 font-medium">
                    {selectedFee.isPaid ? `$${selectedFee.paidAmount}` : '$0'}
                  </p>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <p className="text-sm text-gray-600">{new Date(selectedFee.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Paid Date</Label>
                  <p className="text-sm text-gray-600">
                    {selectedFee.paidDate ? new Date(selectedFee.paidDate).toLocaleDateString() : 'Not paid'}
                  </p>
                </div>
                {selectedFee.isPaid && (
                  <>
                    <div>
                      <Label>Payment Method</Label>
                      <p className="text-sm text-gray-600">{selectedFee.paymentMethod}</p>
                    </div>
                    <div>
                      <Label>Transaction ID</Label>
                      <p className="text-sm text-gray-600 font-mono">{selectedFee.transactionId}</p>
                    </div>
                  </>
                )}
              </div>
              <div>
                <Label>Notes</Label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mt-1">
                  {selectedFee.notes}
                </p>
              </div>
              {selectedFee.isOverdue && !selectedFee.isPaid && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-800">Overdue Payment</h4>
                  </div>
                  <p className="text-sm text-red-700">
                    This fee is overdue. Please contact the student for immediate payment.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Fee Dialog */}
      <Dialog open={showAddFee} onOpenChange={setShowAddFee}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Fee</DialogTitle>
            <DialogDescription>
              Create a new fee record for a student
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student1">Student 1</SelectItem>
                  <SelectItem value="student2">Student 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="course">Course</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course1">Course 1</SelectItem>
                  <SelectItem value="course2">Course 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="feeType">Fee Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tuition">Tuition</SelectItem>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddFee(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddFee(false)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportsDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    studentGrowth: [],
    revenueData: [],
    coursePerformance: [],
    facultyMetrics: [],
    enrollmentTrends: [],
    topCourses: [],
    recentActivity: []
  });

  // Real data fetching from database
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated');
        setIsLoading(false);
        return;
      }

      // Fetch real data from database
      const [
        studentData,
        courseData,
        transactionData,
        facultyData
      ] = await Promise.all([
        fetchStudentData(user.id),
        fetchCourseData(user.id),
        fetchTransactionData(user.id),
        fetchFacultyData(user.id)
      ]);

      setAnalyticsData({
        studentGrowth: studentData.growth,
        revenueData: transactionData.revenue,
        coursePerformance: courseData.performance,
        facultyMetrics: facultyData.metrics,
        enrollmentTrends: studentData.trends,
        topCourses: courseData.topCourses,
        recentActivity: []
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch student data
  const fetchStudentData = async (userId: string) => {
    try {
      // Get student enrollments from course_enrollments table
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select(`
          created_at,
          courses!inner(tutor_id)
        `)
        .eq('courses.tutor_id', userId);

      if (error) {
        console.error('Error fetching student data:', error);
        return { growth: [], trends: [] };
      }

      // Process data for growth trends
      const growth = processStudentGrowth(enrollments || []);
      const trends = processEnrollmentTrends(enrollments || []);

      return { growth, trends };
    } catch (error) {
      console.error('Error in fetchStudentData:', error);
      return { growth: [], trends: [] };
    }
  };

  // Fetch course data
  const fetchCourseData = async (userId: string) => {
    try {
      const { data: courses, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          created_at,
          updated_at
        `)
        .eq('tutor_id', userId);

      if (error) {
        console.error('Error fetching course data:', error);
        return { performance: [], topCourses: [] };
      }

      // Process course performance data
      const performance = (courses || []).map(course => ({
        name: course.title,
        enrollments: 0, // Would need to join with enrollments
        completion: 0, // Would need completion tracking
        rating: 0 // Would need reviews table
      }));

      const topCourses = (courses || []).map(course => ({
        name: course.title,
        enrollments: 0,
        revenue: 0
      }));

      return { performance, topCourses };
    } catch (error) {
      console.error('Error in fetchCourseData:', error);
      return { performance: [], topCourses: [] };
    }
  };

  // Fetch transaction data
  const fetchTransactionData = async (userId: string) => {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, created_at, status')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching transaction data:', error);
        return { revenue: [] };
      }

      // Process revenue data by month
      const revenue = processRevenueData(transactions || []);
      return { revenue };
    } catch (error) {
      console.error('Error in fetchTransactionData:', error);
      return { revenue: [] };
    }
  };

  // Fetch faculty data
  const fetchFacultyData = async (userId: string) => {
    try {
      // For now, return empty array as faculty data structure needs to be defined
      return { metrics: [] };
    } catch (error) {
      console.error('Error in fetchFacultyData:', error);
      return { metrics: [] };
    }
  };

  // Helper functions to process data
  const processStudentGrowth = (enrollments: any[]) => {
    // Group by month and count enrollments
    const monthlyData = enrollments.reduce((acc, enrollment) => {
      const month = new Date(enrollment.created_at).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month]++;
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      students: count as number,
      newEnrollments: count as number
    }));
  };

  const processEnrollmentTrends = (enrollments: any[]) => {
    // Group by day of week
    const dailyData = enrollments.reduce((acc, enrollment) => {
      const day = new Date(enrollment.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      if (!acc[day]) {
        acc[day] = 0;
      }
      acc[day]++;
      return acc;
    }, {});

    return Object.entries(dailyData).map(([day, count]) => ({
      day,
      enrollments: count as number
    }));
  };

  const processRevenueData = (transactions: any[]) => {
    // Group by month and sum amounts
    const monthlyRevenue = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += transaction.amount || 0;
      return acc;
    }, {});

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue: revenue as number,
      fees: revenue as number,
      other: 0
    }));
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      default: return 'Last 30 days';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Comprehensive insights into your institution's performance</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              loadAnalyticsData();
              onRefresh();
            }}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    analyticsData.studentGrowth.reduce((sum, item) => sum + item.students, 0)
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {analyticsData.studentGrowth.length > 0 ? 'Real data from database' : 'No data available'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
        </CardContent>
      </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
    </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    `₹${analyticsData.revenueData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}`
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {analyticsData.revenueData.length > 0 ? 'From completed transactions' : 'No transactions found'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

      <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    analyticsData.coursePerformance.length
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {analyticsData.coursePerformance.length > 0 ? 'Courses in database' : 'No courses found'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Faculty Members</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    analyticsData.facultyMetrics.length
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {analyticsData.facultyMetrics.length > 0 ? 'Faculty in database' : 'No faculty data'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Growth Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Student Growth Trend
                  <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                </CardTitle>
                <p className="text-sm text-gray-600">Student enrollment over time</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization would be here</p>
                <p className="text-sm text-gray-400">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Analysis
                  <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                </CardTitle>
                <p className="text-sm text-gray-600">Monthly revenue breakdown</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Revenue chart would be here</p>
                <p className="text-sm text-gray-400">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Performance
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Performance metrics for all courses</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Course Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Enrollments</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Completion Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500">Loading course data...</p>
                    </td>
                  </tr>
                ) : analyticsData.coursePerformance.length > 0 ? (
                  analyticsData.coursePerformance.map((course, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{course.name}</td>
                      <td className="py-3 px-4">{course.enrollments || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${course.completion || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{course.completion || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{course.rating || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {course.enrollments ? `₹${(course.enrollments * 500).toLocaleString()}` : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No course data available. Create some courses to see analytics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Faculty Performance
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Faculty metrics and performance indicators</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p className="text-gray-500">Loading faculty data...</p>
            </div>
          ) : analyticsData.facultyMetrics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData.facultyMetrics.map((faculty, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{faculty.name}</h4>
                      <p className="text-sm text-gray-600">{faculty.courses} courses</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{faculty.students}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="font-medium">{faculty.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No faculty data available</p>
              <p className="text-sm text-gray-400 mt-1">Faculty metrics will appear here when available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Enrollment Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Enrollment Trends
          </CardTitle>
          <p className="text-sm text-gray-600">Enrollment patterns by day of the week</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Weekly trends chart would be here</p>
              <p className="text-sm text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
              <p className="text-sm text-gray-600">Download detailed reports in various formats</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


function SettingsDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Get profile data from the hook
  const { profile, registrationData, refreshData } = useInstitutionDashboard();

  useEffect(() => {
    if (profile) {
      setProfileData(profile);
    }
  }, [profile]);

  const handleProfileUpdate = async (updatedProfile: any) => {
    try {
      setIsLoading(true);
      await refreshData();
      setProfileData(updatedProfile);
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Manage your institution profile and settings</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              refreshData();
              onRefresh();
            }}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="institution">Institution</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
      <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Institution Profile
                    <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  </CardTitle>
                  <p className="text-sm text-gray-600">Manage your institution's basic information</p>
                </div>
                <Button onClick={handleEditProfile} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Overview */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={profileData?.logo_url || ""} 
                    alt={profileData?.institution_name || "Institution Logo"}
                  />
                  <AvatarFallback className="text-lg">
                    {profileData?.institution_name?.charAt(0) || "I"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {profileData?.institution_name || "Institution Name"}
                  </h3>
                  <p className="text-gray-600">{profileData?.institution_type || "Institution Type"}</p>
                  <p className="text-sm text-gray-500">
                    Established: {profileData?.established_year || "N/A"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {profileData?.registration_status || "Not Registered"}
                    </Badge>
                    {profileData?.verification_status && (
                      <Badge className="bg-green-100 text-green-800">
                        {profileData.verification_status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Institution Name</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.institution_name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Institution Type</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.institution_type || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Registration Number</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.registration_number || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">PAN Number</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.pan_number || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">GST Number</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.gst_number || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Official Email</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.official_email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Primary Contact</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.primary_contact_number || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Website</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.website_url ? (
                        <a 
                          href={profileData.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {profileData.website_url}
                        </a>
                      ) : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Institution Tab */}
        <TabsContent value="institution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Institution Details
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Manage your institution's detailed information</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Complete Address</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.complete_address || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">City</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.city || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">State</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.state || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Pin Code</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.pin_code || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Landmark</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.landmark || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Map Location</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.map_location || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Owner/Director Name</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.owner_director_name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Owner Contact</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.owner_contact_number || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Manage your contact details and communication preferences</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Primary Contact Number</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.primary_contact_number || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Secondary Contact Number</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.secondary_contact_number || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Official Email</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.official_email || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Owner Contact Number</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.owner_contact_number || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Website URL</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {profileData?.website_url ? (
                        <a 
                          href={profileData.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {profileData.website_url}
                        </a>
                      ) : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences & Settings
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Manage your application preferences and settings</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                  </div>
                  <Checkbox defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive SMS notifications for urgent matters</p>
                  </div>
                  <Checkbox defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Marketing Communications</Label>
                    <p className="text-sm text-gray-500">Receive marketing emails and promotional content</p>
                  </div>
                  <Checkbox />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Data Sharing</Label>
                    <p className="text-sm text-gray-500">Allow sharing of anonymized data for platform improvement</p>
                  </div>
                  <Checkbox defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      {showEditDialog && (
        <InstitutionProfileEditDialog
          profile={profileData}
          onUpdate={handleProfileUpdate}
          onClose={() => setShowEditDialog(false)}
        />
      )}
    </div>
  );
}
