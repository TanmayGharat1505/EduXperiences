import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Step4() {
  const { formData, updateStep4Data, isStep4Valid } = useInstitutionSignup();

  // Local state for form fields
  const [totalTeachingStaff, setTotalTeachingStaff] = useState<string>('');
  const [totalNonTeachingStaff, setTotalNonTeachingStaff] = useState<string>('');
  const [averageFacultyExperience, setAverageFacultyExperience] = useState<string>('');
  const [principalDirectorName, setPrincipalDirectorName] = useState<string>('');
  const [principalDirectorQualification, setPrincipalDirectorQualification] = useState<string>('');
  const [principalDirectorExperience, setPrincipalDirectorExperience] = useState<string>('');
  const [principalDirectorPhoto, setPrincipalDirectorPhoto] = useState<File | null>(null);
  const [principalDirectorBio, setPrincipalDirectorBio] = useState<string>('');
  
  // Department heads state
  const [departmentHeads, setDepartmentHeads] = useState<Array<{
    id: string;
    name: string;
    department: string;
    qualification: string;
    experience: string;
    photo: File | null;
    specialization: string;
  }>>([]);

  // Faculty qualifications state
  const [phdHolders, setPhdHolders] = useState<string>('');
  const [postGraduates, setPostGraduates] = useState<string>('');
  const [graduates, setGraduates] = useState<string>('');
  const [professionalCertified, setProfessionalCertified] = useState<string>('');
  
  // Faculty achievements state
  const [awardsReceived, setAwardsReceived] = useState<string>('');
  const [publications, setPublications] = useState<string>('');
  const [industryExperience, setIndustryExperience] = useState<string>('');
  const [trainingPrograms, setTrainingPrograms] = useState<string>('');
  
  // Ref to prevent infinite re-render loops
  const isSyncingRef = useRef(false);

  // Handle file upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setPrincipalDirectorPhoto(file);
      toast.success('Photo uploaded successfully!');
    }
  };

  // Remove uploaded photo
  const removePhoto = () => {
    setPrincipalDirectorPhoto(null);
    toast.success('Photo removed');
  };

  // Add new department head
  const addDepartmentHead = () => {
    const newHead = {
      id: Date.now().toString(),
      name: '',
      department: '',
      qualification: '',
      experience: '',
      photo: null,
      specialization: ''
    };
    setDepartmentHeads([...departmentHeads, newHead]);
  };

  // Remove department head
  const removeDepartmentHead = (id: string) => {
    setDepartmentHeads(departmentHeads.filter(head => head.id !== id));
    toast.success('Department head removed');
  };

  // Update department head field
  const updateDepartmentHead = (id: string, field: string, value: string | File | null) => {
    setDepartmentHeads(departmentHeads.map(head => 
      head.id === id ? { ...head, [field]: value } : head
    ));
  };

  // Handle department head photo upload
  const handleDepartmentHeadPhotoUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      updateDepartmentHead(id, 'photo', file);
      toast.success('Photo uploaded successfully!');
    }
  };

  // Load saved data from context on component mount only
  useEffect(() => {
    // Only sync on initial load, not on every field change
    if (formData.step4 && !isSyncingRef.current) {
      isSyncingRef.current = true;
      const step4Data = formData.step4;
      
      // Always sync all fields, even if they're empty strings
      setTotalTeachingStaff(step4Data.totalTeachingStaff || '');
      setTotalNonTeachingStaff(step4Data.totalNonTeachingStaff || '');
      setAverageFacultyExperience(step4Data.averageFacultyExperience || '');
      setPrincipalDirectorName(step4Data.principalDirectorName || '');
      setPrincipalDirectorQualification(step4Data.principalDirectorQualification || '');
      setPrincipalDirectorExperience(step4Data.principalDirectorExperience || '');
      setPrincipalDirectorPhoto(step4Data.principalDirectorPhoto || null);
      setPrincipalDirectorBio(step4Data.principalDirectorBio || '');
      setDepartmentHeads(step4Data.departmentHeads || '');
      setPhdHolders(step4Data.phdHolders || '');
      setPostGraduates(step4Data.postGraduates || '');
      setGraduates(step4Data.graduates || '');
      setProfessionalCertified(step4Data.professionalCertified || '');
      setAwardsReceived(step4Data.awardsReceived || '');
      setPublications(step4Data.publications || '');
      setIndustryExperience(step4Data.industryExperience || '');
      setTrainingPrograms(step4Data.trainingPrograms || '');
      
      console.log('Step 4 data synced from context:', step4Data);
      
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
      updateStep4Data({
        totalTeachingStaff,
        totalNonTeachingStaff,
        averageFacultyExperience,
        principalDirectorName,
        principalDirectorQualification,
        principalDirectorExperience,
        principalDirectorPhoto,
        principalDirectorBio,
        departmentHeads,
        phdHolders,
        postGraduates,
        graduates,
        professionalCertified,
        awardsReceived,
        publications,
        industryExperience,
        trainingPrograms
      });
    }
  }, [totalTeachingStaff, totalNonTeachingStaff, averageFacultyExperience, principalDirectorName, principalDirectorQualification, principalDirectorExperience, principalDirectorPhoto, principalDirectorBio, departmentHeads, phdHolders, postGraduates, graduates, professionalCertified, awardsReceived, publications, industryExperience, trainingPrograms, updateStep4Data]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Faculty & Staff Information
        </h2>
        <p className="text-lg text-gray-600">
          Provide details about your institution's teaching staff and administrative personnel
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Faculty Details Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Faculty Details</h3>
            <p className="text-muted-foreground">
              Provide information about your teaching and non-teaching staff
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalTeachingStaff" className="text-sm font-medium">
                Total Teaching Staff <span className="text-red-500">*</span>
              </Label>
              <Input
                id="totalTeachingStaff"
                type="number"
                min="1"
                max="1000"
                placeholder="Enter total number of teaching staff"
                value={totalTeachingStaff}
                onChange={(e) => setTotalTeachingStaff(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Enter the total number of teaching staff members in your institution
              </p>
            </div>
            <div className="space-y-2">
                             <Label htmlFor="totalNonTeachingStaff" className="text-sm font-medium">
                 Total Non-Teaching Staff
               </Label>
              <Input
                id="totalNonTeachingStaff"
                type="number"
                min="0"
                max="1000"
                placeholder="Enter total number of non-teaching staff"
                value={totalNonTeachingStaff}
                onChange={(e) => setTotalNonTeachingStaff(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Enter the total number of non-teaching staff members in your institution
              </p>
            </div>
          </div>

          {/* Average Faculty Experience Field */}
          <div className="space-y-2">
            <Label htmlFor="averageFacultyExperience" className="text-sm font-medium">
              Average Faculty Experience <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <select
                id="averageFacultyExperience"
                value={averageFacultyExperience}
                onChange={(e) => setAverageFacultyExperience(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-10"
              >
                <option value="">Select faculty experience range</option>
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500">
              Select the average experience range of your teaching faculty
            </p>
          </div>
        </div>

        {/* Principal/Director Information Section */}
        <div className="space-y-6 border-t border-border pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Principal/Director Information</h3>
            <p className="text-muted-foreground">
              Provide details about your institution's principal or director
            </p>
          </div>

          <div className="space-y-2">
                          <Label htmlFor="principalDirectorName" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
            <Input
              id="principalDirectorName"
              type="text"
              placeholder="Enter the name of the principal or director"
              value={principalDirectorName}
              onChange={(e) => setPrincipalDirectorName(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Enter the full name of the principal or director of your institution
            </p>
          </div>
          <div className="space-y-2">
                          <Label htmlFor="principalDirectorQualification" className="text-sm font-medium">
                Qualification <span className="text-red-500">*</span>
              </Label>
            <Input
              id="principalDirectorQualification"
              type="text"
              placeholder="Enter the qualification of the principal or director"
              value={principalDirectorQualification}
              onChange={(e) => setPrincipalDirectorQualification(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Enter the qualification of the principal or director of your institution
            </p>
          </div>
          <div className="space-y-2">
                          <Label htmlFor="principalDirectorExperience" className="text-sm font-medium">
                Experience <span className="text-red-500">*</span>
              </Label>
            <Input
              id="principalDirectorExperience"
              type="number"
              min="0"
              max="50"
              placeholder="Enter the experience of the principal or director (in years)"
              value={principalDirectorExperience}
              onChange={(e) => setPrincipalDirectorExperience(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Enter the number of years of experience the principal or director has
            </p>
          </div>
          <div className="space-y-2">
                          <Label htmlFor="principalDirectorBio" className="text-sm font-medium">
                Brief Bio
              </Label>
            <textarea
              id="principalDirectorBio"
              rows={4}
              placeholder="Write a brief bio for the principal or director (max 300 words)"
              value={principalDirectorBio}
              onChange={(e) => setPrincipalDirectorBio(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <p className="text-xs text-gray-500">
              Provide a brief summary of the principal or director's background and achievements.
            </p>
          </div>
          <div className="space-y-2">
                          <Label htmlFor="principalDirectorPhoto" className="text-sm font-medium">
                Photo Upload <span className="text-red-500">*</span>
              </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="principalDirectorPhoto"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="flex-1"
              />
              {principalDirectorPhoto && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removePhoto}
                  className="h-10"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload a photo of the principal or director.
            </p>
          </div>
        </div>

        {/* Head of Departments Section */}
        <div className="space-y-6 border-t border-border pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Head of Departments</h3>
            <p className="text-muted-foreground">
              Provide information about the heads of different departments
            </p>
          </div>
          {departmentHeads.map((head, index) => (
            <div key={head.id} className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900">
                  Department Head {index + 1}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeDepartmentHead(head.id)}
                  className="h-8"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                                     <Label htmlFor={`departmentHeadName-${head.id}`} className="text-sm font-medium">
                     Name <span className="text-red-500">*</span>
                   </Label>
                  <Input
                    id={`departmentHeadName-${head.id}`}
                    type="text"
                    placeholder="Enter the name of the department head"
                    value={head.name}
                    onChange={(e) => updateDepartmentHead(head.id, 'name', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                                     <Label htmlFor={`departmentHeadDepartment-${head.id}`} className="text-sm font-medium">
                     Department <span className="text-red-500">*</span>
                   </Label>
                  <Input
                    id={`departmentHeadDepartment-${head.id}`}
                    type="text"
                    placeholder="Enter the department name"
                    value={head.department}
                    onChange={(e) => updateDepartmentHead(head.id, 'department', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                                     <Label htmlFor={`departmentHeadQualification-${head.id}`} className="text-sm font-medium">
                     Qualification <span className="text-red-500">*</span>
                   </Label>
                  <Input
                    id={`departmentHeadQualification-${head.id}`}
                    type="text"
                    placeholder="Enter the qualification of the department head"
                    value={head.qualification}
                    onChange={(e) => updateDepartmentHead(head.id, 'qualification', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                                     <Label htmlFor={`departmentHeadExperience-${head.id}`} className="text-sm font-medium">
                     Experience <span className="text-red-500">*</span>
                   </Label>
                  <Input
                    id={`departmentHeadExperience-${head.id}`}
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Enter the experience of the department head (in years)"
                    value={head.experience}
                    onChange={(e) => updateDepartmentHead(head.id, 'experience', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                                     <Label htmlFor={`departmentHeadPhoto-${head.id}`} className="text-sm font-medium">
                     Photo Upload
                   </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`departmentHeadPhoto-${head.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleDepartmentHeadPhotoUpload(head.id, e)}
                      className="flex-1"
                    />
                    {head.photo && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateDepartmentHead(head.id, 'photo', null)}
                        className="h-10"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`departmentHeadSpecialization-${head.id}`} className="text-sm font-medium">
                    Specialization
                  </Label>
                  <Input
                    id={`departmentHeadSpecialization-${head.id}`}
                    type="text"
                    placeholder="Enter the specialization of the department head"
                    value={head.specialization}
                    onChange={(e) => updateDepartmentHead(head.id, 'specialization', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            onClick={addDepartmentHead}
            variant="outline"
            className="w-full"
          >
            Add Another Department Head
          </Button>
        </div>
      </div>



      {/* Faculty Qualifications Section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Faculty Qualifications</h3>
          <p className="text-muted-foreground">
            Provide information about the qualification levels of your teaching faculty
          </p>
        </div>
        
        <div className="space-y-4">
          {/* PhD Holders Field */}
          <div className="space-y-2">
            <Label htmlFor="phd-holders" className="text-sm font-medium">
              PhD Holders
            </Label>
            <Input
              id="phd-holders"
              type="number"
              min="0"
              max="1000"
              placeholder="Enter number of PhD holders"
              value={phdHolders}
              onChange={(e) => setPhdHolders(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the total number of faculty members who hold PhD degrees
            </p>
          </div>

          {/* Post Graduates Field */}
          <div className="space-y-2">
            <Label htmlFor="post-graduates" className="text-sm font-medium">
              Post Graduates
            </Label>
            <Input
              id="post-graduates"
              type="number"
              min="0"
              max="1000"
              placeholder="Enter number of post graduates"
              value={postGraduates}
              onChange={(e) => setPostGraduates(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the total number of faculty members who hold postgraduate degrees (Masters, MPhil, etc.)
            </p>
          </div>

          {/* Graduates Field */}
          <div className="space-y-2">
            <Label htmlFor="graduates" className="text-sm font-medium">
              Graduates
            </Label>
            <Input
              id="graduates"
              type="number"
              min="0"
              max="1000"
              placeholder="Enter number of graduates"
              value={graduates}
              onChange={(e) => setGraduates(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the total number of faculty members who hold graduate degrees (Bachelor's, etc.)
            </p>
          </div>

          {/* Professional Certified Field */}
          <div className="space-y-2">
            <Label htmlFor="professional-certified" className="text-sm font-medium">
              Professional Certified
            </Label>
            <Input
              id="professional-certified"
              type="number"
              min="0"
              max="1000"
              placeholder="Enter number of professional certified staff"
              value={professionalCertified}
              onChange={(e) => setProfessionalCertified(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the total number of staff members with professional certifications (industry certifications, etc.)
            </p>
          </div>
        </div>
      </div>

      {/* Faculty Achievements Section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Faculty Achievements</h3>
          <p className="text-muted-foreground">
            Highlight the achievements and recognitions received by your faculty members
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Awards Received Field */}
          <div className="space-y-2">
            <Label htmlFor="awards-received" className="text-sm font-medium">
              Awards Received
            </Label>
            <textarea
              id="awards-received"
              rows={4}
              placeholder="List the awards, recognitions, and achievements received by your faculty members"
              value={awardsReceived}
              onChange={(e) => setAwardsReceived(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground">
              Describe any awards, honors, or recognitions received by your faculty members (e.g., Best Teacher Awards, Research Excellence Awards, etc.)
            </p>
          </div>

          {/* Publications Field */}
          <div className="space-y-2">
            <Label htmlFor="publications" className="text-sm font-medium">
              Publications
            </Label>
            <textarea
              id="publications"
              rows={4}
              placeholder="List the research papers, books, articles, and other publications by your faculty members"
              value={publications}
              onChange={(e) => setPublications(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground">
              List research papers, books, journal articles, conference proceedings, and other academic publications by your faculty members
            </p>
          </div>

          {/* Industry Experience Field */}
          <div className="space-y-2">
            <Label htmlFor="industry-experience" className="text-sm font-medium">
              Industry Experience
            </Label>
            <textarea
              id="industry-experience"
              rows={4}
              placeholder="Describe the industry experience and corporate background of your faculty members"
              value={industryExperience}
              onChange={(e) => setIndustryExperience(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground">
              Describe any industry experience, corporate work experience, or practical business experience your faculty members have before joining academia
            </p>
          </div>

          {/* Training Programs Attended Field */}
          <div className="space-y-2">
            <Label htmlFor="training-programs" className="text-sm font-medium">
              Training Programs Attended
            </Label>
            <textarea
              id="training-programs"
              rows={4}
              placeholder="List the training programs, workshops, and professional development courses attended by your faculty members"
              value={trainingPrograms}
              onChange={(e) => setTrainingPrograms(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground">
              List any training programs, workshops, seminars, or professional development courses that your faculty members have attended to enhance their skills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
