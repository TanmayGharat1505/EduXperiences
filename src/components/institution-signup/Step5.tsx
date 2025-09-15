import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { XCircle } from 'lucide-react';
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext';

export default function Step5() {
  const { updateStep5Data, formData } = useInstitutionSignup();
  
  // Local state for form data
  const [boardExamResults, setBoardExamResults] = React.useState([
    { year: '', passPercentage: '', distinctionPercentage: '', topScorerDetails: '' },
    { year: '', passPercentage: '', distinctionPercentage: '', topScorerDetails: '' },
    { year: '', passPercentage: '', distinctionPercentage: '', topScorerDetails: '' }
  ]);
  
  const [competitiveExamResults, setCompetitiveExamResults] = React.useState([
    {
      id: 1,
      examType: '',
      year: '',
      totalStudentsAppeared: '',
      qualifiedStudents: '',
      topRanksAchieved: '',
      successPercentage: '',
    },
  ]);
  
  const [institutionAwards, setInstitutionAwards] = React.useState({
    institutionAwards: '',
    governmentRecognition: '',
    educationBoardAwards: '',
    qualityCertifications: '',
    mediaRecognition: ''
  });
  
  const [studentAchievements, setStudentAchievements] = React.useState({
    sportsAchievements: '',
    culturalAchievements: '',
    academicExcellenceAwards: '',
    competitionWinners: ''
  });
  
  const [accreditations, setAccreditations] = React.useState({
    governmentAccreditation: '',
    boardAffiliationDetails: '',
    universityAffiliation: '',
    professionalBodyMembership: '',
    qualityCertifications: '',
    certificateDocuments: [] as File[]
  });
  
  const [successStories, setSuccessStories] = React.useState({
    alumniSuccessStories: '',
    placementRecords: '',
    higherStudiesAdmissions: '',
    scholarshipRecipients: ''
  });

  const addCompetitiveExam = () => {
    setCompetitiveExamResults([
      ...competitiveExamResults,
      {
        id: competitiveExamResults.length + 1,
        examType: '',
        year: '',
        totalStudentsAppeared: '',
        qualifiedStudents: '',
        topRanksAchieved: '',
        successPercentage: '',
      },
    ]);
  };

  const removeCompetitiveExam = (id: number) => {
    setCompetitiveExamResults(competitiveExamResults.filter(exam => exam.id !== id));
  };

  const handleCompetitiveExamChange = (id: number, field: string, value: string) => {
    setCompetitiveExamResults(competitiveExamResults.map(exam =>
      exam.id === id ? { ...exam, [field]: value } : exam
    ));
  };

  // Update context whenever local state changes
  React.useEffect(() => {
    updateStep5Data({
      boardExamResults,
      competitiveExamResults,
      institutionAwards,
      studentAchievements,
      accreditations,
      successStories
    });
  }, [boardExamResults, competitiveExamResults, institutionAwards, studentAchievements, accreditations, successStories, updateStep5Data]);

  // Load saved data from context on component mount and when context changes
  useEffect(() => {
    // Sync local state with context data
    if (formData.step5) {
      const step5Data = formData.step5;
      if (step5Data.boardExamResults) setBoardExamResults(step5Data.boardExamResults);
      if (step5Data.competitiveExamResults) setCompetitiveExamResults(step5Data.competitiveExamResults);
      if (step5Data.institutionAwards) setInstitutionAwards(step5Data.institutionAwards);
      if (step5Data.studentAchievements) setStudentAchievements(step5Data.studentAchievements);
      if (step5Data.accreditations) setAccreditations(step5Data.accreditations);
      if (step5Data.successStories) setSuccessStories(step5Data.successStories);
      
      console.log('Step 5 data synced from context:', step5Data);
    }
  }, [formData.step5]);

  // Handle file upload for certificate documents
  const handleCertificateDocumentsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setAccreditations(prev => ({
        ...prev,
        certificateDocuments: [...prev.certificateDocuments, ...fileArray]
      }));
    }
  };

  // Remove certificate document
  const removeCertificateDocument = (index: number) => {
    setAccreditations(prev => ({
      ...prev,
      certificateDocuments: prev.certificateDocuments.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Results & Achievements
        </h2>
        <p className="text-lg text-gray-600">
          Showcase your institution's academic performance and achievements
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Academic Results Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Academic Results</h3>
            <p className="text-muted-foreground">
              Provide details about your institution's academic performance in board examinations
            </p>
          </div>

          {/* Board Exam Results - Last 3 Years */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 text-left">
              Board Exam Results (Last 3 Years)
            </h4>
            
            {/* Year 1 */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h5 className="text-md font-medium text-gray-800">Year 1</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select year</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Pass Percentage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter pass percentage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Distinction Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter distinction percentage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Top Scorer Details (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Name, Marks (e.g., John Doe, 95%)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Year 2 */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h5 className="text-md font-medium text-gray-800">Year 2</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select year</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Pass Percentage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter pass percentage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Distinction Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter distinction percentage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Top Scorer Details (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Name, Marks (e.g., John Doe, 95%)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Year 3 */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h5 className="text-md font-medium text-gray-800">Year 3</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select year</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Pass Percentage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter pass percentage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Distinction Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter distinction percentage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Top Scorer Details (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Name, Marks (e.g., John Doe, 95%)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitive Exam Results Section */}
        <div className="space-y-6 border-t border-border pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Competitive Exam Results</h3>
            <p className="text-muted-foreground">
              Showcase your institution's performance in competitive examinations
            </p>
          </div>

          <div className="space-y-6">
            {competitiveExamResults.map((exam, index) => (
              <div key={exam.id} className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900">
                    Exam {index + 1}
                  </h4>
                  <button
                    onClick={() => removeCompetitiveExam(exam.id)}
                    className="h-8"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Exam Type */}
                  <div className="space-y-2">
                                         <Label htmlFor={`exam-type-${exam.id}`} className="text-sm font-medium">
                       Exam Type
                     </Label>
                    <Select
                      value={exam.examType}
                      onValueChange={(value) => handleCompetitiveExamChange(exam.id, 'examType', value)}
                    >
                      <SelectTrigger id={`exam-type-${exam.id}`}>
                        <SelectValue placeholder="Select Exam Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JEE">JEE (Joint Entrance Examination)</SelectItem>
                        <SelectItem value="NEET">NEET (National Eligibility cum Entrance Test)</SelectItem>
                        <SelectItem value="CAT">CAT (Common Admission Test)</SelectItem>
                        <SelectItem value="UPSC">UPSC (Civil Services)</SelectItem>
                        <SelectItem value="GATE">GATE (Graduate Aptitude Test in Engineering)</SelectItem>
                        <SelectItem value="CLAT">CLAT (Common Law Admission Test)</SelectItem>
                        <SelectItem value="AIIMS">AIIMS (All India Institute of Medical Sciences)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select the type of competitive examination
                    </p>
                  </div>

                  {/* Year */}
                  <div className="space-y-2">
                                         <Label htmlFor={`exam-year-${exam.id}`} className="text-sm font-medium">
                       Year
                     </Label>
                    <Select
                      value={exam.year}
                      onValueChange={(value) => handleCompetitiveExamChange(exam.id, 'year', value)}
                    >
                      <SelectTrigger id={`exam-year-${exam.id}`}>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select the year when this exam was conducted
                    </p>
                  </div>

                  {/* Total Students Appeared */}
                  <div className="space-y-2">
                                         <Label htmlFor={`total-students-${exam.id}`} className="text-sm font-medium">
                       Total Students Appeared
                     </Label>
                    <Input
                      id={`total-students-${exam.id}`}
                      type="number"
                      min="1"
                      placeholder="e.g., 50"
                      value={exam.totalStudentsAppeared}
                      onChange={(e) => handleCompetitiveExamChange(exam.id, 'totalStudentsAppeared', e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the total number of students who appeared for this exam
                    </p>
                  </div>

                  {/* Qualified Students */}
                  <div className="space-y-2">
                                         <Label htmlFor={`qualified-students-${exam.id}`} className="text-sm font-medium">
                       Qualified Students
                     </Label>
                    <Input
                      id={`qualified-students-${exam.id}`}
                      type="number"
                      min="0"
                      placeholder="e.g., 35"
                      value={exam.qualifiedStudents}
                      onChange={(e) => handleCompetitiveExamChange(exam.id, 'qualifiedStudents', e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the number of students who qualified in this exam
                    </p>
                  </div>

                  {/* Top Ranks Achieved */}
                  <div className="space-y-2">
                    <Label htmlFor={`top-ranks-${exam.id}`} className="text-sm font-medium">
                      Top Ranks Achieved
                    </Label>
                    <Input
                      id={`top-ranks-${exam.id}`}
                      type="text"
                      placeholder="e.g., AIR 15, AIR 45, AIR 78"
                      value={exam.topRanksAchieved}
                      onChange={(e) => handleCompetitiveExamChange(exam.id, 'topRanksAchieved', e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the top ranks achieved by your students (optional)
                    </p>
                  </div>

                  {/* Success Percentage */}
                  <div className="space-y-2">
                    <Label htmlFor={`success-percentage-${exam.id}`} className="text-sm font-medium">
                      Success Percentage
                    </Label>
                    <Input
                      id={`success-percentage-${exam.id}`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g., 70.0"
                      value={exam.successPercentage}
                      onChange={(e) => handleCompetitiveExamChange(exam.id, 'successPercentage', e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the success percentage (0-100)
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addCompetitiveExam}
              className="w-full"
            >
              Add Another Competitive Exam
            </button>
          </div>
        </div>

        {/* Awards & Recognition Section */}
        <div className="space-y-6 border-t border-border pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Awards & Recognition</h3>
            <p className="text-muted-foreground">
              Highlight the awards, recognitions, and certifications received by your institution
            </p>
          </div>

          <div className="space-y-4">
            {/* Institution Awards */}
            <div className="space-y-4">
              <Label htmlFor="institution-awards" className="text-sm font-medium">
                Institution Awards
              </Label>
              
              {/* Government Recognition */}
              <div className="space-y-2">
                <Label htmlFor="government-recognition" className="text-xs font-medium text-muted-foreground">
                  Government Recognition
                </Label>
                <textarea
                  id="government-recognition"
                  rows={3}
                  placeholder="List any government awards, recognitions, or certifications received..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              {/* Education Board Awards */}
              <div className="space-y-2">
                <Label htmlFor="education-board-awards" className="text-xs font-medium text-muted-foreground">
                  Education Board Awards
                </Label>
                <textarea
                  id="education-board-awards"
                  rows={3}
                  placeholder="List awards and recognitions from education boards (CBSE, ICSE, State Boards, etc.)..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              {/* Quality Certifications */}
              <div className="space-y-2">
                <Label htmlFor="quality-certifications" className="text-xs font-medium text-muted-foreground">
                  Quality Certifications (ISO, etc.)
                </Label>
                <textarea
                  id="quality-certifications"
                  rows={3}
                  placeholder="List quality certifications like ISO, NAAC, or other quality standards..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              {/* Media Recognition */}
              <div className="space-y-2">
                <Label htmlFor="media-recognition" className="text-xs font-medium text-muted-foreground">
                  Media Recognition
                </Label>
                <textarea
                  id="media-recognition"
                  rows={3}
                  placeholder="List any media coverage, press mentions, or public recognition..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Student Achievements Section */}
        <div className="space-y-6 border-t border-border pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Student Achievements</h3>
            <p className="text-muted-foreground">
              Showcase the achievements and accomplishments of your students
            </p>
          </div>

          <div className="space-y-4">
            {/* Student Achievements */}
            <div className="space-y-4">
              <Label htmlFor="student-achievements" className="text-sm font-medium">
                Student Achievements
              </Label>
              
              {/* Sports Achievements */}
              <div className="space-y-2">
                <Label htmlFor="sports-achievements" className="text-xs font-medium text-muted-foreground">
                  Sports Achievements
                </Label>
                <textarea
                  id="sports-achievements"
                  rows={3}
                  placeholder="List sports achievements, tournament wins, and athletic accomplishments..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              {/* Cultural Achievements */}
              <div className="space-y-2">
                <Label htmlFor="cultural-achievements" className="text-xs font-medium text-muted-foreground">
                  Cultural Achievements
                </Label>
                <textarea
                  id="cultural-achievements"
                  rows={3}
                  placeholder="List cultural achievements, art competitions, music, dance, and creative accomplishments..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              {/* Academic Excellence Awards */}
              <div className="space-y-2">
                <Label htmlFor="academic-excellence-awards" className="text-xs font-medium text-muted-foreground">
                  Academic Excellence Awards
                </Label>
                <textarea
                  id="academic-excellence-awards"
                  rows={3}
                  placeholder="List academic excellence awards, scholarship recipients, and educational achievements..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              {/* Competition Winners */}
              <div className="space-y-2">
                <Label htmlFor="competition-winners" className="text-xs font-medium text-muted-foreground">
                  Competition Winners
                </Label>
                <textarea
                  id="competition-winners"
                  rows={3}
                  placeholder="List competition winners, quiz champions, debate winners, and other competitive achievements..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Accreditations Section */}
        <div className="space-y-6 border-t border-border pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Accreditations</h3>
            <p className="text-muted-foreground">
              Provide information about your institution's accreditations and certifications
            </p>
          </div>

          <div className="space-y-4">
            {/* Government Accreditation */}
            <div className="space-y-2">
              <Label htmlFor="government-accreditation" className="text-sm font-medium">
                Government Accreditation
              </Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="government-accreditation-yes"
                    name="government-accreditation"
                    value="yes"
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor="government-accreditation-yes" className="text-sm">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="government-accreditation-no"
                    name="government-accreditation"
                    value="no"
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor="government-accreditation-no" className="text-sm">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution has received government accreditation
              </p>
            </div>

            {/* Board Affiliation Details */}
            <div className="space-y-2">
              <Label htmlFor="board-affiliation-details" className="text-sm font-medium">
                Board Affiliation Details <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="board-affiliation-details"
                rows={4}
                placeholder="List your board affiliations (CBSE, ICSE, State Boards, IB, etc.) and provide details..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Provide details about your board affiliations and certifications
              </p>
            </div>

            {/* University Affiliation */}
            <div className="space-y-2">
              <Label htmlFor="university-affiliation" className="text-sm font-medium">
                University Affiliation (if applicable)
              </Label>
              <textarea
                id="university-affiliation"
                rows={3}
                placeholder="List any university affiliations, partnerships, or collaborations..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Provide details about any university affiliations, partnerships, or academic collaborations
              </p>
            </div>

            {/* Professional Body Membership */}
            <div className="space-y-2">
              <Label htmlFor="professional-body-membership" className="text-sm font-medium">
                Professional Body Membership
              </Label>
              <textarea
                id="professional-body-membership"
                rows={3}
                placeholder="List any professional body memberships, associations, or industry affiliations..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Provide details about professional body memberships, industry associations, or educational networks
              </p>
            </div>

            {/* Quality Certifications */}
            <div className="space-y-2">
              <Label htmlFor="quality-certifications" className="text-sm font-medium">
                Quality Certifications
              </Label>
              <textarea
                id="quality-certifications"
                rows={3}
                placeholder="List quality certifications like ISO, NAAC, or other quality standards and accreditations..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Provide details about quality certifications, standards, and accreditations received
              </p>
            </div>

            {/* Upload Certificate Documents */}
            <div className="space-y-2">
              <Label htmlFor="certificate-documents" className="text-sm font-medium">
                Upload Certificate Documents <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center space-x-2">
                <input
                  id="certificate-documents"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleCertificateDocumentsUpload}
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              {accreditations.certificateDocuments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {accreditations.certificateDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <button
                        onClick={() => removeCertificateDocument(index)}
                        className="h-6 px-2"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload relevant certificate documents, accreditations, and quality certifications (PDF, DOC, or images)
              </p>
            </div>
          </div>
        </div>

        {/* Success Stories Section */}
        <div className="space-y-6 border-t border-border pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Success Stories</h3>
            <p className="text-muted-foreground">
              Share inspiring stories of your institution's impact and alumni achievements
            </p>
          </div>

          <div className="space-y-4">
            {/* Alumni Success Stories */}
            <div className="space-y-2">
              <Label htmlFor="alumni-success-stories" className="text-sm font-medium">
                Alumni Success Stories (Optional)
              </Label>
              <textarea
                id="alumni-success-stories"
                rows={4}
                placeholder="Share inspiring stories of your alumni's achievements, career success, and contributions to society..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Highlight notable alumni achievements, career milestones, and success stories that showcase your institution's impact
              </p>
            </div>

            {/* Placement Records */}
            <div className="space-y-2">
              <Label htmlFor="placement-records" className="text-sm font-medium">
                Placement Records (if applicable)
              </Label>
              <textarea
                id="placement-records"
                rows={4}
                placeholder="Share information about student placement rates, top recruiters, salary packages, and career outcomes..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Provide details about student placement success, top employers, and career outcomes when applicable
              </p>
            </div>

            {/* Higher Studies Admissions */}
            <div className="space-y-2">
              <Label htmlFor="higher-studies-admissions" className="text-sm font-medium">
                Higher Studies Admissions
              </Label>
              <textarea
                id="higher-studies-admissions"
                rows={4}
                placeholder="Share information about students admitted to higher education programs, universities, and advanced studies..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Highlight student success in gaining admissions to higher education programs, universities, and advanced studies
              </p>
            </div>

            {/* Scholarship Recipients */}
            <div className="space-y-2">
              <Label htmlFor="scholarship-recipients" className="text-sm font-medium">
                Scholarship Recipients
              </Label>
              <textarea
                id="scholarship-recipients"
                rows={4}
                placeholder="List students who received scholarships, merit-based awards, financial aid, and educational grants..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Highlight students who received scholarships, merit-based awards, and financial recognition for their achievements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
