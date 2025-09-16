import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Step2() {
  const { formData, updateStep2Data, isStep2Valid } = useInstitutionSignup();
  
  // Local state for form fields
  const [totalClassrooms, setTotalClassrooms] = useState(formData.step2.totalClassrooms);
  const [classroomCapacity, setClassroomCapacity] = useState(formData.step2.classroomCapacity);
  const [libraryAvailable, setLibraryAvailable] = useState(formData.step2.libraryAvailable);
  const [computerLabAvailable, setComputerLabAvailable] = useState(formData.step2.computerLabAvailable);
  const [wifiAvailable, setWifiAvailable] = useState(formData.step2.wifiAvailable);
  const [parkingAvailable, setParkingAvailable] = useState(formData.step2.parkingAvailable);
  const [cafeteriaAvailable, setCafeteriaAvailable] = useState(formData.step2.cafeteriaAvailable);
  const [airConditioningAvailable, setAirConditioningAvailable] = useState(formData.step2.airConditioningAvailable);
  const [cctvSecurityAvailable, setCctvSecurityAvailable] = useState(formData.step2.cctvSecurityAvailable);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(formData.step2.wheelchairAccessible);
  const [projectorsSmartBoardsAvailable, setProjectorsSmartBoardsAvailable] = useState(formData.step2.projectorsSmartBoardsAvailable);
  const [audioSystemAvailable, setAudioSystemAvailable] = useState(formData.step2.audioSystemAvailable);
  const [laboratoryFacilities, setLaboratoryFacilities] = useState(formData.step2.laboratoryFacilities);
  const [sportsFacilities, setSportsFacilities] = useState(formData.step2.sportsFacilities);
  const [transportationProvided, setTransportationProvided] = useState(formData.step2.transportationProvided);
  const [hostelFacility, setHostelFacility] = useState(formData.step2.hostelFacility);
  const [studyMaterialProvided, setStudyMaterialProvided] = useState(formData.step2.studyMaterialProvided);
  const [onlineClasses, setOnlineClasses] = useState(formData.step2.onlineClasses);
  const [recordedSessions, setRecordedSessions] = useState(formData.step2.recordedSessions);
  const [mockTestsAssessments, setMockTestsAssessments] = useState(formData.step2.mockTestsAssessments);
  const [careerCounseling, setCareerCounseling] = useState(formData.step2.careerCounseling);
  const [jobPlacementAssistance, setJobPlacementAssistance] = useState(formData.step2.jobPlacementAssistance);
  const [mainBuildingPhoto, setMainBuildingPhoto] = useState<File | null>(formData.step2.mainBuildingPhoto);
  const [classroomPhotos, setClassroomPhotos] = useState<File[]>(formData.step2.classroomPhotos);
  const [laboratoryPhotos, setLaboratoryPhotos] = useState<File[]>(formData.step2.laboratoryPhotos);
  const [facilitiesPhotos, setFacilitiesPhotos] = useState<File[]>(formData.step2.facilitiesPhotos);
  const [achievementPhotos, setAchievementPhotos] = useState<File[]>(formData.step2.achievementPhotos);
  
  // Ref to prevent infinite re-render loops
  const isSyncingRef = useRef(false);

  // Load saved data from context on component mount only
  useEffect(() => {
    // Only sync on initial load, not on every field change
    if (formData.step2 && !isSyncingRef.current) {
      isSyncingRef.current = true;
      const step2Data = formData.step2;
      
      // Always sync all fields, even if they're empty strings
      setTotalClassrooms(step2Data.totalClassrooms || '');
      setClassroomCapacity(step2Data.classroomCapacity || '');
      setLibraryAvailable(step2Data.libraryAvailable !== undefined ? step2Data.libraryAvailable : '');
      setComputerLabAvailable(step2Data.computerLabAvailable !== undefined ? step2Data.computerLabAvailable : '');
      setWifiAvailable(step2Data.wifiAvailable !== undefined ? step2Data.wifiAvailable : '');
      setParkingAvailable(step2Data.parkingAvailable !== undefined ? step2Data.parkingAvailable : '');
      setCafeteriaAvailable(step2Data.cafeteriaAvailable !== undefined ? step2Data.cafeteriaAvailable : '');
      setAirConditioningAvailable(step2Data.airConditioningAvailable !== undefined ? step2Data.airConditioningAvailable : '');
      setCctvSecurityAvailable(step2Data.cctvSecurityAvailable !== undefined ? step2Data.cctvSecurityAvailable : '');
      setWheelchairAccessible(step2Data.wheelchairAccessible !== undefined ? step2Data.wheelchairAccessible : '');
      setProjectorsSmartBoardsAvailable(step2Data.projectorsSmartBoardsAvailable !== undefined ? step2Data.projectorsSmartBoardsAvailable : '');
      setAudioSystemAvailable(step2Data.audioSystemAvailable !== undefined ? step2Data.audioSystemAvailable : '');
      setLaboratoryFacilities(step2Data.laboratoryFacilities || '');
      setSportsFacilities(step2Data.sportsFacilities || '');
      setTransportationProvided(step2Data.transportationProvided !== undefined ? step2Data.transportationProvided : '');
      setHostelFacility(step2Data.hostelFacility !== undefined ? step2Data.hostelFacility : '');
      setStudyMaterialProvided(step2Data.studyMaterialProvided !== undefined ? step2Data.studyMaterialProvided : '');
      setOnlineClasses(step2Data.onlineClasses !== undefined ? step2Data.onlineClasses : '');
      setRecordedSessions(step2Data.recordedSessions !== undefined ? step2Data.recordedSessions : '');
      setMockTestsAssessments(step2Data.mockTestsAssessments !== undefined ? step2Data.mockTestsAssessments : '');
      setCareerCounseling(step2Data.careerCounseling !== undefined ? step2Data.careerCounseling : '');
      setJobPlacementAssistance(step2Data.jobPlacementAssistance !== undefined ? step2Data.jobPlacementAssistance : '');
      setMainBuildingPhoto(step2Data.mainBuildingPhoto || null);
      setClassroomPhotos(step2Data.classroomPhotos || []);
      setLaboratoryPhotos(step2Data.laboratoryPhotos || []);
      setFacilitiesPhotos(step2Data.facilitiesPhotos || []);
      setAchievementPhotos(step2Data.achievementPhotos || []);
      
      console.log('Step 2 data synced from context:', step2Data);
      
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
      updateStep2Data({
        totalClassrooms,
        classroomCapacity,
        libraryAvailable,
        computerLabAvailable,
        wifiAvailable,
        parkingAvailable,
        cafeteriaAvailable,
        airConditioningAvailable,
        cctvSecurityAvailable,
        wheelchairAccessible,
        projectorsSmartBoardsAvailable,
        audioSystemAvailable,
        laboratoryFacilities,
        sportsFacilities,
        transportationProvided,
        hostelFacility,
        studyMaterialProvided,
        onlineClasses,
        recordedSessions,
        mockTestsAssessments,
        careerCounseling,
        jobPlacementAssistance,
        mainBuildingPhoto,
        classroomPhotos,
        laboratoryPhotos,
        facilitiesPhotos,
        achievementPhotos,
      });
    }
  }, [
    totalClassrooms, classroomCapacity, libraryAvailable, computerLabAvailable,
    wifiAvailable, parkingAvailable, cafeteriaAvailable, airConditioningAvailable,
    cctvSecurityAvailable, wheelchairAccessible, projectorsSmartBoardsAvailable,
    audioSystemAvailable, laboratoryFacilities, sportsFacilities, transportationProvided,
    hostelFacility, studyMaterialProvided, onlineClasses, recordedSessions,
    mockTestsAssessments, careerCounseling, jobPlacementAssistance, mainBuildingPhoto,
    classroomPhotos, laboratoryPhotos, facilitiesPhotos, achievementPhotos, updateStep2Data
  ]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Institution Details & Facilities</h2>
        <p className="text-muted-foreground">
          This step will contain detailed information about your institution and available facilities
        </p>
      </div>
      
      {/* Infrastructure Details Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Infrastructure Details</h3>
          <p className="text-muted-foreground">
            Provide information about your institution's physical infrastructure
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Total Classrooms Field */}
          <div className="space-y-2">
            <Label htmlFor="total-classrooms" className="text-sm font-medium">
              Total Classrooms <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-1">
              <Input
                id="total-classrooms"
                type="number"
                placeholder="Enter number of classrooms"
                value={totalClassrooms}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseInt(value);
                  if (value === '' || (numValue >= 1 && numValue <= 100)) {
                    setTotalClassrooms(value);
                  }
                }}
                min="1"
                max="100"
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Number of available classrooms in your institution
                </p>
                {totalClassrooms && (
                  <span className={`text-xs ${
                    parseInt(totalClassrooms) >= 1 && parseInt(totalClassrooms) <= 100 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }`}>
                    {totalClassrooms}/100
                  </span>
                )}
              </div>
              {totalClassrooms && (parseInt(totalClassrooms) < 1 || parseInt(totalClassrooms) > 100) && (
                <p className="text-xs text-amber-600">
                  Please enter a number between 1 and 100
                </p>
              )}
            </div>
          </div>

          {/* Classroom Capacity Field */}
          <div className="space-y-2">
            <Label htmlFor="classroom-capacity" className="text-sm font-medium">
              Classroom Capacity
            </Label>
            <div className="space-y-1">
              <Input
                id="classroom-capacity"
                type="number"
                placeholder="Enter average students per classroom"
                value={classroomCapacity}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseInt(value);
                  if (value === '' || (numValue >= 1 && numValue <= 200)) {
                    setClassroomCapacity(value);
                  }
                }}
                min="1"
                max="200"
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Average number of students that can fit in each classroom
                </p>
                {classroomCapacity && (
                  <span className={`text-xs ${
                    parseInt(classroomCapacity) >= 1 && parseInt(classroomCapacity) <= 200 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }`}>
                    {classroomCapacity} students
                  </span>
                )}
              </div>
              {classroomCapacity && (parseInt(classroomCapacity) < 1 || parseInt(classroomCapacity) > 200) && (
                <p className="text-xs text-amber-600">
                  Please enter a number between 1 and 200
                </p>
              )}
            </div>
          </div>

          {/* Library Available Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Library Available
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="library-yes"
                    type="radio"
                    name="library-available"
                    value="yes"
                    checked={libraryAvailable === 'yes'}
                    onChange={(e) => setLibraryAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="library-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="library-no"
                    type="radio"
                    name="library-available"
                    value="no"
                    checked={libraryAvailable === 'no'}
                    onChange={(e) => setLibraryAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="library-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution has a library facility available for students
              </p>
            </div>
          </div>

          {/* Computer Lab Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Computer Lab
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="computer-lab-yes"
                    type="radio"
                    name="computer-lab-available"
                    value="yes"
                    checked={computerLabAvailable === 'yes'}
                    onChange={(e) => setComputerLabAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="computer-lab-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="computer-lab-no"
                    type="radio"
                    name="computer-lab-available"
                    value="no"
                    checked={computerLabAvailable === 'no'}
                    onChange={(e) => setComputerLabAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="computer-lab-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution has a computer laboratory available for students
              </p>
            </div>
          </div>

          {/* Wi-Fi Available Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Wi-Fi Available
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="wifi-yes"
                    type="radio"
                    name="wifi-available"
                    value="yes"
                    checked={wifiAvailable === 'yes'}
                    onChange={(e) => setWifiAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="wifi-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="wifi-no"
                    type="radio"
                    name="wifi-available"
                    value="no"
                    checked={wifiAvailable === 'no'}
                    onChange={(e) => setWifiAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="wifi-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution provides Wi-Fi internet access for students
              </p>
            </div>
          </div>

          {/* Parking Available Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Parking Available
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="parking-yes"
                    type="radio"
                    name="parking-available"
                    value="yes"
                    checked={parkingAvailable === 'yes'}
                    onChange={(e) => setParkingAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="parking-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="parking-no"
                    type="radio"
                    name="parking-available"
                    value="no"
                    checked={parkingAvailable === 'no'}
                    onChange={(e) => setParkingAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="parking-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution provides parking facilities for students and staff
              </p>
            </div>
          </div>

          {/* Cafeteria/Canteen Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Cafeteria/Canteen
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="cafeteria-yes"
                    type="radio"
                    name="cafeteria-available"
                    value="yes"
                    checked={cafeteriaAvailable === 'yes'}
                    onChange={(e) => setCafeteriaAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="cafeteria-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="cafeteria-no"
                    type="radio"
                    name="cafeteria-available"
                    value="no"
                    checked={cafeteriaAvailable === 'no'}
                    onChange={(e) => setCafeteriaAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="cafeteria-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution has a cafeteria or canteen for food and refreshments
              </p>
            </div>
          </div>

          {/* Air Conditioning Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Air Conditioning
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="air-conditioning-yes"
                    type="radio"
                    name="air-conditioning-available"
                    value="yes"
                    checked={airConditioningAvailable === 'yes'}
                    onChange={(e) => setAirConditioningAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="air-conditioning-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="air-conditioning-no"
                    type="radio"
                    name="air-conditioning-available"
                    value="no"
                    checked={airConditioningAvailable === 'no'}
                    onChange={(e) => setAirConditioningAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="air-conditioning-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution has air conditioning in classrooms and facilities
              </p>
            </div>
          </div>

          {/* CCTV Security Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              CCTV Security
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="cctv-security-yes"
                    type="radio"
                    name="cctv-security-available"
                    value="yes"
                    checked={cctvSecurityAvailable === 'yes'}
                    onChange={(e) => setCctvSecurityAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="cctv-security-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="cctv-security-no"
                    type="radio"
                    name="cctv-security-available"
                    value="no"
                    checked={cctvSecurityAvailable === 'no'}
                    onChange={(e) => setCctvSecurityAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="cctv-security-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution has CCTV surveillance for security and safety
              </p>
            </div>
          </div>

          {/* Wheelchair Accessible Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Wheelchair Accessible
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="wheelchair-accessible-yes"
                    type="radio"
                    name="wheelchair-accessible"
                    value="yes"
                    checked={wheelchairAccessible === 'yes'}
                    onChange={(e) => setWheelchairAccessible(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="wheelchair-accessible-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="wheelchair-accessible-no"
                    type="radio"
                    name="wheelchair-accessible"
                    value="no"
                    checked={wheelchairAccessible === 'no'}
                    onChange={(e) => setWheelchairAccessible(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="wheelchair-accessible-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution has wheelchair-accessible facilities and infrastructure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Facilities Section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Teaching Facilities</h3>
          <p className="text-muted-foreground">
            Provide information about your institution's teaching and learning facilities
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Projectors/Smart Boards Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Projectors/Smart Boards
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="projectors-smart-boards-yes"
                    type="radio"
                    name="projectors-smart-boards-available"
                    value="yes"
                    checked={projectorsSmartBoardsAvailable === 'yes'}
                    onChange={(e) => setProjectorsSmartBoardsAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="projectors-smart-boards-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="projectors-smart-boards-no"
                    type="radio"
                    name="projectors-smart-boards-available"
                    value="no"
                    checked={projectorsSmartBoardsAvailable === 'no'}
                    onChange={(e) => setProjectorsSmartBoardsAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="projectors-smart-boards-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution has projectors or smart boards in classrooms for enhanced teaching
              </p>
            </div>
          </div>

          {/* Audio System Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Audio System
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="audio-system-yes"
                    type="radio"
                    name="audio-system-available"
                    value="yes"
                    checked={audioSystemAvailable === 'yes'}
                    onChange={(e) => setAudioSystemAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="audio-system-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="audio-system-no"
                    type="radio"
                    name="audio-system-available"
                    value="no"
                    checked={audioSystemAvailable === 'no'}
                    onChange={(e) => setAudioSystemAvailable(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="audio-system-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution has audio systems or speakers in classrooms for clear sound delivery
              </p>
            </div>
          </div>

          {/* Laboratory Facilities Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Laboratory Facilities
            </Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="physics-lab"
                    type="checkbox"
                    checked={laboratoryFacilities.physicsLab}
                    onChange={(e) => setLaboratoryFacilities(prev => ({
                      ...prev,
                      physicsLab: e.target.checked
                    }))}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="physics-lab" className="text-sm font-normal cursor-pointer">
                    Physics Lab
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="chemistry-lab"
                    type="checkbox"
                    checked={laboratoryFacilities.chemistryLab}
                    onChange={(e) => setLaboratoryFacilities(prev => ({
                      ...prev,
                      chemistryLab: e.target.checked
                    }))}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="chemistry-lab" className="text-sm font-normal cursor-pointer">
                    Chemistry Lab
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="biology-lab"
                    type="checkbox"
                    checked={laboratoryFacilities.biologyLab}
                    onChange={(e) => setLaboratoryFacilities(prev => ({
                      ...prev,
                      biologyLab: e.target.checked
                    }))}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="biology-lab" className="text-sm font-normal cursor-pointer">
                    Biology Lab
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="computer-lab-checkbox"
                    type="checkbox"
                    checked={laboratoryFacilities.computerLab}
                    onChange={(e) => setLaboratoryFacilities(prev => ({
                      ...prev,
                      computerLab: e.target.checked
                    }))}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="computer-lab-checkbox" className="text-sm font-normal cursor-pointer">
                    Computer Lab
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="language-lab"
                    type="checkbox"
                    checked={laboratoryFacilities.languageLab}
                    onChange={(e) => setLaboratoryFacilities(prev => ({
                      ...prev,
                      languageLab: e.target.checked
                    }))}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="language-lab" className="text-sm font-normal cursor-pointer">
                    Language Lab
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Select all laboratory facilities available at your institution for practical learning
              </p>
            </div>
          </div>

          {/* Sports Facilities Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Sports Facilities
            </Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="indoor-games"
                    type="checkbox"
                    checked={sportsFacilities.indoorGames}
                    onChange={(e) => setSportsFacilities(prev => ({
                      ...prev,
                      indoorGames: e.target.checked
                    }))}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="indoor-games" className="text-sm font-normal cursor-pointer">
                    Indoor Games
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="outdoor-playground"
                    type="checkbox"
                    checked={sportsFacilities.outdoorPlayground}
                    onChange={(e) => setSportsFacilities(prev => ({
                      ...prev,
                      outdoorPlayground: e.target.checked
                    }))}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="outdoor-playground" className="text-sm font-normal cursor-pointer">
                    Outdoor Playground
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="gymnasium"
                    type="checkbox"
                    checked={sportsFacilities.gymnasium}
                    onChange={(e) => setSportsFacilities(prev => ({
                      ...prev,
                      gymnasium: e.target.checked
                    }))}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="gymnasium" className="text-sm font-normal cursor-pointer">
                    Gymnasium
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="swimming-pool"
                    type="checkbox"
                    checked={sportsFacilities.swimmingPool}
                    onChange={(e) => setSportsFacilities(prev => ({
                      ...prev,
                      swimmingPool: e.target.checked
                    }))}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="swimming-pool" className="text-sm font-normal cursor-pointer">
                    Swimming Pool
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Select all sports and recreational facilities available at your institution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Services Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Additional Services</h3>
          <p className="text-muted-foreground">
            Provide information about additional services and conveniences offered by your institution
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Transportation Provided Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Transportation Provided
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="transportation-yes"
                    type="radio"
                    name="transportation-provided"
                    value="yes"
                    checked={transportationProvided === 'yes'}
                    onChange={(e) => setTransportationProvided(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="transportation-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="transportation-no"
                    type="radio"
                    name="transportation-provided"
                    value="no"
                    checked={transportationProvided === 'no'}
                    onChange={(e) => setTransportationProvided(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="transportation-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution provides transportation services for students
              </p>
            </div>
          </div>

          {/* Hostel Facility Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Hostel Facility
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="hostel-facility-yes"
                    type="radio"
                    name="hostel-facility"
                    value="yes"
                    checked={hostelFacility === 'yes'}
                    onChange={(e) => setHostelFacility(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="hostel-facility-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="hostel-facility-no"
                    type="radio"
                    name="hostel-facility"
                    value="no"
                    checked={hostelFacility === 'no'}
                    onChange={(e) => setHostelFacility(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="hostel-facility-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution provides hostel accommodation for outstation students
              </p>
            </div>
          </div>

          {/* Study Material Provided Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Study Material Provided
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="study-material-yes"
                    type="radio"
                    name="study-material-provided"
                    value="yes"
                    checked={studyMaterialProvided === 'yes'}
                    onChange={(e) => setStudyMaterialProvided(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="study-material-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="study-material-no"
                    type="radio"
                    name="study-material-provided"
                    value="no"
                    checked={studyMaterialProvided === 'no'}
                    onChange={(e) => setStudyMaterialProvided(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="study-material-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution provides study materials, books, or learning resources to students
              </p>
            </div>
          </div>

          {/* Online Classes Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Online Classes
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="online-classes-yes"
                    type="radio"
                    name="online-classes"
                    value="yes"
                    checked={onlineClasses === 'yes'}
                    onChange={(e) => setOnlineClasses(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="online-classes-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="online-classes-no"
                    type="radio"
                    name="online-classes"
                    value="no"
                    checked={onlineClasses === 'no'}
                    onChange={(e) => setOnlineClasses(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="online-classes-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution offers online or virtual classes for remote learning
              </p>
            </div>
          </div>

          {/* Recorded Sessions Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Recorded Sessions
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="recorded-sessions-yes"
                    type="radio"
                    name="recorded-sessions"
                    value="yes"
                    checked={recordedSessions === 'yes'}
                    onChange={(e) => setRecordedSessions(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="recorded-sessions-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="recorded-sessions-no"
                    type="radio"
                    name="recorded-sessions"
                    value="no"
                    checked={recordedSessions === 'no'}
                    onChange={(e) => setRecordedSessions(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="recorded-sessions-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution provides recorded video sessions for students to review later
              </p>
            </div>
          </div>

          {/* Mock Tests/Assessments Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Mock Tests/Assessments
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="mock-tests-yes"
                    type="radio"
                    name="mock-tests-assessments"
                    value="yes"
                    checked={mockTestsAssessments === 'yes'}
                    onChange={(e) => setMockTestsAssessments(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="mock-tests-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="mock-tests-no"
                    type="radio"
                    name="mock-tests-assessments"
                    value="no"
                    checked={mockTestsAssessments === 'no'}
                    onChange={(e) => setMockTestsAssessments(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="mock-tests-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution provides mock tests and regular assessments for student evaluation
              </p>
            </div>
          </div>

          {/* Career Counseling Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Career Counseling
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="career-counseling-yes"
                    type="radio"
                    name="career-counseling"
                    value="yes"
                    checked={careerCounseling === 'yes'}
                    onChange={(e) => setCareerCounseling(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="career-counseling-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="career-counseling-no"
                    type="radio"
                    name="career-counseling"
                    value="no"
                    checked={careerCounseling === 'no'}
                    onChange={(e) => setCareerCounseling(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="career-counseling-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution provides career guidance and counseling services to students
              </p>
            </div>
          </div>

          {/* Job Placement Assistance Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Job Placement Assistance
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="job-placement-yes"
                    type="radio"
                    name="job-placement-assistance"
                    value="yes"
                    checked={jobPlacementAssistance === 'yes'}
                    onChange={(e) => setJobPlacementAssistance(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="job-placement-yes" className="text-sm font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="job-placement-no"
                    type="radio"
                    name="job-placement-assistance"
                    value="no"
                    checked={jobPlacementAssistance === 'no'}
                    onChange={(e) => setJobPlacementAssistance(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-gray-300 rounded-full focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <Label htmlFor="job-placement-no" className="text-sm font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Indicate whether your institution provides job placement and recruitment assistance to students
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Institution Photos Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Institution Photos</h3>
          <p className="text-muted-foreground">
            Upload photos showcasing your institution's facilities and infrastructure
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Main Building Photo Field */}
          <div className="space-y-2">
            <Label htmlFor="main-building-photo" className="text-sm font-medium">
              Main Building Photo <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <input
                  id="main-building-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setMainBuildingPhoto(file);
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {mainBuildingPhoto && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <span>✓</span>
                    <span>{mainBuildingPhoto.name} selected</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a clear photo of your institution's main building or entrance. Supported formats: JPG, PNG, GIF. Maximum size: 5MB.
              </p>
            </div>
          </div>

          {/* Classroom Photos Field */}
          <div className="space-y-2">
            <Label htmlFor="classroom-photos" className="text-sm font-medium">
              Classroom Photos
            </Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <input
                  id="classroom-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 10) {
                      alert('Maximum 10 photos allowed. Only the first 10 will be selected.');
                      files.splice(10);
                    }
                    setClassroomPhotos(files);
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {classroomPhotos.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <span>✓</span>
                      <span>{classroomPhotos.length} photo{classroomPhotos.length !== 1 ? 's' : ''} selected</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>Selected files:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {classroomPhotos.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload multiple photos of your classrooms and learning spaces. Maximum 10 photos allowed. Supported formats: JPG, PNG, GIF. Maximum size per photo: 5MB.
              </p>
            </div>
          </div>

          {/* Laboratory Photos Field */}
          <div className="space-y-2">
            <Label htmlFor="laboratory-photos" className="text-sm font-medium">
              Laboratory Photos
            </Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <input
                  id="laboratory-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setLaboratoryPhotos(files);
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {laboratoryPhotos.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <span>✓</span>
                      <span>{laboratoryPhotos.length} photo{laboratoryPhotos.length !== 1 ? 's' : ''} selected</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>Selected files:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {laboratoryPhotos.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload multiple photos of your laboratory facilities and equipment. Supported formats: JPG, PNG, GIF. Maximum size per photo: 5MB.
              </p>
            </div>
          </div>

          {/* Facilities Photos Field */}
          <div className="space-y-2">
            <Label htmlFor="facilities-photos" className="text-sm font-medium">
              Facilities Photos
            </Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <input
                  id="facilities-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFacilitiesPhotos(files);
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {facilitiesPhotos.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <span>✓</span>
                      <span>{facilitiesPhotos.length} photo{facilitiesPhotos.length !== 1 ? 's' : ''} selected</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>Selected files:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {facilitiesPhotos.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload multiple photos of your other facilities like library, computer lab, sports facilities, cafeteria, etc. Supported formats: JPG, PNG, GIF. Maximum size per photo: 5MB.
              </p>
            </div>
          </div>

          {/* Achievement/Certificate Photos Field */}
          <div className="space-y-2">
            <Label htmlFor="achievement-photos" className="text-sm font-medium">
              Achievement/Certificate Photos <span className="text-gray-500">(optional)</span>
            </Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <input
                  id="achievement-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAchievementPhotos(files);
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {achievementPhotos.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <span>✓</span>
                      <span>{achievementPhotos.length} photo{achievementPhotos.length !== 1 ? 's' : ''} selected</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>Selected files:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {achievementPhotos.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload photos of your institution's achievements, awards, certificates, and recognitions. This field is optional. Supported formats: JPG, PNG, GIF. Maximum size per photo: 5MB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
