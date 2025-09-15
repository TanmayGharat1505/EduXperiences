import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Users, 
  Clock, 
  DollarSign, 
  Search, 
  Filter, 
  Star, 
  MapPin,
  User,
  Calendar,
  GraduationCap,
  Loader2,
  X,
  Eye,
  Award,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  duration_hours: number;
  price: number;
  currency: string;
  max_students: number;
  start_time: string;
  is_active: boolean;
  status?: string;
  created_at: string;
  updated_at: string;
  tutor_id: string;
  tutor_profile?: {
    full_name: string;
    profile_photo_url: string;
    city: string;
    area: string;
    rating: number;
    total_reviews: number;
    experience_years: number;
  };
}

interface StudentCoursesProps {
  onEnrollSuccess?: () => void;
}

export default function StudentCourses({ onEnrollSuccess }: StudentCoursesProps) {
  const { toast } = useToast();
  
  // Note: This component requires the courses table to have a 'status' field
  // Run the migration: supabase/migrations/add_status_to_courses.sql
  // Until then, frontend filtering will be used
  
  // Helper function to get status color for course status
  const getStatusColor = (status: string | undefined, isActive: boolean): string => {
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
  const getStatusIcon = (status: string | undefined, isActive: boolean): React.ReactNode => {
    if (!isActive) return <Clock className="h-4 w-4 text-gray-600" />;
    
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <Star className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-600" />;
      case 'no_enrollments':
        return <Users className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    loadCourses();
    loadUserEnrollments();
  }, []);

  const loadUserEnrollments = async () => {
    try {
      setLoadingEnrollments(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select('course_id, status')
        .eq('student_id', user.id)
        .eq('status', 'enrolled');

      if (!error && enrollments) {
        const enrolledIds = new Set(enrollments.map(e => e.course_id));
        setEnrolledCourses(enrolledIds);
      }
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      
      // Load both tutor courses and institution courses
      const [tutorCoursesResult, institutionCoursesResult] = await Promise.allSettled([
        // Load tutor courses
        supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
          .order('created_at', { ascending: false }),
        
        // Load institution courses
        supabase
          .from('institution_courses')
          .select('*')
          .eq('status', 'Active')
          .order('created_at', { ascending: false })
      ]);

      // Handle tutor courses result
      if (tutorCoursesResult.status === 'rejected') {
        throw tutorCoursesResult.reason;
      }
      if (tutorCoursesResult.value.error) {
        throw tutorCoursesResult.value.error;
      }

      // Handle institution courses result
      let institutionCourses = [];
      if (institutionCoursesResult.status === 'rejected') {
        console.error('Institution courses error (table may not exist):', institutionCoursesResult.reason);
        // Don't throw error, just continue with empty institution courses
      } else if (institutionCoursesResult.value.error) {
        console.error('Institution courses error:', institutionCoursesResult.value.error);
        // Don't throw error, just continue with empty institution courses
      } else {
        institutionCourses = institutionCoursesResult.value.data || [];
      }

      const tutorCourses = tutorCoursesResult.value.data || [];
      
      console.log('Tutor courses loaded:', tutorCourses.length);
      console.log('Institution courses loaded:', institutionCourses.length);
      console.log('Institution courses data:', institutionCourses);
      
      // Additional debugging
      if (institutionCourses.length === 0) {
        console.log('No institution courses found. This could mean:');
        console.log('1. No institution courses exist in the database');
        console.log('2. RLS policies are blocking access');
        console.log('3. Institution courses exist but status is not "Active"');
      }

      // Process tutor courses
      const coursesWithTutors = await Promise.all(
        tutorCourses.map(async (course) => {
          // Get tutor profile information
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, profile_photo_url, city, area')
            .eq('id', course.tutor_id)
            .single();

          // Get tutor details from tutor_profiles
          const { data: tutorData } = await supabase
            .from('tutor_profiles')
            .select('rating, total_reviews, experience_years')
            .eq('user_id', course.tutor_id)
            .single();

          return {
            ...course,
            course_type: 'tutor',
            profiles: profileData,
            tutor_profiles: tutorData
          };
        })
      );

      // Process institution courses
      const coursesWithInstitutions = await Promise.all(
        institutionCourses.map(async (course) => {
          // Get institution profile information
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, profile_photo_url, city, area')
            .eq('id', course.institution_id)
            .single();

          return {
            ...course,
            course_type: 'institution',
            // Map institution course fields to match tutor course interface
            id: course.id,
            title: course.title,
            description: course.description,
            subject: course.category,
            level: course.level?.toLowerCase() || 'beginner',
            duration_hours: parseInt(course.duration) || 1,
            price: course.fee_structure?.amount || 0,
            currency: course.fee_structure?.currency || 'INR',
            max_students: 50, // Default for institution courses
            is_active: course.status === 'Active',
            created_at: course.created_at,
            updated_at: course.updated_at,
            profiles: profileData,
            tutor_profiles: {
              rating: course.rating || 0,
              total_reviews: course.total_reviews || 0,
              experience_years: 0 // Institution courses don't have experience years
            }
          };
        })
      );

      // Combine both types of courses
      const allCourses = [...coursesWithTutors, ...coursesWithInstitutions];
      
      console.log('All courses after processing:', allCourses.length);

        // Transform the data to match our interface
      const transformedCourses = allCourses.map(course => ({
          ...course,
          tutor_profile: {
          full_name: course.profiles?.full_name || (course.course_type === 'institution' ? 'Institution' : 'Unknown Tutor'),
            profile_photo_url: course.profiles?.profile_photo_url || '',
            city: course.profiles?.city || '',
            area: course.profiles?.area || '',
            rating: course.tutor_profiles?.rating || 0,
            total_reviews: course.tutor_profiles?.total_reviews || 0,
            experience_years: course.tutor_profiles?.experience_years || 0,
          }
      }));
        
        // Filter out completed and cancelled courses (frontend filtering until migration is run)
        const filteredCourses = transformedCourses.filter(course => 
          course.status !== 'completed' && course.status !== 'cancelled'
        );
        
        setCourses(filteredCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (course: Course) => {
    setSelectedCourse(course);
    setShowEnrollDialog(true);
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsViewModalOpen(true);
  };

  const confirmEnrollment = async () => {
    if (!selectedCourse) return;

    try {
      setEnrolling(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to enroll in courses.",
          variant: "destructive",
        });
        return;
      }

      // Check if student is already enrolled
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('course_id', selectedCourse.id)
        .eq('student_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means "no rows returned" which is expected for new enrollments
        console.error('Error checking enrollment status:', checkError);
        toast({
          title: "Error",
          description: "Failed to check enrollment status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (existingEnrollment) {
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this course.",
          variant: "destructive",
        });
        return;
      }

      // Create enrollment record
      // This works for both tutor courses and institution courses
      const { error: enrollError } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: selectedCourse.id,
          student_id: user.id,
          status: 'enrolled',
          enrolled_at: new Date().toISOString()
        });

      if (enrollError) {
        console.error('Error enrolling in course:', enrollError);
        toast({
          title: "Error",
          description: "Failed to enroll in course. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Enrollment Successful! 🎉",
          description: `You're now enrolled in "${selectedCourse.title}". You can access your course materials and start learning!`,
        });
        
        setShowEnrollDialog(false);
        setSelectedCourse(null);
        onEnrollSuccess?.();
        
        // Refresh enrollments and courses
        loadUserEnrollments();
        loadCourses();
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === 'all' || !selectedSubject || course.subject === selectedSubject;
    const matchesLevel = selectedLevel === 'all' || !selectedLevel || course.level === selectedLevel;
    
    return matchesSearch && matchesSubject && matchesLevel;
  });

  const subjects = [...new Set(courses.map(course => course.subject).filter(subject => subject && subject.trim() !== ''))];
  const levels = ['beginner', 'intermediate', 'advanced', 'all_levels'];
  
  // Ensure we have valid subjects before rendering
  const validSubjects = subjects.filter(subject => subject && subject.trim() !== '');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
         <div>
           <h2 className="text-2xl font-bold">Available Courses</h2>
           <p className="text-muted-foreground">Browse and enroll in courses from qualified tutors and institutions</p>
         </div>
         <div className="flex items-center gap-2">
           <Badge variant="outline" className="px-3 py-1">
             {filteredCourses.length} courses available
           </Badge>
           {enrolledCourses.size > 0 && (
             <Badge variant="secondary" className="px-3 py-1">
               {enrolledCourses.size} enrolled
             </Badge>
           )}
         </div>
       </div>

       {/* Current Enrollments */}
       {loadingEnrollments ? (
         <Card className="bg-blue-50 border-blue-200">
           <CardContent className="p-4">
             <div className="flex items-center gap-2">
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
               <span className="text-blue-700">Loading your enrollments...</span>
             </div>
           </CardContent>
         </Card>
       ) : enrolledCourses.size > 0 ? (
         <Card className="bg-blue-50 border-blue-200">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <BookOpen className="h-5 w-5 text-blue-600" />
                 <h3 className="font-semibold text-blue-900">Your Current Enrollments</h3>
               </div>
               <Badge variant="outline" className="text-blue-700 border-blue-300">
                 {enrolledCourses.size} course{enrolledCourses.size !== 1 ? 's' : ''}
               </Badge>
             </div>
             <p className="text-sm text-blue-700 mt-1">
               You're currently enrolled in {enrolledCourses.size} course{enrolledCourses.size !== 1 ? 's' : ''}. 
               Access your enrolled courses from the dashboard.
             </p>
           </CardContent>
         </Card>
       ) : null}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses by title, description, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {validSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            {searchTerm || (selectedSubject !== 'all') || (selectedLevel !== 'all')
              ? "Try adjusting your search criteria or filters."
              : "No courses are currently available. Check back later!"
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {course.subject}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1).replace('_', ' ')}
                      </Badge>
                      <Badge variant={course.course_type === 'institution' ? 'default' : 'secondary'} className="text-xs">
                        {course.course_type === 'institution' ? 'Institution' : 'Tutor'}
                      </Badge>
                      {course.status && (
                        <Badge className={`text-xs ${getStatusColor(course.status, course.is_active)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(course.status, course.is_active)}
                            {course.status === 'no_enrollments' ? 'Available' : 
                             course.status === 'completed' ? 'Completed' :
                             course.status === 'cancelled' ? 'Cancelled' :
                             course.status.replace('_', ' ').charAt(0).toUpperCase() + course.status.replace('_', ' ').slice(1)}
                          </div>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Course Description */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {course.description || 'No description available'}
                </p>

                {/* Course Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Max {course.max_students}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">
                      Starts {new Date(course.start_time).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} at {new Date(course.start_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                  {course.price > 0 && (
                    <div className="flex items-center gap-2 col-span-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {course.currency} {course.price}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tutor/Institution Information */}
                <div className="border-t pt-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={course.tutor_profile?.profile_photo_url || ""} 
                        alt={course.tutor_profile?.full_name || (course.course_type === 'institution' ? 'Institution' : 'Tutor')}
                      />
                      <AvatarFallback className="text-xs">
                        {course.tutor_profile?.full_name?.split(" ").map(n => n[0]).join("") || (course.course_type === 'institution' ? 'I' : 'T')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {course.tutor_profile?.full_name || (course.course_type === 'institution' ? 'Institution' : 'Unknown Tutor')}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {course.tutor_profile?.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{course.tutor_profile.city}</span>
                          </div>
                        )}
                        {course.tutor_profile?.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{course.tutor_profile.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewCourse(course)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                 {enrolledCourses.has(course.id) ? (
                   <Button 
                     variant="secondary" 
                     size="sm"
                     disabled
                      className="flex-1"
                   >
                     <BookOpen className="h-4 w-4 mr-2" />
                      Enrolled
                   </Button>
                 ) : (
                   <Button 
                     onClick={() => handleEnroll(course)}
                     size="sm"
                      className="flex-1"
                   >
                     <BookOpen className="h-4 w-4 mr-2" />
                      Enroll
                   </Button>
                 )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enrollment Confirmation Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="sm:max-w-[500px]">
                     <DialogHeader>
             <DialogTitle>Confirm Course Enrollment</DialogTitle>
             <DialogDescription>
               You're about to enroll in this course. This will give you access to all course materials and connect you with the tutor.
             </DialogDescription>
           </DialogHeader>
          
          {selectedCourse && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">{selectedCourse.title}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subject:</span>
                    <p className="font-medium">{selectedCourse.subject}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Level:</span>
                    <p className="font-medium capitalize">
                      {selectedCourse.level.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{selectedCourse.duration_hours} hours</p>
                  </div>
                  {selectedCourse.price > 0 && (
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <p className="font-medium">
                        {selectedCourse.currency} {selectedCourse.price}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {selectedCourse.tutor_profile?.full_name || "Unknown Tutor"}
                  </p>
                  <p className="text-xs text-blue-700">
                    {selectedCourse.tutor_profile?.city && `${selectedCourse.tutor_profile.city}`}
                    {selectedCourse.tutor_profile?.experience_years && 
                      ` • ${selectedCourse.tutor_profile.experience_years} years experience`}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEnrollDialog(false)}
              disabled={enrolling}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmEnrollment}
              disabled={enrolling}
              className="min-w-[100px]"
            >
              {enrolling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Enroll
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Course Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Course Details
            </DialogTitle>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedCourse.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-sm">
                      {selectedCourse.subject}
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                      {selectedCourse.level.charAt(0).toUpperCase() + selectedCourse.level.slice(1).replace('_', ' ')}
                    </Badge>
                    <Badge variant={selectedCourse.course_type === 'institution' ? 'default' : 'secondary'} className="text-sm">
                      {selectedCourse.course_type === 'institution' ? 'Institution' : 'Tutor'}
                    </Badge>
                    {selectedCourse.status && (
                      <Badge className={`text-sm ${getStatusColor(selectedCourse.status, selectedCourse.is_active)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedCourse.status, selectedCourse.is_active)}
                          {selectedCourse.status === 'no_enrollments' ? 'Available' : 
                           selectedCourse.status === 'completed' ? 'Completed' :
                           selectedCourse.status === 'cancelled' ? 'Cancelled' :
                           selectedCourse.status.replace('_', ' ').charAt(0).toUpperCase() + selectedCourse.status.replace('_', ' ').slice(1)}
                        </div>
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedCourse.description || 'No description available'}
                  </p>
                </div>
              </div>

              {/* Course Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Course Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Duration</p>
                        <p className="text-sm text-gray-600">{selectedCourse.duration_hours} hours</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Maximum Students</p>
                        <p className="text-sm text-gray-600">{selectedCourse.max_students}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Start Date & Time</p>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedCourse.start_time).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })} at {new Date(selectedCourse.start_time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </div>
                    </div>
                    {selectedCourse.price > 0 && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Price</p>
                          <p className="text-sm text-gray-600">
                            {selectedCourse.currency} {selectedCourse.price}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tutor/Institution Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    {selectedCourse.course_type === 'institution' ? 'Institution' : 'Tutor'} Information
                  </h4>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={selectedCourse.tutor_profile?.profile_photo_url || ""} 
                        alt={selectedCourse.tutor_profile?.full_name || (selectedCourse.course_type === 'institution' ? 'Institution' : 'Tutor')}
                      />
                      <AvatarFallback>
                        {selectedCourse.tutor_profile?.full_name?.split(" ").map(n => n[0]).join("") || (selectedCourse.course_type === 'institution' ? 'I' : 'T')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">
                        {selectedCourse.tutor_profile?.full_name || (selectedCourse.course_type === 'institution' ? 'Institution' : 'Unknown Tutor')}
                      </h5>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        {selectedCourse.tutor_profile?.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{selectedCourse.tutor_profile.city}</span>
                          </div>
                        )}
                        {selectedCourse.tutor_profile?.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{selectedCourse.tutor_profile.rating}</span>
                            <span>({selectedCourse.tutor_profile.total_reviews} reviews)</span>
                          </div>
                        )}
                      </div>
                      {selectedCourse.tutor_profile?.experience_years > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4" />
                          <span>{selectedCourse.tutor_profile.experience_years} years experience</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Course Information for Institution Courses */}
              {selectedCourse.course_type === 'institution' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Prerequisites */}
                    {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Prerequisites</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedCourse.prerequisites.map((prereq, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {prereq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certificate Details */}
                    {selectedCourse.certificate_details && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Certificate</h5>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-gray-600">
                            {selectedCourse.certificate_details.provided ? 'Certificate provided upon completion' : 'No certificate provided'}
                          </span>
                        </div>
                        {selectedCourse.certificate_details.name && (
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedCourse.certificate_details.name}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Syllabus */}
                    {selectedCourse.syllabus_url && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Syllabus</h5>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <a 
                            href={selectedCourse.syllabus_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Download Syllabus
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Course Images */}
                    {selectedCourse.images && selectedCourse.images.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Course Images</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedCourse.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Course image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                {!enrolledCourses.has(selectedCourse.id) && (
                  <Button 
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleEnroll(selectedCourse);
                    }}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Enroll Now
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
