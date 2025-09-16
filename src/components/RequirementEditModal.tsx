import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Edit } from "lucide-react";

interface RequirementEditModalProps {
  requirement: any;
  onClose: () => void;
  onUpdate: () => void;
}

export function RequirementEditModal({ requirement, onClose, onUpdate }: RequirementEditModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: requirement.category || '',
    subject: requirement.subject || '',
    description: requirement.description || '',
    urgency: requirement.urgency || '',
    budget: requirement.budget_range || '', // Fixed: use budget_range from database
    location: requirement.location || '',
    // Removed preferredGender and experienceLevel as they don't exist in schema
    classLevel: requirement.class_level || '',
    board: requirement.board || '',
    customBoard: requirement.custom_board || '',
    examPreparation: requirement.exam_preparation || '',
    skillLevel: requirement.skill_level || '',
    ageGroup: requirement.age_group || '',
    customCategory: requirement.custom_category || '',
    customSubject: requirement.custom_subject || '',
    specificTopics: requirement.specific_topics || '',
    learningGoals: requirement.learning_goals || ''
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
        customBoard: '',
        examPreparation: '',
        skillLevel: '',
        ageGroup: '',
        customCategory: '',
        customSubject: '',
        specificTopics: '',
        learningGoals: ''
      })
    }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const requiredFields = ['category', 'subject', 'description', 'urgency', 'budget', 'location'];
    return requiredFields.every(field => formData[field as keyof typeof formData].trim() !== '');
  };

  const showError = (field: string) => {
    return touched[field] && !formData[field as keyof typeof formData].trim() ? `${field} is required` : '';
  };

  const isFormValid = () => {
    if (!validateForm()) return false;
    
    // Category-specific validation
    if (formData.category === 'academic' && (!formData.classLevel || !formData.board)) return false;
    if (formData.category === 'academic' && formData.board === 'other' && !formData.customBoard) return false;
    if (formData.category === 'test_preparation' && !formData.examPreparation) return false;
    if (formData.category === 'skills' && !formData.skillLevel) return false;
    if (formData.category === 'music' && !formData.ageGroup) return false;
    if (formData.category === 'other' && (!formData.customCategory || !formData.customSubject)) return false;
    
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
    
    if (formData.category === 'academic' && formData.board === 'other' && !formData.customBoard) {
      toast({
        title: "Custom Board Required",
        description: "Please specify the custom board name when selecting 'Other'.",
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
    
    if (formData.category === 'other' && (!formData.customCategory || !formData.customSubject)) {
      toast({
        title: "Custom Details Required",
        description: "Please specify both custom category name and custom subject/skill for other category.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const updateData = {
        category: formData.category,
        subject: formData.category === 'other' ? formData.customSubject : formData.subject,
        description: formData.description,
        urgency: formData.urgency,
        budget_range: formData.budget, // Fixed: map to budget_range column
        location: formData.location,
        // Removed preferred_gender and experience_level as they don't exist in schema
        class_level: formData.category === 'academic' ? formData.classLevel : null,
        board: formData.category === 'academic' ? formData.board : null,
        custom_board: formData.category === 'academic' && formData.board === 'other' ? formData.customBoard : null,
        exam_preparation: formData.category === 'test_preparation' ? formData.examPreparation : null,
        skill_level: formData.category === 'skills' ? formData.skillLevel : null,
        age_group: formData.category === 'music' ? formData.ageGroup : null,
        custom_category: formData.category === 'other' ? formData.customCategory : null,
        custom_subject: formData.category === 'other' ? formData.customSubject : null,
        specific_topics: formData.specificTopics || null,
        learning_goals: formData.learningGoals || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('requirements')
        .update(updateData)
        .eq('id', requirement.id);

      if (error) {
        console.error('Error updating requirement:', error);
        toast({
          title: "Error",
          description: "Failed to update requirement. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Requirement updated successfully.",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating requirement:', error);
      toast({
        title: "Error",
        description: "Failed to update requirement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Requirement</DialogTitle>
          <DialogDescription>
            Update your requirement details to better match with tutors.
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
                <SelectValue placeholder={formData.category ? "Select a subject" : "Select category first"} />
              </SelectTrigger>
              <SelectContent>
                {getSubjectOptions().map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showError('subject') && (
              <p className="text-sm text-red-500 mt-1">{showError('subject')}</p>
            )}
          </div>

          {/* Category-specific fields */}
          {formData.category === 'academic' && (
            <>
              <div className="space-y-2">
                <Label className="text-base font-medium">Class Level *</Label>
                <Select 
                  value={formData.classLevel} 
                  onValueChange={(value) => handleInputChange('classLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary (Classes 1-5)</SelectItem>
                    <SelectItem value="middle">Middle (Classes 6-8)</SelectItem>
                    <SelectItem value="secondary">Secondary (Classes 9-10)</SelectItem>
                    <SelectItem value="higher_secondary">Higher Secondary (Classes 11-12)</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="postgraduate">Postgraduate</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-medium">Board *</Label>
                <Select 
                  value={formData.board} 
                  onValueChange={(value) => handleInputChange('board', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbse">CBSE</SelectItem>
                    <SelectItem value="icse">ICSE</SelectItem>
                    <SelectItem value="state_board">State Board</SelectItem>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                    <SelectItem value="ib">IB</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.board === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="customBoard" className="text-base font-medium">Custom Board Name *</Label>
                  <Input
                    id="customBoard"
                    value={formData.customBoard || ''}
                    onChange={(e) => handleInputChange('customBoard', e.target.value)}
                    placeholder="e.g., International School Board, Local Board, etc."
                    className={showError('customBoard') ? 'border-red-500' : ''}
                  />
                  {showError('customBoard') && (
                    <p className="text-sm text-red-500 mt-1">{showError('customBoard')}</p>
                  )}
                </div>
              )}
            </>
          )}

          {formData.category === 'test_preparation' && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Exam Preparation Level *</Label>
              <Select 
                value={formData.examPreparation} 
                onValueChange={(value) => handleInputChange('examPreparation', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preparation level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="revision">Revision</SelectItem>
                  <SelectItem value="mock_tests">Mock Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.category === 'skills' && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Skill Level *</Label>
              <Select 
                value={formData.skillLevel} 
                onValueChange={(value) => handleInputChange('skillLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="elementary">Elementary</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="upper_intermediate">Upper Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="native">Native</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.category === 'music' && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Age Group *</Label>
              <Select 
                value={formData.ageGroup} 
                onValueChange={(value) => handleInputChange('ageGroup', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="children">Children</SelectItem>
                  <SelectItem value="teens">Teens</SelectItem>
                  <SelectItem value="adults">Adults</SelectItem>
                  <SelectItem value="seniors">Seniors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.category === 'other' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="customCategory" className="text-base font-medium">Custom Category Name *</Label>
                <Input
                  id="customCategory"
                  value={formData.customCategory || ''}
                  onChange={(e) => handleInputChange('customCategory', e.target.value)}
                  placeholder="e.g., Photography, Cooking, Programming, etc."
                  className={showError('customCategory') ? 'border-red-500' : ''}
                />
                {showError('customCategory') && (
                  <p className="text-sm text-red-500 mt-1">{showError('customCategory')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customSubject" className="text-base font-medium">Custom Subject/Skill *</Label>
                <Input
                  id="customSubject"
                  value={formData.customSubject || ''}
                  onChange={(e) => handleInputChange('customSubject', e.target.value)}
                  placeholder="e.g., Adobe Photoshop, Italian Cuisine, React.js, etc."
                  className={showError('customSubject') ? 'border-red-500' : ''}
                />
                {showError('customSubject') && (
                  <p className="text-sm text-red-500 mt-1">{showError('customSubject')}</p>
                )}
              </div>
            </>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what you're looking for in detail..."
              className={`min-h-[100px] ${showError('description') ? 'border-red-500' : ''}`}
            />
            {showError('description') && (
              <p className="text-sm text-red-500 mt-1">{showError('description')}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-medium">Location *</Label>
            <Select 
              value={formData.location} 
              onValueChange={(value) => handleInputChange('location', value)}
            >
              <SelectTrigger className={showError('location') ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hyderabad">Hyderabad</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
                <SelectItem value="kolkata">Kolkata</SelectItem>
                <SelectItem value="pune">Pune</SelectItem>
                <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                <SelectItem value="online">Online Only</SelectItem>
              </SelectContent>
            </Select>
            {showError('location') && (
              <p className="text-sm text-red-500 mt-1">{showError('location')}</p>
            )}
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-base font-medium">Budget Range *</Label>
            <Select 
              value={formData.budget} 
              onValueChange={(value) => handleInputChange('budget', value)}
            >
              <SelectTrigger className={showError('budget') ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500-1000">₹500-1000 per hour</SelectItem>
                <SelectItem value="1000-2000">₹1000-2000 per hour</SelectItem>
                <SelectItem value="2000-3000">₹2000-3000 per hour</SelectItem>
                <SelectItem value="3000+">₹3000+ per hour</SelectItem>
              </SelectContent>
            </Select>
            {showError('budget') && (
              <p className="text-sm text-red-500 mt-1">{showError('budget')}</p>
            )}
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label htmlFor="urgency" className="text-base font-medium">Urgency *</Label>
            <Select 
              value={formData.urgency} 
              onValueChange={(value) => handleInputChange('urgency', value)}
            >
              <SelectTrigger className={showError('urgency') ? 'border-red-500' : ''}>
                <SelectValue placeholder="How urgent is this?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (within 3 months)</SelectItem>
                <SelectItem value="normal">Normal (within 1 month)</SelectItem>
                <SelectItem value="high">High (within 1 week)</SelectItem>
              </SelectContent>
            </Select>
            {showError('urgency') && (
              <p className="text-sm text-red-500 mt-1">{showError('urgency')}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-primary"
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Requirement
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
