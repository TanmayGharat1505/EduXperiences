import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InstitutionSidebar } from '@/components/layout/InstitutionSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  GraduationCap,
  UserCheck,
  DollarSign,
  Star,
  Filter,
  Search,
  Grid3X3,
  List
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddCourseModal } from '@/components/courses/AddCourseModal';
import { ViewCourseModal } from '@/components/courses/ViewCourseModal';
import { EditCourseModal } from '@/components/courses/EditCourseModal';

// Import types from service
import { InstitutionCourse, InstitutionBatch, CourseFormData, courseService } from '@/services/courseService';
import { supabase } from '@/lib/supabase';

// Use the types from the service
type Course = InstitutionCourse;
type Batch = InstitutionBatch;

export default function CoursesBatchesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State for data
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isViewCourseModalOpen, setIsViewCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Fetch data on component mount
  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch courses and batches
      const [coursesData, batchesData] = await Promise.all([
        courseService.getCourses(user.id),
        courseService.getBatches(user.id)
      ]);
      
      setCourses(coursesData);
      setBatches(batchesData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData: CourseFormData) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Create course using the service
      const newCourse = await courseService.createCourse(courseData, user.id);
      
      // Update local state
      setCourses(prev => [newCourse, ...prev]);
      
      // Show success message
      console.log('Course created successfully:', newCourse);
      
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsViewCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsEditCourseModalOpen(true);
  };

  const handleUpdateCourse = async (courseId: string, courseData: CourseFormData) => {
    try {
      // Update course using the service
      const updatedCourse = await courseService.updateCourse(courseId, courseData);
      
      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === courseId ? updatedCourse : course
      ));
      
      // Close modals
      setIsEditCourseModalOpen(false);
      setIsViewCourseModalOpen(false);
      setSelectedCourse(null);
      
      // Show success message
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

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.instructor && course.instructor.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || course.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'all' || course.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         batch.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
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

  const getLevelColor = (level: string) => {
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
      <Button variant="outline">
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
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading data</h3>
      <p className="text-gray-500 mb-6">{error}</p>
      <Button onClick={fetchData} variant="outline">
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <div className="hidden lg:block">
          <InstitutionSidebar />
        </div>
        
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Mobile Header */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Courses & Batches</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/institution-dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>

            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Courses & Batches</h1>
                  <p className="text-gray-600 mt-2">
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
            </div>

            {/* Search and Filters */}
            <Card className="mb-6 shadow-sm border-0 bg-white">
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

            {/* Show loading, error, or main content */}
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState />
            ) : (
              <>
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="courses" className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Courses ({filteredCourses.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="batches" className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Batches ({filteredBatches.length})</span>
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
                                {course.title}
                              </CardTitle>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {course.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className={getStatusColor(course.status)}>
                              {course.status}
                            </Badge>
                            <Badge variant="outline" className={getLevelColor(course.level)}>
                              {course.level}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                              {course.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Instructor:</span>
                              <span className="font-medium">{course.instructor || 'Not assigned'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-medium">{course.duration}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Students:</span>
                              <span className="font-medium">{course.students_enrolled}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-medium text-green-600">₹{course.fee_structure.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Rating:</span>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="font-medium">{course.rating}</span>
                                <span className="text-gray-500">({course.total_reviews})</span>
                              </div>
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
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
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
                                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                                <div className="flex space-x-2">
                                  <Badge variant="outline" className={getStatusColor(course.status)}>
                                    {course.status}
                                  </Badge>
                                  <Badge variant="outline" className={getLevelColor(course.level)}>
                                    {course.level}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-gray-600 mb-3">{course.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Instructor:</span>
                                  <p className="font-medium">{course.instructor || 'Not assigned'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Duration:</span>
                                  <p className="font-medium">{course.duration}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Students:</span>
                                  <p className="font-medium">{course.students_enrolled}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Price:</span>
                                  <p className="font-medium text-green-600">₹{course.fee_structure.amount.toLocaleString()}</p>
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
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
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
                  {filteredBatches.length === 0 ? (
                    <BatchesEmptyState />
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredBatches.map((batch) => (
                      <Card key={batch.id} className="hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                                {batch.batch_name}
                              </CardTitle>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className={getStatusColor(batch.status)}>
                              {batch.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Instructor:</span>
                              <span className="font-medium">{batch.instructor}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Schedule:</span>
                              <span className="font-medium text-xs">{batch.schedule}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Location:</span>
                              <span className="font-medium">{batch.location}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Students:</span>
                              <span className="font-medium">{batch.current_students}/{batch.max_students}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-medium text-green-600">₹{batch.price.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-medium">
                                {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 mt-4 pt-4 border-t">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBatches.map((batch) => (
                      <Card key={batch.id} className="hover:shadow-md transition-shadow duration-200 border-0 bg-white">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{batch.batch_name}</h3>
                                <Badge variant="outline" className={getStatusColor(batch.status)}>
                                  {batch.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Instructor:</span>
                                  <p className="font-medium">{batch.instructor}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Schedule:</span>
                                  <p className="font-medium text-xs">{batch.schedule}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Students:</span>
                                  <p className="font-medium">{batch.current_students}/{batch.max_students}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Price:</span>
                                  <p className="font-medium text-green-600">₹{batch.price.toLocaleString()}</p>
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
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
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
            </>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}

