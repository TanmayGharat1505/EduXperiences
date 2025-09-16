import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Users, 
  Star, 
  FileText, 
  Image as ImageIcon,
  Award,
  Clock,
  MapPin,
  User,
  X
} from 'lucide-react';
import { InstitutionCourse } from '@/services/courseService';

interface ViewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: InstitutionCourse | null;
  onEdit: () => void;
}

export function ViewCourseModal({ isOpen, onClose, course, onEdit }: ViewCourseModalProps) {
  if (!course) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            {course.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
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
              
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </CardContent>
          </Card>

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Duration:</span>
                    <p className="font-medium">{course.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Instructor:</span>
                    <p className="font-medium">{course.instructor || 'Not assigned'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Students Enrolled:</span>
                    <p className="font-medium">{course.students_enrolled}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{course.rating}</span>
                      <span className="text-gray-500">({course.total_reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fee Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Fee Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Fee Type:</span>
                  <p className="font-medium capitalize">{course.fee_structure.type.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Amount:</span>
                  <p className="font-medium text-green-600 text-lg">
                    ₹{course.fee_structure.amount.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Currency:</span>
                  <p className="font-medium">{course.fee_structure.currency}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.prerequisites.map((prereq, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certificate Details */}
          {course.certificate_details.provided && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Certificate Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Certificate Name:</span>
                  <p className="font-medium">{course.certificate_details.name}</p>
                </div>
                
                {course.certificate_details.description && (
                  <div>
                    <span className="text-sm text-gray-500">Description:</span>
                    <p className="text-gray-700">{course.certificate_details.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Course Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Syllabus */}
            {course.syllabus_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Course Syllabus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(course.syllabus_url!, '_blank')}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Syllabus
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Course Images */}
            {course.images && course.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    Course Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {course.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Course image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Course Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Course Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{course.students_enrolled}</p>
                  <p className="text-sm text-gray-600">Students Enrolled</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{course.rating}</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{course.total_reviews}</p>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {new Date(course.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Created Date</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
            Edit Course
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

