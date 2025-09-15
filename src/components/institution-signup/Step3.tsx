import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Step3() {
  const { formData, updateStep3Data, isStep3Valid } = useInstitutionSignup();

  // Local state for form fields
  const [courseCategories, setCourseCategories] = useState<{[key: string]: boolean}>({
    cbse: false,
    icse: false,
    stateBoard: false,
    ibInternational: false,
    competitiveExams: false,
    professionalCourses: false,
    languageClasses: false,
    computerCourses: false,
    artsCrafts: false,
    musicDance: false,
    sportsTraining: false
  });

  // Course detail interface
  interface CourseDetail {
    subjectsOffered: string[];
    classLevels: { beginner: boolean; intermediate: boolean; advanced: boolean };
    batchSizes: string;
    courseDuration: string;
    certificationProvided: string;
    courseFeeStructure: string;
  }

  // Detailed course data for each selected category
  const [courseDetails, setCourseDetails] = useState<{[key: string]: CourseDetail}>({});

  // Available subjects for each category
  const categorySubjects = {
    cbse: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physical Education', 'Arts'],
    icse: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physical Education', 'Arts', 'Literature'],
    stateBoard: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physical Education', 'Arts', 'Regional Language'],
    ibInternational: ['Mathematics', 'Science', 'English', 'Language Acquisition', 'Individuals and Societies', 'Arts', 'Physical Education', 'Design Technology'],
    competitiveExams: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Logical Reasoning', 'General Knowledge', 'Computer Science'],
    professionalCourses: ['Business Management', 'Digital Marketing', 'Data Science', 'Web Development', 'Graphic Design', 'Project Management', 'Finance', 'Human Resources'],
    languageClasses: ['English', 'Hindi', 'French', 'German', 'Spanish', 'Chinese', 'Japanese', 'Arabic', 'Sanskrit'],
    computerCourses: ['Programming', 'Web Development', 'Mobile App Development', 'Data Science', 'Artificial Intelligence', 'Cybersecurity', 'Database Management', 'Cloud Computing'],
    artsCrafts: ['Drawing', 'Painting', 'Sculpture', 'Digital Art', 'Craft Making', 'Photography', 'Graphic Design', 'Textile Design'],
    musicDance: ['Classical Music', 'Western Music', 'Classical Dance', 'Contemporary Dance', 'Folk Dance', 'Instrumental Music', 'Vocal Training', 'Choreography'],
    sportsTraining: ['Cricket', 'Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics', 'Martial Arts', 'Yoga', 'Fitness Training']
  };

  // Course duration options
  const durationOptions = ['3 months', '6 months', '1 year', '2 years'];

  // Batch information state
  const [totalCurrentStudents, setTotalCurrentStudents] = useState<string>('');
  const [averageBatchSize, setAverageBatchSize] = useState<string>('');
  const [studentTeacherRatio, setStudentTeacherRatio] = useState<string>('');
  const [classTimings, setClassTimings] = useState<{
    morningBatches: boolean;
    afternoonBatches: boolean;
    eveningBatches: boolean;
    weekendBatches: boolean;
    flexibleTimings: boolean;
  }>({
    morningBatches: false,
    afternoonBatches: false,
    eveningBatches: false,
    weekendBatches: false,
    flexibleTimings: false
  });

  // Admission process state
  const [admissionTestRequired, setAdmissionTestRequired] = useState<string>('');
  const [minimumQualification, setMinimumQualification] = useState<string>('');
  const [ageRestrictions, setAgeRestrictions] = useState<string>('');
  const [admissionFees, setAdmissionFees] = useState<string>('');
  const [securityDeposit, setSecurityDeposit] = useState<string>('');
  const [refundPolicy, setRefundPolicy] = useState<string>('');
  
  // Ref to prevent infinite re-render loops
  const isSyncingRef = useRef(false);

  // Handle course category checkbox changes
  const handleCourseCategoryChange = (category: string, checked: boolean) => {
    setCourseCategories(prev => ({
      ...prev,
      [category]: checked
    }));
    
    // Initialize course details for newly selected categories
    if (checked && !courseDetails[category]) {
      setCourseDetails(prev => ({
        ...prev,
        [category]: {
          subjectsOffered: [],
          classLevels: { beginner: false, intermediate: false, advanced: false },
          batchSizes: '',
          courseDuration: '',
          certificationProvided: '',
          courseFeeStructure: ''
        }
      }));
    }
  };

  // Handle subject selection changes
  const handleSubjectChange = (category: string, subject: string, checked: boolean) => {
    setCourseDetails(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        subjectsOffered: checked 
          ? [...(prev[category]?.subjectsOffered || []), subject]
          : (prev[category]?.subjectsOffered || []).filter(s => s !== subject)
      }
    }));
  };

  // Handle class level changes
  const handleClassLevelChange = (category: string, level: string, checked: boolean) => {
    setCourseDetails(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        classLevels: {
          ...prev[category]?.classLevels,
          [level]: checked
        }
      }
    }));
  };

  // Handle other course detail changes
  const handleCourseDetailChange = (category: string, field: string, value: string) => {
    setCourseDetails(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Handle class timing changes
  const handleClassTimingChange = (timing: string, checked: boolean) => {
    setClassTimings(prev => ({
      ...prev,
      [timing]: checked
    }));
  };

  // Load saved data from context on component mount only
  useEffect(() => {
    // Only sync on initial load, not on every field change
    if (formData.step3 && !isSyncingRef.current) {
      isSyncingRef.current = true;
      const step3Data = formData.step3;
      
      // Always sync all fields, even if they're empty
      setCourseCategories(step3Data.courseCategories || {});
      setCourseDetails(step3Data.courseDetails || {});
      setTotalCurrentStudents(step3Data.totalCurrentStudents || '');
      setAverageBatchSize(step3Data.averageBatchSize || '');
      setStudentTeacherRatio(step3Data.studentTeacherRatio || '');
      setClassTimings(step3Data.classTimings || { morningBatches: false, afternoonBatches: false, eveningBatches: false, weekendBatches: false });
      setAdmissionTestRequired(step3Data.admissionTestRequired || '');
      setMinimumQualification(step3Data.minimumQualification || '');
      setAgeRestrictions(step3Data.ageRestrictions || '');
      setAdmissionFees(step3Data.admissionFees || '');
      setSecurityDeposit(step3Data.securityDeposit || '');
      setRefundPolicy(step3Data.refundPolicy || '');
      
      console.log('Step 3 data synced from context:', step3Data);
      
      // Reset the flag after a short delay to allow for initial sync
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    }
  }, []); // Empty dependency array - only run on mount

  // Update context whenever local state changes
  useEffect(() => {
    // Only update context if we're not in the middle of syncing from context
    if (!isSyncingRef.current) {
      updateStep3Data({
        courseCategories,
        courseDetails,
        totalCurrentStudents,
        averageBatchSize,
        studentTeacherRatio,
        classTimings,
        admissionTestRequired,
        minimumQualification,
        ageRestrictions,
        admissionFees,
        securityDeposit,
        refundPolicy
      });
    }
  }, [courseCategories, courseDetails, totalCurrentStudents, averageBatchSize, studentTeacherRatio, classTimings, admissionTestRequired, minimumQualification, ageRestrictions, admissionFees, securityDeposit, refundPolicy, updateStep3Data]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Courses & Programs Offered</h2>
        <p className="text-muted-foreground">
          This step will contain information about the courses and programs your institution offers
        </p>
      </div>
      
      {/* Academic Courses Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Academic Courses</h3>
          <p className="text-muted-foreground">
            Select the types of courses and programs your institution offers
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Course Categories Field */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Course Categories <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  id="cbse"
                  type="checkbox"
                  checked={courseCategories.cbse}
                  onChange={(e) => handleCourseCategoryChange('cbse', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="cbse" className="text-sm">CBSE</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="icse"
                  type="checkbox"
                  checked={courseCategories.icse}
                  onChange={(e) => handleCourseCategoryChange('icse', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="icse" className="text-sm">ICSE</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="stateBoard"
                  type="checkbox"
                  checked={courseCategories.stateBoard}
                  onChange={(e) => handleCourseCategoryChange('stateBoard', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="stateBoard" className="text-sm">State Board</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="ibInternational"
                  type="checkbox"
                  checked={courseCategories.ibInternational}
                  onChange={(e) => handleCourseCategoryChange('ibInternational', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="ibInternational" className="text-sm">IB/International</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="competitiveExams"
                  type="checkbox"
                  checked={courseCategories.competitiveExams}
                  onChange={(e) => handleCourseCategoryChange('competitiveExams', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="competitiveExams" className="text-sm">Competitive Exams</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="professionalCourses"
                  type="checkbox"
                  checked={courseCategories.professionalCourses}
                  onChange={(e) => handleCourseCategoryChange('professionalCourses', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="professionalCourses" className="text-sm">Professional Courses</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="languageClasses"
                  type="checkbox"
                  checked={courseCategories.languageClasses}
                  onChange={(e) => handleCourseCategoryChange('languageClasses', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="languageClasses" className="text-sm">Language Classes</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="computerCourses"
                  type="checkbox"
                  checked={courseCategories.computerCourses}
                  onChange={(e) => handleCourseCategoryChange('computerCourses', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="computerCourses" className="text-sm">Computer Courses</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="artsCrafts"
                  type="checkbox"
                  checked={courseCategories.artsCrafts}
                  onChange={(e) => handleCourseCategoryChange('artsCrafts', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="artsCrafts" className="text-sm">Arts & Crafts</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="musicDance"
                  type="checkbox"
                  checked={courseCategories.musicDance}
                  onChange={(e) => handleCourseCategoryChange('musicDance', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="musicDance" className="text-sm">Music & Dance</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="sportsTraining"
                  type="checkbox"
                  checked={courseCategories.sportsTraining}
                  onChange={(e) => handleCourseCategoryChange('sportsTraining', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="sportsTraining" className="text-sm">Sports Training</Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Select all the course categories that apply to your institution
              </p>
              <span className="text-xs text-muted-foreground">
                {Object.values(courseCategories).filter(Boolean).length}/11 selected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Course Fields for Selected Categories */}
      {Object.entries(courseCategories).filter(([_, selected]) => selected).map(([category, _]) => (
        <div key={category} className="space-y-6 border-t border-border pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 capitalize">
              {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Details
            </h3>
            <p className="text-muted-foreground">
              Configure detailed information for {category.replace(/([A-Z])/g, ' $1').toLowerCase()} courses
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Subjects Offered */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Subjects Offered <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categorySubjects[category as keyof typeof categorySubjects]?.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <input
                      id={`${category}-${subject}`}
                      type="checkbox"
                      checked={courseDetails[category]?.subjectsOffered?.includes(subject) || false}
                      onChange={(e) => handleSubjectChange(category, subject, e.target.checked)}
                      className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                    />
                    <Label htmlFor={`${category}-${subject}`} className="text-sm">{subject}</Label>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Select subjects offered in this category
                </p>
                <span className="text-xs text-muted-foreground">
                  {courseDetails[category]?.subjectsOffered?.length || 0} selected
                </span>
              </div>
            </div>

            {/* Class Levels */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Class Levels <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    id={`${category}-beginner`}
                    type="checkbox"
                    checked={courseDetails[category]?.classLevels?.beginner || false}
                    onChange={(e) => handleClassLevelChange(category, 'beginner', e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor={`${category}-beginner`} className="text-sm">Beginner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id={`${category}-intermediate`}
                    type="checkbox"
                    checked={courseDetails[category]?.classLevels?.intermediate || false}
                    onChange={(e) => handleClassLevelChange(category, 'intermediate', e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor={`${category}-intermediate`} className="text-sm">Intermediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id={`${category}-advanced`}
                    type="checkbox"
                    checked={courseDetails[category]?.classLevels?.advanced || false}
                    onChange={(e) => handleClassLevelChange(category, 'advanced', e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor={`${category}-advanced`} className="text-sm">Advanced</Label>
                </div>
              </div>
            </div>

            {/* Batch Sizes */}
            <div className="space-y-2">
              <Label htmlFor={`${category}-batch-sizes`} className="text-sm font-medium">
                Batch Sizes <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`${category}-batch-sizes`}
                type="text"
                placeholder="e.g., 15-20 students, Individual, 10-15 students"
                value={courseDetails[category]?.batchSizes || ''}
                onChange={(e) => handleCourseDetailChange(category, 'batchSizes', e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Specify batch sizes or ranges (e.g., "15-20 students", "Individual", "10-15 students")
              </p>
            </div>

            {/* Course Duration */}
            <div className="space-y-2">
              <Label htmlFor={`${category}-duration`} className="text-sm font-medium">
                Course Duration Options
              </Label>
              <select
                id={`${category}-duration`}
                value={courseDetails[category]?.courseDuration || ''}
                onChange={(e) => handleCourseDetailChange(category, 'courseDuration', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select duration</option>
                {durationOptions.map((duration) => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>

            {/* Certification Provided */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Certification Provided
              </Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id={`${category}-cert-yes`}
                    type="radio"
                    name={`${category}-certification`}
                    value="yes"
                    checked={courseDetails[category]?.certificationProvided === 'yes'}
                    onChange={(e) => handleCourseDetailChange(category, 'certificationProvided', e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor={`${category}-cert-yes`} className="text-sm">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id={`${category}-cert-no`}
                    type="radio"
                    name={`${category}-certification`}
                    value="no"
                    checked={courseDetails[category]?.certificationProvided === 'no'}
                    onChange={(e) => handleCourseDetailChange(category, 'certificationProvided', e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor={`${category}-cert-no`} className="text-sm">No</Label>
                </div>
              </div>
            </div>

            {/* Course Fee Structure */}
            <div className="space-y-2">
              <Label htmlFor={`${category}-fees`} className="text-sm font-medium">
                Course Fee Structure <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`${category}-fees`}
                type="text"
                placeholder="e.g., ₹5000 per subject, ₹15000 per course, ₹2000 per month"
                value={courseDetails[category]?.courseFeeStructure || ''}
                onChange={(e) => handleCourseDetailChange(category, 'courseFeeStructure', e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Specify fee structure (per subject, per course, per month, etc.)
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Batch Information Section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Batch Information</h3>
          <p className="text-muted-foreground">
            Provide information about your current student batches
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Total Current Students */}
          <div className="space-y-2">
            <Label htmlFor="total-current-students" className="text-sm font-medium">
              Total Current Students <span className="text-red-500">*</span>
            </Label>
            <Input
              id="total-current-students"
              type="number"
              min="1"
              max="10000"
              placeholder="Enter total number of current students"
              value={totalCurrentStudents}
              onChange={(e) => setTotalCurrentStudents(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the total number of students currently enrolled across all courses
            </p>
          </div>

          {/* Average Batch Size */}
          <div className="space-y-2">
            <Label htmlFor="average-batch-size" className="text-sm font-medium">
              Average Batch Size <span className="text-red-500">*</span>
            </Label>
            <Input
              id="average-batch-size"
              type="number"
              min="1"
              max="100"
              placeholder="Enter average number of students per batch"
              value={averageBatchSize}
              onChange={(e) => setAverageBatchSize(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the average number of students typically in each batch/class
            </p>
          </div>

          {/* Student-Teacher Ratio */}
          <div className="space-y-2">
            <Label htmlFor="student-teacher-ratio" className="text-sm font-medium">
              Student-Teacher Ratio <span className="text-red-500">*</span>
            </Label>
            <Input
              id="student-teacher-ratio"
              type="text"
              placeholder="e.g., 15:1, 20:1, 25:1"
              value={studentTeacherRatio}
              onChange={(e) => setStudentTeacherRatio(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the ratio of students to teachers (e.g., 15:1 means 15 students per teacher)
            </p>
          </div>

          {/* Class Timings Available */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Class Timings Available
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  id="morning-batches"
                  type="checkbox"
                  checked={classTimings.morningBatches}
                  onChange={(e) => handleClassTimingChange('morningBatches', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="morning-batches" className="text-sm">Morning Batches</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="afternoon-batches"
                  type="checkbox"
                  checked={classTimings.afternoonBatches}
                  onChange={(e) => handleClassTimingChange('afternoonBatches', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="afternoon-batches" className="text-sm">Afternoon Batches</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="evening-batches"
                  type="checkbox"
                  checked={classTimings.eveningBatches}
                  onChange={(e) => handleClassTimingChange('eveningBatches', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="evening-batches" className="text-sm">Evening Batches</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="weekend-batches"
                  type="checkbox"
                  checked={classTimings.weekendBatches}
                  onChange={(e) => handleClassTimingChange('weekendBatches', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="weekend-batches" className="text-sm">Weekend Batches</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="flexible-timings"
                  type="checkbox"
                  checked={classTimings.flexibleTimings}
                  onChange={(e) => handleClassTimingChange('flexibleTimings', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="flexible-timings" className="text-sm">Flexible Timings</Label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Select all the class timing options your institution offers
              </p>
              <span className="text-xs text-muted-foreground">
                {Object.values(classTimings).filter(Boolean).length}/5 selected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admission Process Section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Admission Process</h3>
          <p className="text-muted-foreground">
            Configure your institution's admission requirements and process
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Admission Test Required */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Admission Test Required
            </Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  id="admission-test-yes"
                  type="radio"
                  name="admissionTestRequired"
                  value="yes"
                  checked={admissionTestRequired === 'yes'}
                  onChange={(e) => setAdmissionTestRequired(e.target.value)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="admission-test-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="admission-test-no"
                  type="radio"
                  name="admissionTestRequired"
                  value="no"
                  checked={admissionTestRequired === 'no'}
                  onChange={(e) => setAdmissionTestRequired(e.target.value)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
                <Label htmlFor="admission-test-no" className="text-sm">No</Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Indicate whether students need to take an admission test before enrollment
            </p>
          </div>

          {/* Minimum Qualification Required */}
          <div className="space-y-2">
            <Label htmlFor="minimum-qualification" className="text-sm font-medium">
              Minimum Qualification Required
            </Label>
            <select
              id="minimum-qualification"
              value={minimumQualification}
              onChange={(e) => setMinimumQualification(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select minimum qualification</option>
              <option value="no-formal-education">No Formal Education Required</option>
              <option value="primary">Primary Education (Class 1-5)</option>
              <option value="upper-primary">Upper Primary (Class 6-8)</option>
              <option value="secondary">Secondary (Class 9-10)</option>
              <option value="higher-secondary">Higher Secondary (Class 11-12)</option>
              <option value="diploma">Diploma</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD/Doctorate</option>
              <option value="other">Other (Specify)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Select the minimum educational qualification required for admission
            </p>
          </div>

          {/* Age Restrictions */}
          <div className="space-y-2">
            <Label htmlFor="age-restrictions" className="text-sm font-medium">
              Age Restrictions (if any)
            </Label>
            <Input
              id="age-restrictions"
              type="text"
              placeholder="e.g., 5-18 years, 16+ years, No age restrictions, Adults only (18+)"
              value={ageRestrictions}
              onChange={(e) => setAgeRestrictions(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Specify any age limits or restrictions for admission (leave blank if no restrictions)
            </p>
          </div>

          {/* Admission Fees */}
          <div className="space-y-2">
            <Label htmlFor="admission-fees" className="text-sm font-medium">
              Admission Fees <span className="text-red-500">*</span>
            </Label>
            <Input
              id="admission-fees"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter admission fee amount"
              value={admissionFees}
              onChange={(e) => setAdmissionFees(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the one-time admission fee required for new students (in ₹)
            </p>
          </div>

          {/* Security Deposit */}
          <div className="space-y-2">
            <Label htmlFor="security-deposit" className="text-sm font-medium">
              Security Deposit
            </Label>
            <Input
              id="security-deposit"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter security deposit amount (optional)"
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the refundable security deposit amount if applicable (leave blank if not required)
            </p>
          </div>

          {/* Refund Policy */}
          <div className="space-y-2">
            <Label htmlFor="refund-policy" className="text-sm font-medium">
              Refund Policy
            </Label>
            <textarea
              id="refund-policy"
              placeholder="Describe your institution's refund policy for fees, deposits, and course withdrawals..."
              value={refundPolicy}
              onChange={(e) => setRefundPolicy(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Explain your refund policy clearly for students and parents
              </p>
              <span className="text-xs text-muted-foreground">
                {refundPolicy.length}/500 characters
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
