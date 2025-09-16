import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, BookOpen, Users, Clock, DollarSign, Eye, Calendar, CheckCircle, X } from 'lucide-react';

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
}

interface CourseFormData {
  title: string;
  description: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  duration_hours: number;
  price: number;
  currency: string;
  max_students: number;
  start_time: string;
}

interface CourseManagementProps {
  onRefresh?: () => void;
}

export default function CourseManagement({ onRefresh }: CourseManagementProps) {
  const { toast } = useToast();
  
  // Helper function to format date for input fields (12-hour format)
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

    // Helper function to format date for display (12-hour format with AM/PM)
  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

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
        return <CheckCircle className="h-4 w-4 text-green-600" />;
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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    subject: '',
    level: 'beginner',
    duration_hours: 1,
    price: 0,
    currency: 'INR',
    max_students: 1,
    start_time: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Default to 1 week from now
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('tutor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading courses:', error);
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        });
      } else {
        setCourses(data || []);
      }
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

  const handleCreateCourse = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Convert start_time from datetime-local format to ISO string
      const startTimeDate = new Date(formData.start_time);
      if (isNaN(startTimeDate.getTime())) {
        toast({
          title: "Invalid Date",
          description: "Please select a valid start time for the course.",
          variant: "destructive",
        });
        return;
      }

      const courseData = {
        ...formData,
        start_time: startTimeDate.toISOString(),
        tutor_id: user.id,
      };

      console.log('Creating course with data:', courseData);
      console.log('Original start_time input:', formData.start_time);
      console.log('Parsed start_time date:', startTimeDate);
      console.log('ISO start_time:', startTimeDate.toISOString());

      const { error } = await supabase
        .from('courses')
        .insert(courseData);

      if (error) {
        console.error('Error creating course:', error);
        toast({
          title: "Error",
          description: "Failed to create course. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Course created successfully!",
        });
        setShowCreateDialog(false);
        resetForm();
        loadCourses();
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    try {
      // Convert start_time from datetime-local format to ISO string
      const startTimeDate = new Date(formData.start_time);
      if (isNaN(startTimeDate.getTime())) {
        toast({
          title: "Invalid Date",
          description: "Please select a valid start time for the course.",
          variant: "destructive",
        });
        return;
      }

      const courseData = {
        ...formData,
        start_time: startTimeDate.toISOString(),
      };

      console.log('Updating course with data:', courseData);
      console.log('Original start_time input:', formData.start_time);
      console.log('Parsed start_time date:', startTimeDate);
      console.log('ISO start_time:', startTimeDate.toISOString());

      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', editingCourse.id);

      if (error) {
        console.error('Error updating course:', error);
        toast({
          title: "Error",
          description: "Failed to update course. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Course updated successfully!",
        });
        setShowEditDialog(false);
        setEditingCourse(null);
        resetForm();
        loadCourses();
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        console.error('Error deleting course:', error);
        toast({
          title: "Error",
          description: "Failed to delete course. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Course deleted successfully!",
        });
        loadCourses();
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    
    // Format start_time for datetime-local input (YYYY-MM-DDTHH:MM)
    let formattedStartTime = '';
    if (course.start_time) {
      try {
        const date = new Date(course.start_time);
        if (!isNaN(date.getTime())) {
          // Ensure we preserve the exact time by using the local timezone
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          
          formattedStartTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
      } catch (error) {
        console.error('Error formatting start_time:', error);
      }
    }
    
    // If no valid start_time, use default (1 week from now)
    if (!formattedStartTime) {
      formattedStartTime = formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    }

    setFormData({
      title: course.title,
      description: course.description,
      subject: course.subject,
      level: course.level,
      duration_hours: course.duration_hours,
      price: course.price,
      currency: course.currency,
      max_students: course.max_students,
      start_time: formattedStartTime,
    });
    
    console.log('Editing course:', course);
    console.log('Original course start_time:', course.start_time);
    console.log('Parsed course date:', course.start_time ? new Date(course.start_time) : 'null');
    console.log('Formatted start_time for input:', formattedStartTime);
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      level: 'beginner',
      duration_hours: 1,
      price: 0,
      currency: 'INR',
      max_students: 1,
      start_time: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Default to 1 week from now
    });
  };

  const toggleCourseStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_active: !currentStatus })
        .eq('id', courseId);

      if (error) {
        console.error('Error updating course status:', error);
        toast({
          title: "Error",
          description: "Failed to update course status. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Course ${!currentStatus ? 'activated' : 'deactivated'} successfully!`,
        });
        loadCourses();
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      toast({
        title: "Error",
        description: "Failed to update course status. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Create and manage your courses</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new course. Students will be able to see this information and enroll.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Mathematics Fundamentals"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what students will learn in this course..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Course Start Time *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="start_time_date"
                    type="date"
                    value={formData.start_time && formData.start_time.includes('T') ? formData.start_time.split('T')[0] : new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const time = formData.start_time && formData.start_time.includes('T') ? formData.start_time.split('T')[1] || '12:00' : '12:00';
                      setFormData({ ...formData, start_time: `${e.target.value}T${time}` });
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Input
                    id="start_time_time"
                    type="time"
                    value={formData.start_time && formData.start_time.includes('T') ? formData.start_time.split('T')[1] || '12:00' : '12:00'}
                    onChange={(e) => {
                      const date = formData.start_time && formData.start_time.includes('T') ? formData.start_time.split('T')[0] : new Date().toISOString().split('T')[0];
                      setFormData({ ...formData, start_time: `${date}T${e.target.value}` });
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  When will this course begin? Students will see this to know when to expect classes.
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  Selected: {formData.start_time && formData.start_time.includes('T') ? formatDateForDisplay(formData.start_time) : 'No time selected'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level} onValueChange={(value: any) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="all_levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCourse} disabled={!formData.title || !formData.subject || !formData.start_time}>
                Create Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-4">Create your first course to start attracting students</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Course
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <Badge variant={course.is_active ? "default" : "secondary"}>
                        {course.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{course.level}</Badge>
                      {course.status && (
                        <Badge className={`text-xs ${getStatusColor(course.status, course.is_active)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(course.status, course.is_active)}
                            {course.status === 'no_enrollments' ? 'No Enrollments' : 
                             course.status === 'completed' ? 'Completed' :
                             course.status === 'cancelled' ? 'Cancelled' :
                             course.status.replace('_', ' ').charAt(0).toUpperCase() + course.status.replace('_', ' ').slice(1)}
                          </div>
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{course.description}</p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.subject}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration_hours} hours</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Starts {course.start_time ? formatDateForDisplay(course.start_time) : 'Date not set'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Max {course.max_students} students</span>
                      </div>
                      {course.price > 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{course.currency} {course.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCourseStatus(course.id, course.is_active)}
                    >
                      {course.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update your course information. Changes will be visible to students immediately.
              </DialogDescription>
            </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Course Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Mathematics Fundamentals"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject *</Label>
                <Input
                  id="edit-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what students will learn in this course..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-start_time">Course Start Time *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="edit-start_time_date"
                  type="date"
                  value={formData.start_time && formData.start_time.includes('T') ? formData.start_time.split('T')[0] : new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const time = formData.start_time && formData.start_time.includes('T') ? formData.start_time.split('T')[1] || '12:00' : '12:00';
                    setFormData({ ...formData, start_time: `${e.target.value}T${time}` });
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  id="edit-start_time_time"
                  type="time"
                  value={formData.start_time && formData.start_time.includes('T') ? formData.start_time.split('T')[1] || '12:00' : '12:00'}
                  onChange={(e) => {
                    const date = formData.start_time && formData.start_time.includes('T') ? formData.start_time.split('T')[0] : new Date().toISOString().split('T')[0];
                    setFormData({ ...formData, start_time: `${date}T${e.target.value}` });
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                When will this course begin? Students will see this to know when to expect classes.
              </p>
              <p className="text-xs text-blue-600 font-medium">
                Selected: {formData.start_time && formData.start_time.includes('T') ? formatDateForDisplay(formData.start_time) : 'No time selected'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-level">Level</Label>
                <Select value={formData.level} onValueChange={(value: any) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="all_levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (hours)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxStudents">Max Students</Label>
                <Input
                  id="edit-maxStudents"
                  type="number"
                  min="1"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse} disabled={!formData.title || !formData.subject || !formData.start_time}>
              Update Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
