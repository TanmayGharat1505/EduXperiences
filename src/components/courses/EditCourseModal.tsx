import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  X, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Trash2,
  DollarSign,
  BookOpen,
  Award
} from 'lucide-react';
import { InstitutionCourse, CourseFormData } from '@/services/courseService';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: InstitutionCourse | null;
  onSubmit: (courseId: string, courseData: CourseFormData) => Promise<void>;
}

export function EditCourseModal({ isOpen, onClose, course, onSubmit }: EditCourseModalProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    courseName: '',
    category: '',
    description: '',
    duration: '',
    feeStructure: {
      type: 'fixed',
      amount: 0,
      currency: 'INR'
    },
    prerequisites: [],
    syllabus: null,
    certificateDetails: {
      provided: false,
      name: '',
      description: ''
    },
    images: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPrerequisite, setNewPrerequisite] = useState('');

  const categories = [
    'Mathematics',
    'Science',
    'Languages',
    'Technology',
    'Arts',
    'Commerce',
    'Social Studies',
    'Physical Education',
    'Music',
    'Dance',
    'Other'
  ];

  const durationOptions = [
    '1 month',
    '2 months',
    '3 months',
    '6 months',
    '1 year',
    '2 years',
    'Custom'
  ];

  // Initialize form data when course changes
  useEffect(() => {
    if (course) {
      setFormData({
        courseName: course.title,
        category: course.category,
        description: course.description,
        duration: course.duration,
        feeStructure: course.fee_structure,
        prerequisites: course.prerequisites || [],
        syllabus: null, // Will be handled separately for existing files
        certificateDetails: course.certificate_details,
        images: [] // Will be handled separately for existing images
      });
    }
  }, [course]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Course category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    }

    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    }

    if (formData.feeStructure.amount <= 0) {
      newErrors.feeAmount = 'Fee amount must be greater than 0';
    }

    if (formData.certificateDetails.provided && !formData.certificateDetails.name.trim()) {
      newErrors.certificateName = 'Certificate name is required when certificate is provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(course.id, formData);
      handleClose();
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      courseName: '',
      category: '',
      description: '',
      duration: '',
      feeStructure: {
        type: 'fixed',
        amount: 0,
        currency: 'INR'
      },
      prerequisites: [],
      syllabus: null,
      certificateDetails: {
        provided: false,
        name: '',
        description: ''
      },
      images: []
    });
    setErrors({});
    setNewPrerequisite('');
    onClose();
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.prerequisites.includes(newPrerequisite.trim())) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const handleSyllabusUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, syllabus: file }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Edit Course: {course.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course Name */}
              <div className="space-y-2">
                <Label htmlFor="courseName" className="text-sm font-medium text-gray-700">
                  Course Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="courseName"
                  value={formData.courseName}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                  placeholder="Enter course name"
                  className={errors.courseName ? 'border-red-500' : ''}
                />
                {errors.courseName && (
                  <p className="text-sm text-red-500">{errors.courseName}</p>
                )}
              </div>

              {/* Course Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Course Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              {/* Course Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Course Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what students will learn in this course"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                  Duration <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                  <SelectTrigger className={errors.duration ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((duration) => (
                      <SelectItem key={duration} value={duration}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.duration && (
                  <p className="text-sm text-red-500">{errors.duration}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fee Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Fee Structure <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fee Type */}
                <div className="space-y-2">
                  <Label htmlFor="feeType" className="text-sm font-medium text-gray-700">
                    Fee Type
                  </Label>
                  <Select 
                    value={formData.feeStructure.type} 
                    onValueChange={(value: 'fixed' | 'monthly' | 'installment') => 
                      setFormData(prev => ({ 
                        ...prev, 
                        feeStructure: { ...prev.feeStructure, type: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">One-time Payment</SelectItem>
                      <SelectItem value="monthly">Monthly Payment</SelectItem>
                      <SelectItem value="installment">Installment Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fee Amount */}
                <div className="space-y-2">
                  <Label htmlFor="feeAmount" className="text-sm font-medium text-gray-700">
                    Amount (₹)
                  </Label>
                  <Input
                    id="feeAmount"
                    type="number"
                    value={formData.feeStructure.amount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      feeStructure: { ...prev.feeStructure, amount: parseFloat(e.target.value) || 0 }
                    }))}
                    placeholder="Enter fee amount"
                    className={errors.feeAmount ? 'border-red-500' : ''}
                  />
                  {errors.feeAmount && (
                    <p className="text-sm text-red-500">{errors.feeAmount}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Prerequisites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="Add prerequisite (e.g., Basic knowledge of mathematics)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                />
                <Button type="button" onClick={addPrerequisite} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.prerequisites.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.prerequisites.map((prereq, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {prereq}
                      <button
                        type="button"
                        onClick={() => removePrerequisite(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Syllabus Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Course Syllabus Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.syllabus_url && (
                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">Current Syllabus:</p>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(course.syllabus_url!, '_blank')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Current Syllabus
                  </Button>
                </div>
              )}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {course.syllabus_url ? 'Upload new syllabus to replace current one' : 'Upload course syllabus (PDF, DOC, DOCX)'}
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleSyllabusUpload}
                    className="hidden"
                    id="syllabus-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('syllabus-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
                {formData.syllabus && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ {formData.syllabus.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certificate Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Certificate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="certificateProvided"
                  checked={formData.certificateDetails.provided}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    certificateDetails: {
                      ...prev.certificateDetails,
                      provided: e.target.checked
                    }
                  }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="certificateProvided" className="text-sm font-medium text-gray-700">
                  Certificate will be provided upon completion
                </Label>
              </div>

              {formData.certificateDetails.provided && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificateName" className="text-sm font-medium text-gray-700">
                      Certificate Name
                    </Label>
                    <Input
                      id="certificateName"
                      value={formData.certificateDetails.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        certificateDetails: {
                          ...prev.certificateDetails,
                          name: e.target.value
                        }
                      }))}
                      placeholder="e.g., Certificate of Completion in Advanced Mathematics"
                      className={errors.certificateName ? 'border-red-500' : ''}
                    />
                    {errors.certificateName && (
                      <p className="text-sm text-red-500">{errors.certificateName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificateDescription" className="text-sm font-medium text-gray-700">
                      Certificate Description
                    </Label>
                    <Textarea
                      id="certificateDescription"
                      value={formData.certificateDetails.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        certificateDetails: {
                          ...prev.certificateDetails,
                          description: e.target.value
                        }
                      }))}
                      placeholder="Describe what the certificate represents"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                Course Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.images && course.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">Current Images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {course.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Current course image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Upload additional course images (JPG, PNG, GIF)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Images
                  </Button>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New course image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating Course...' : 'Update Course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

