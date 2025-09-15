import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Star,
  Loader2,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface EnrolledCourse {
  id: string;
  course_id: string;
  student_id: string;
  status: 'enrolled' | 'completed' | 'cancelled' | 'dropped';
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
  notes?: string;
  course_type?: 'tutor' | 'institution';
  course: {
    id: string;
    title: string;
    description: string;
    subject: string;
    level: string;
    duration_hours: number;
    price: number;
    currency: string;
    max_students: number;
    is_active: boolean;
    status?: string;
    created_at: string;
    updated_at: string;
    tutor_id?: string;
    institution_id?: string;
  };
  tutor_profile?: {
    full_name: string;
    profile_photo_url: string;
    city: string;
    area: string;
  };
  tutor_details?: {
    rating: number;
    total_reviews: number;
    experience_years: number;
  };
  institution_profile?: {
    name: string;
    logo_url: string;
    city: string;
    area: string;
  };
}

interface BookedSession {
  id: string;
  course_id: string;
  tutor_id: string;
  student_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  meeting_link?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  tutor_name: string;
  course_name: string;
}

export default function MyClasses({ onNavigateToBookSessions }: { onNavigateToBookSessions?: () => void }) {
  const { toast } = useToast();
  
  // Helper function to get status color for course status
  const getCourseStatusColor = (status: string | undefined, isActive: boolean): string => {
    if (!isActive) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_enrollments':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Helper function to get status icon for course status
  const getCourseStatusIcon = (status: string | undefined, isActive: boolean): React.ReactNode => {
    if (!isActive) return <Clock className="h-4 w-4 text-gray-600" />;
    
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'no_enrollments':
        return <User className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEnrolledCourses();
    loadBookedSessions();
  }, []);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to view your enrolled courses.",
          variant: "destructive",
        });
        return;
      }

      // Fetch enrollments from course_enrollments table
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) {
        console.error('Error loading enrollments:', error);
        toast({
          title: "Error",
          description: "Failed to load your enrolled courses. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Fetch course information for each enrollment
      const coursesWithDetails = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
          // Try to fetch from courses table first (tutor courses)
          const { data: tutorCourse, error: tutorError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', enrollment.course_id)
            .single();

          if (!tutorError && tutorCourse) {
            // This is a tutor course
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, profile_photo_url, city, area')
              .eq('user_id', tutorCourse.tutor_id)
            .single();

          const { data: tutorData } = await supabase
            .from('tutor_profiles')
            .select('rating, total_reviews, experience_years')
              .eq('user_id', tutorCourse.tutor_id)
            .single();

          return {
            ...enrollment,
              course_type: 'tutor',
              course: tutorCourse,
            tutor_profile: profileData || {
              full_name: 'Unknown Tutor',
              profile_photo_url: '',
              city: '',
              area: ''
            },
            tutor_details: tutorData || {
              rating: 0,
              total_reviews: 0,
              experience_years: 0
            }
          };
          } else {
            // Try to fetch from institution_courses table
            const { data: institutionCourse, error: institutionError } = await supabase
              .from('institution_courses' as any)
              .select('*')
              .eq('id', enrollment.course_id)
              .single();

            if (!institutionError && institutionCourse) {
              // This is an institution course
              const { data: institutionProfile } = await supabase
                .from('profiles')
                .select('full_name, profile_photo_url, city, area')
                .eq('user_id', institutionCourse.institution_id)
                .single();

              return {
                ...enrollment,
                course_type: 'institution',
                course: {
                  ...institutionCourse,
                  subject: institutionCourse.category || 'General',
                  level: institutionCourse.level || 'beginner',
                  duration_hours: institutionCourse.duration || 0,
                  price: institutionCourse.fee_structure?.amount || 0,
                  currency: institutionCourse.fee_structure?.currency || 'USD',
                  max_students: institutionCourse.students_enrolled || 0,
                  is_active: institutionCourse.status === 'Active',
                  status: institutionCourse.status,
                  tutor_id: institutionCourse.institution_id
                },
                institution_profile: institutionProfile ? {
                  name: institutionProfile.full_name,
                  logo_url: institutionProfile.profile_photo_url,
                  city: institutionProfile.city,
                  area: institutionProfile.area
                } : {
                  name: 'Unknown Institution',
                  logo_url: '',
                  city: '',
                  area: ''
                }
              };
            } else {
              // Course not found in either table
              console.warn(`Course with ID ${enrollment.course_id} not found in courses or institution_courses`);
              return null;
            }
          }
        })
      );

      // Filter out null values (courses not found)
      const validCourses = coursesWithDetails.filter(course => course !== null);
      setEnrolledCourses(validCourses);
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      toast({
        title: "Error",
        description: "Failed to load your enrolled courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBookedSessions = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch booked sessions
      const { data: sessions, error } = await supabase
        .from('classes')
        .select(`
          *,
          course:courses(title)
        `)
        .eq('student_id', user.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error loading sessions:', error);
        return;
      }

      // Process sessions to add tutor and course names
      const sessionsWithNames = await Promise.all(
        (sessions || []).map(async (session) => {
          // Get tutor name
          const { data: tutorProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', session.tutor_id)
            .single();

          return {
            ...session,
            tutor_name: tutorProfile?.full_name || 'Unknown Tutor',
            course_name: session.course?.title || 'Unknown Course'
          };
        })
      );

      setBookedSessions(sessionsWithNames);
    } catch (error) {
      console.error('Error loading booked sessions:', error);
    }
  };

  const refreshEnrollments = async () => {
    setRefreshing(true);
    await loadEnrolledCourses();
    await loadBookedSessions();
    setRefreshing(false);
  };

  // Helper functions for session status
  const getSessionStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSessionStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'rescheduled':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid time';
      }
      
      // Format time in user's local timezone
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch (error) {
      console.error('Error formatting time:', error, dateString);
      return 'Invalid time';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid date/time';
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch (error) {
      console.error('Error formatting date/time:', error, dateString);
      return 'Invalid date/time';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'dropped':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'dropped':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your enrolled courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Classes</h2>
          <p className="text-muted-foreground">Track your enrolled courses and learning progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={refreshEnrollments} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <GraduationCap className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''} enrolled
          </Badge>
        </div>
      </div>

      {/* Enrolled Courses */}
      {enrolledCourses.length === 0 ? (
        <Card className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses enrolled yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven't enrolled in any courses yet. Browse available courses and start your learning journey!
          </p>
          <Button onClick={() => window.location.href = '#courses'}>
            <BookOpen className="h-4 w-4 mr-2" />
            Browse Courses
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enrolledCourses.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {enrollment.course.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {enrollment.course.subject}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {enrollment.course.level.charAt(0).toUpperCase() + enrollment.course.level.slice(1).replace('_', ' ')}
                      </Badge>
                      <Badge variant={enrollment.course_type === 'institution' ? 'default' : 'secondary'} className="text-xs">
                        {enrollment.course_type === 'institution' ? 'Institution' : 'Tutor'}
                      </Badge>
                      {enrollment.course.status && (
                        <Badge className={`text-xs ${getCourseStatusColor(enrollment.course.status, enrollment.course.is_active)}`}>
                          <div className="flex items-center gap-1">
                            {getCourseStatusIcon(enrollment.course.status, enrollment.course.is_active)}
                            {enrollment.course.status === 'no_enrollments' ? 'Available' : 
                             enrollment.course.status === 'completed' ? 'Course Completed' :
                             enrollment.course.status === 'cancelled' ? 'Course Cancelled' :
                             enrollment.course.status.replace('_', ' ').charAt(0).toUpperCase() + enrollment.course.status.replace('_', ' ').slice(1)}
                          </div>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`text-xs ${getStatusColor(enrollment.status)}`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(enrollment.status)}
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </div>
                    </Badge>
                    {enrollment.progress_percentage > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {enrollment.progress_percentage}% Complete
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Course Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {enrollment.course.description || 'No description available'}
                </p>

                {/* Course Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{enrollment.course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Enrolled {formatDate(enrollment.enrolled_at)}</span>
                  </div>
                </div>

                {/* Tutor/Institution Information */}
                <div className="border-t pt-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={
                          enrollment.course_type === 'institution' 
                            ? enrollment.institution_profile?.logo_url || "" 
                            : enrollment.tutor_profile?.profile_photo_url || ""
                        } 
                        alt={
                          enrollment.course_type === 'institution' 
                            ? enrollment.institution_profile?.name || "Institution"
                            : enrollment.tutor_profile?.full_name || "Tutor"
                        }
                      />
                      <AvatarFallback className="text-xs">
                        {enrollment.course_type === 'institution' 
                          ? (enrollment.institution_profile?.name?.split(" ").map(n => n[0]).join("") || "I")
                          : (enrollment.tutor_profile?.full_name?.split(" ").map(n => n[0]).join("") || "T")
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {enrollment.course_type === 'institution' 
                          ? enrollment.institution_profile?.name || "Unknown Institution"
                          : enrollment.tutor_profile?.full_name || "Unknown Tutor"
                        }
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {(enrollment.course_type === 'institution' 
                          ? enrollment.institution_profile?.city 
                          : enrollment.tutor_profile?.city) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {enrollment.course_type === 'institution' 
                                ? enrollment.institution_profile?.city
                                : enrollment.tutor_profile?.city
                              }
                            </span>
                          </div>
                        )}
                        {enrollment.course_type === 'tutor' && enrollment.tutor_details?.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{enrollment.tutor_details.rating}</span>
                          </div>
                        )}
                        {enrollment.course_type === 'institution' && (
                          <Badge variant="outline" className="text-xs">
                            Institution
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {enrollment.progress_percentage > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booked Sessions Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Booked Sessions</h2>
            <p className="text-gray-600 mt-1">Your upcoming and past one-on-one sessions with tutors</p>
          </div>
          <Button
            variant="outline"
            onClick={refreshEnrollments}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            Refresh All
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading sessions...</span>
          </div>
        ) : bookedSessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions booked yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Book one-on-one sessions with tutors to get personalized help with your courses.
              </p>
              <Button 
                onClick={onNavigateToBookSessions || (() => window.location.href = '/student-dashboard?tab=book-sessions')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Book a Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookedSessions.map((session) => (
              <Card key={session.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(session.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{session.tutor_name}</span>
                        </div>
                      </div>
                      {/* Additional time information for clarity */}
                      <div className="mt-1 text-xs text-gray-500">
                        <span>Session: {formatDateTime(session.start_time)}</span>
                        {process.env.NODE_ENV === 'development' && (
                          <div className="mt-1 text-xs text-gray-400">
                            <span>Raw: {session.start_time} | Local: {new Date(session.start_time).toString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={`text-xs ${getSessionStatusColor(session.status)}`}>
                      <div className="flex items-center gap-1">
                        {getSessionStatusIcon(session.status)}
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1).replace('_', ' ')}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {session.description && (
                    <p className="text-sm text-muted-foreground">
                      {session.description}
                    </p>
                  )}
                  
                  {session.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {session.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-gray-600">
                      Duration: {session.duration_minutes} minutes
                    </div>
                    {session.meeting_link && (
                      <Button size="sm" variant="outline" className="text-blue-600">
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
