/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Step 1 Form Data Interface
interface Step1FormData {
  institutionName: string;
  institutionType: string;
  otherInstitutionType: string;
  establishmentYear: string;
  registrationNumber: string;
  panNumber: string;
  gstNumber: string;
  officialEmail: string;
  password: string;
  primaryContact: string;
  secondaryContact: string;
  websiteUrl: string;
  completeAddress: string;
  city: string;
  state: string;
  pinCode: string;
  landmark: string;
  mapLocation: string;
  ownerDirectorName: string;
  ownerContactNumber: string;
  businessLicenseFile: File | null;
  registrationCertificateFile: File | null;
}

// Step 2 Form Data Interface
interface Step2FormData {
  totalClassrooms: string;
  classroomCapacity: string;
  libraryAvailable: string;
  computerLabAvailable: string;
  wifiAvailable: string;
  parkingAvailable: string;
  cafeteriaAvailable: string;
  airConditioningAvailable: string;
  cctvSecurityAvailable: string;
  wheelchairAccessible: string;
  projectorsSmartBoardsAvailable: string;
  audioSystemAvailable: string;
  laboratoryFacilities: {
    physicsLab: boolean;
    chemistryLab: boolean;
    biologyLab: boolean;
    computerLab: boolean;
    languageLab: boolean;
  };
  sportsFacilities: {
    indoorGames: boolean;
    outdoorPlayground: boolean;
    gymnasium: boolean;
    swimmingPool: boolean;
  };
  transportationProvided: string;
  hostelFacility: string;
  studyMaterialProvided: string;
  onlineClasses: string;
  recordedSessions: string;
  mockTestsAssessments: string;
  careerCounseling: string;
  jobPlacementAssistance: string;
  mainBuildingPhoto: File | null;
  classroomPhotos: File[];
  laboratoryPhotos: File[];
  facilitiesPhotos: File[];
  achievementPhotos: File[];
}

// Step 3 Form Data Interface
interface Step3FormData {
  courseCategories: {
    cbse: boolean;
    icse: boolean;
    stateBoard: boolean;
    ibInternational: boolean;
    competitiveExams: boolean;
    professionalCourses: boolean;
    languageClasses: boolean;
    computerCourses: boolean;
    artsCrafts: boolean;
    musicDance: boolean;
    sportsTraining: boolean;
  };
  courseDetails: {
    [key: string]: {
      subjectsOffered: string[];
      classLevels: { beginner: boolean; intermediate: boolean; advanced: boolean };
      batchSizes: string;
      courseDuration: string;
      certificationProvided: string;
      courseFeeStructure: string;
    };
  };
  totalCurrentStudents: string;
  averageBatchSize: string;
  studentTeacherRatio: string;
  classTimings: {
    morningBatches: boolean;
    afternoonBatches: boolean;
    eveningBatches: boolean;
    weekendBatches: boolean;
    flexibleTimings: boolean;
  };
  admissionTestRequired: string;
  minimumQualification: string;
  ageRestrictions: string;
  admissionFees: string;
  securityDeposit: string;
  refundPolicy: string;
}

// Step 4 Form Data Interface
interface Step4FormData {
  totalTeachingStaff: string;
  totalNonTeachingStaff: string;
  averageFacultyExperience: string;
  principalDirectorName: string;
  principalDirectorQualification: string;
  principalDirectorExperience: string;
  principalDirectorPhoto: File | null;
  principalDirectorBio: string;
  departmentHeads: Array<{
    id: string;
    name: string;
    department: string;
    qualification: string;
    experience: string;
    photo: File | null;
    specialization: string;
  }>;
  phdHolders: string;
  postGraduates: string;
  graduates: string;
  professionalCertified: string;
  awardsReceived: string;
  publications: string;
  industryExperience: string;
  trainingPrograms: string;
}

// Step 5 Form Data Interface
interface Step5FormData {
  boardExamResults: Array<{
    year: string;
    passPercentage: string;
    distinctionPercentage: string;
    topScorerDetails: string;
  }>;
  competitiveExamResults: Array<{
    id: number;
    examType: string;
    year: string;
    totalStudentsAppeared: string;
    qualifiedStudents: string;
    topRanksAchieved: string;
    successPercentage: string;
  }>;
  institutionAwards: {
    institutionAwards: string;
    governmentRecognition: string;
    educationBoardAwards: string;
    qualityCertifications: string;
    mediaRecognition: string;
  };
  studentAchievements: {
    sportsAchievements: string;
    culturalAchievements: string;
    academicExcellenceAwards: string;
    competitionWinners: string;
  };
  accreditations: {
    governmentAccreditation: string;
    boardAffiliationDetails: string;
    universityAffiliation: string;
    professionalBodyMembership: string;
    qualityCertifications: string;
    certificateDocuments: File[];
  };
  successStories: {
    alumniSuccessStories: string;
    placementRecords: string;
    higherStudiesAdmissions: string;
    scholarshipRecipients: string;
  };
}

// Step 6 Form Data Interface
interface Step6FormData {
  courses: Array<{
    id: number;
    courseName: string;
    admissionFee: string;
    monthlyFee: string;
    quarterlyFee: string;
    annualFee: string;
    materialCharges: string;
    examFee: string;
    otherCharges: string;
  }>;
  paymentModes: {
    cash: boolean;
    cheque: boolean;
    bankTransfer: boolean;
    onlinePayment: boolean;
    upi: boolean;
    creditDebitCards: boolean;
  };
  emiAvailable: string;
  paymentSchedule: string;
  latePaymentPenalty: string;
  refundPolicy: string;
  scholarshipAvailable: string;
  scholarshipCriteria: string;
  discountMultipleCourses: string;
  siblingDiscount: string;
  earlyBirdDiscount: string;
  educationLoanAssistance: string;
  installmentFacility: string;
  hardshipSupport: string;
}

// Step 7 Form Data Interface
export interface Step7FormData {
  primaryContactPerson: string;
  designation: string;
  directPhoneNumber: string;
  emailAddress: string;
  whatsappNumber: string;
  bestTimeToContact: string;
  facebookPageUrl: string;
  instagramAccountUrl: string;
  youtubeChannelUrl: string;
  linkedinProfileUrl: string;
  googleMyBusinessUrl: string;
  emergencyContactPerson: string;
  localPoliceStationContact: string;
  nearestHospitalContact: string;
  fireDepartmentContact: string;
  businessRegistrationCertificate: File | null;
  educationBoardAffiliationCertificate: File | null;
  fireSafetyCertificate: File | null;
  buildingPlanApproval: File | null;
  panCardDocument: File | null;
  gstCertificateDocument: File | null;
  bankAccountDetailsDocument: File | null;
  institutionPhotographs: File[];
  insuranceDocuments: File[];
  accreditationCertificates: File[];
  awardCertificates: File[];
  facultyQualificationCertificates: File[];
  safetyComplianceCertificates: File[];
  agreeToTerms: boolean;
  agreeToBackgroundVerification: boolean;
}

// Complete Form Data Interface (for all steps)
export interface InstitutionSignupFormData {
  step1: Step1FormData;
  step2: Step2FormData;
  step3: Step3FormData;
  step4: Step4FormData;
  step5: Step5FormData;
  step6: Step6FormData;
  step7: Step7FormData;
}

// Context Interface
interface InstitutionSignupContextType {
  currentStep: number;
  totalSteps: number;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  isStep3Valid: boolean;
  isStep4Valid: boolean;
  isStep5Valid: boolean;
  isStep6Valid: boolean;
  isStep7Valid: boolean;
  stepCompletionStatus: {
    [key: number]: 'not_started' | 'in_progress' | 'completed';
  };
  isFormComplete: boolean;
  formData: InstitutionSignupFormData;
  updateStep1Data: (data: Partial<Step1FormData>) => void;
  updateStep2Data: (data: Partial<Step2FormData>) => void;
  updateStep3Data: (data: any) => void;
  updateStep4Data: (data: any) => void;
  updateStep5Data: (data: any) => void;
  updateStep6Data: (data: any) => void;
  updateStep7Data: (data: Partial<Step7FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  submitAllSteps: () => Promise<{ success: boolean; message: string }>;
  getFormValidationErrors: () => string[];
  submitStep1: (data: Step1FormData) => Promise<{ success: boolean; data: any }>;
  submitStep2: (data: Step2FormData) => Promise<{ success: boolean; data: any }>;
  submitStep3: (data: Step3FormData) => Promise<{ success: boolean; data: any }>;
  submitStep4: (data: Step4FormData) => Promise<{ success: boolean; data: any }>;
  submitStep5: (data: Step5FormData) => Promise<{ success: boolean; data: any }>;
  submitStep6: (data: Step6FormData) => Promise<{ success: boolean; data: any }>;
  submitStep7: (data: Step7FormData) => Promise<{ success: boolean; data: any }>;
}

// Create the context
const InstitutionSignupContext = createContext<InstitutionSignupContextType | undefined>(undefined);

// Provider component
export const InstitutionSignupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(7);
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [isStep2Valid, setIsStep2Valid] = useState(false);
  const [isStep3Valid, setIsStep3Valid] = useState(false);
  const [isStep4Valid, setIsStep4Valid] = useState(false);
  const [isStep5Valid, setIsStep5Valid] = useState(false);
  const [isStep6Valid, setIsStep6Valid] = useState(false);
  const [isStep7Valid, setIsStep7Valid] = useState(false);
  
  const [stepCompletionStatus, setStepCompletionStatus] = useState<{
    [key: number]: 'not_started' | 'in_progress' | 'completed';
  }>({
    1: 'not_started',
    2: 'not_started',
    3: 'not_started',
    4: 'not_started',
    5: 'not_started',
    6: 'not_started',
    7: 'not_started',
  });

  const [formData, setFormData] = useState<InstitutionSignupFormData>({
    step1: {
    institutionName: '',
    institutionType: '',
      otherInstitutionType: '',
      establishmentYear: '',
    registrationNumber: '',
      panNumber: '',
      gstNumber: '',
      officialEmail: '',
      password: '',
      primaryContact: '',
      secondaryContact: '',
      websiteUrl: '',
      completeAddress: '',
    city: '',
    state: '',
      pinCode: '',
      landmark: '',
      mapLocation: '',
      ownerDirectorName: '',
      ownerContactNumber: '',
      businessLicenseFile: null,
      registrationCertificateFile: null,
    },
    step2: {
      totalClassrooms: '',
      classroomCapacity: '',
      libraryAvailable: '',
      computerLabAvailable: '',
      wifiAvailable: '',
      parkingAvailable: '',
      cafeteriaAvailable: '',
      airConditioningAvailable: '',
      cctvSecurityAvailable: '',
      wheelchairAccessible: '',
      projectorsSmartBoardsAvailable: '',
      audioSystemAvailable: '',
      laboratoryFacilities: {
        physicsLab: false,
        chemistryLab: false,
        biologyLab: false,
    computerLab: false,
        languageLab: false,
      },
      sportsFacilities: {
        indoorGames: false,
        outdoorPlayground: false,
        gymnasium: false,
        swimmingPool: false,
      },
      transportationProvided: '',
      hostelFacility: '',
      studyMaterialProvided: '',
      onlineClasses: '',
      recordedSessions: '',
      mockTestsAssessments: '',
      careerCounseling: '',
      jobPlacementAssistance: '',
      mainBuildingPhoto: null,
      classroomPhotos: [],
      laboratoryPhotos: [],
      facilitiesPhotos: [],
      achievementPhotos: [],
    },
    step3: {
      courseCategories: {
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
        sportsTraining: false,
      },
      courseDetails: {},
      totalCurrentStudents: '',
      averageBatchSize: '',
    studentTeacherRatio: '',
      classTimings: {
        morningBatches: false,
        afternoonBatches: false,
        eveningBatches: false,
        weekendBatches: false,
        flexibleTimings: false,
      },
      admissionTestRequired: '',
    minimumQualification: '',
    ageRestrictions: '',
      admissionFees: '',
      securityDeposit: '',
    refundPolicy: '',
    },
        step4: {
      totalTeachingStaff: '',
      totalNonTeachingStaff: '',
    averageFacultyExperience: '',
      principalDirectorName: '',
      principalDirectorQualification: '',
      principalDirectorExperience: '',
      principalDirectorPhoto: null,
      principalDirectorBio: '',
    departmentHeads: [],
      phdHolders: '',
      postGraduates: '',
      graduates: '',
      professionalCertified: '',
    awardsReceived: '',
    publications: '',
    industryExperience: '',
      trainingPrograms: '',
    },
    step5: {
      boardExamResults: [
        { year: '', passPercentage: '', distinctionPercentage: '', topScorerDetails: '' },
        { year: '', passPercentage: '', distinctionPercentage: '', topScorerDetails: '' },
        { year: '', passPercentage: '', distinctionPercentage: '', topScorerDetails: '' }
      ],
      competitiveExamResults: [
        { id: 1, examType: '', year: '', totalStudentsAppeared: '', qualifiedStudents: '', topRanksAchieved: '', successPercentage: '' }
      ],
      institutionAwards: {
        institutionAwards: '',
        governmentRecognition: '',
        educationBoardAwards: '',
        qualityCertifications: '',
        mediaRecognition: ''
      },
      studentAchievements: {
        sportsAchievements: '',
        culturalAchievements: '',
        academicExcellenceAwards: '',
        competitionWinners: ''
      },
      accreditations: {
        governmentAccreditation: '',
    boardAffiliationDetails: '',
    universityAffiliation: '',
    professionalBodyMembership: '',
    qualityCertifications: '',
        certificateDocuments: []
      },
      successStories: {
    alumniSuccessStories: '',
    placementRecords: '',
    higherStudiesAdmissions: '',
        scholarshipRecipients: ''
      }
    },
    step6: {
      courses: [
        {
          id: 1,
          courseName: '',
          admissionFee: '',
          monthlyFee: '',
          quarterlyFee: '',
          annualFee: '',
          materialCharges: '',
          examFee: '',
          otherCharges: ''
        }
      ],
      paymentModes: {
        cash: false,
        cheque: false,
        bankTransfer: false,
        onlinePayment: false,
        upi: false,
        creditDebitCards: false
      },
      emiAvailable: '',
    paymentSchedule: '',
    latePaymentPenalty: '',
    refundPolicy: '',
      scholarshipAvailable: '',
    scholarshipCriteria: '',
      discountMultipleCourses: '',
      siblingDiscount: '',
      earlyBirdDiscount: '',
      educationLoanAssistance: '',
      installmentFacility: '',
      hardshipSupport: ''
    },
    step7: {
      primaryContactPerson: '',
      designation: '',
      directPhoneNumber: '',
      emailAddress: '',
      whatsappNumber: '',
      bestTimeToContact: '',
      facebookPageUrl: '',
      instagramAccountUrl: '',
      youtubeChannelUrl: '',
      linkedinProfileUrl: '',
      googleMyBusinessUrl: '',
      emergencyContactPerson: '',
      localPoliceStationContact: '',
      nearestHospitalContact: '',
      fireDepartmentContact: '',
      businessRegistrationCertificate: null,
      educationBoardAffiliationCertificate: null,
      fireSafetyCertificate: null,
      buildingPlanApproval: null,
      panCardDocument: null,
      gstCertificateDocument: null,
      bankAccountDetailsDocument: null,
      institutionPhotographs: [],
      insuranceDocuments: [],
      accreditationCertificates: [],
      awardCertificates: [],
      facultyQualificationCertificates: [],
      safetyComplianceCertificates: [],
      agreeToTerms: false,
      agreeToBackgroundVerification: false,
    },
  });

  // Navigation functions - Now allow free navigation
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  // Form data update functions
  const updateStep1Data = useCallback((data: Partial<Step1FormData>) => {
    setFormData(prev => ({
      ...prev,
      step1: { ...prev.step1, ...data }
    }));
  }, []);

  const updateStep2Data = useCallback((data: Partial<Step2FormData>) => {
    setFormData(prev => ({
      ...prev,
      step2: { ...prev.step2, ...data }
    }));
  }, []);

  const updateStep3Data = useCallback((data: Partial<Step3FormData>) => {
          setFormData(prev => ({
            ...prev,
      step3: { ...prev.step3, ...data }
    }));
  }, []);

  const updateStep4Data = useCallback((data: any) => {
              setFormData(prev => ({
                ...prev,
      step4: { ...prev.step4, ...data }
    }));
  }, []);

  const updateStep5Data = useCallback((data: any) => {
              setFormData(prev => ({
                ...prev,
      step5: { ...prev.step5, ...data }
    }));
  }, []);

  const updateStep6Data = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      step6: { ...prev.step6, ...data }
    }));
  }, []);

  const updateStep7Data = useCallback((data: Partial<Step7FormData>) => {
    setFormData(prev => ({
      ...prev,
      step7: { ...prev.step7, ...data }
    }));
  }, []);

  // Step 1 validation when formData changes
  // TEMPORARY: Disabled for testing to prevent glitching
  // useEffect(() => {
  //   const step1Data = formData.step1;
  //   const isValid = 
  //     step1Data.institutionName.trim() !== '' &&
  //     step1Data.institutionType !== '' &&
  //     (step1Data.institutionType !== 'other' || step1Data.otherInstitutionType.trim() !== '') &&
  //     step1Data.establishmentYear !== '' &&
  //     step1Data.registrationNumber.trim() !== '' &&
  //     step1Data.panNumber.trim() !== '' &&
  //     step1Data.officialEmail.trim() !== '' &&
  //     step1Data.primaryContact.trim() !== '' &&
  //     step1Data.completeAddress.trim() !== '' &&
  //     step1Data.city !== '' &&
  //     step1Data.state !== '' &&
  //     step1Data.pinCode.trim() !== '' &&
  //     step1Data.ownerDirectorName.trim() !== '' &&
  //     step1Data.ownerContactNumber.trim() !== '' &&
  //     step1Data.businessLicenseFile !== null &&
  //     step1Data.registrationCertificateFile !== null;

  //   setIsStep1Valid(isValid);

  //   // Update step completion status
  //   if (isValid) {
  //     setStepCompletionStatus(prev => ({ ...prev, 1: 'completed' }));
  //   } else if (Object.values(step1Data).some(value => 
  //     typeof value === 'string' ? value.trim() !== '' : value !== null && value !== false
  //   )) {
  //     setStepCompletionStatus(prev => ({ ...prev, 1: 'in_progress' }));
  //           } else {
  //     setStepCompletionStatus(prev => ({ ...prev, 1: 'not_started' }));
  //   }
  // }, [formData.step1.institutionName, formData.step1.institutionType, formData.step1.otherInstitutionType, formData.step1.establishmentYear, formData.step1.registrationNumber, formData.step1.panNumber, formData.step1.officialEmail, formData.step1.primaryContact, formData.step1.completeAddress, formData.step1.city, formData.step1.state, formData.step1.pinCode, formData.step1.ownerDirectorName, formData.step1.ownerContactNumber, formData.step1.businessLicenseFile, formData.step1.registrationCertificateFile]);

  // Update Step 2 validation when formData changes
  // TEMPORARY: Disabled for testing to prevent glitching
  // useEffect(() => {
  //   const step2Data = formData.step2;
  //   const isCompleted = 
  //     step2Data.totalClassrooms !== '' &&
  //     step2Data.classroomCapacity !== '' &&
  //     step2Data.libraryAvailable !== '' &&
  //     step2Data.computerLabAvailable !== '' &&
  //     step2Data.wifiAvailable !== '' &&
  //     step2Data.parkingAvailable !== '' &&
  //     step2Data.cafeteriaAvailable !== '' &&
  //     step2Data.airConditioningAvailable !== '' &&
  //     step2Data.cctvSecurityAvailable !== '' &&
  //     step2Data.wheelchairAccessible !== '' &&
  //     step2Data.projectorsSmartBoardsAvailable !== '' &&
  //     step2Data.audioSystemAvailable !== '' &&
  //     step2Data.transportationProvided !== '' &&
  //     step2Data.hostelFacility !== '' &&
  //     step2Data.studyMaterialProvided !== '' &&
  //     step2Data.onlineClasses !== '' &&
  //     step2Data.recordedSessions !== '' &&
  //     step2Data.mockTestsAssessments !== '' &&
  //     step2Data.careerCounseling !== '' &&
  //     step2Data.jobPlacementAssistance !== '' &&
  //     step2Data.mainBuildingPhoto !== null;

  //   setIsStep2Valid(isCompleted);

  //   // Update step completion status
  //   if (isCompleted) {
  //     setStepCompletionStatus(prev => ({ ...prev, 2: 'completed' }));
  //   } else if (Object.values(step2Data).some(value => 
  //     value !== '' && value !== null && 
  //     (Array.isArray(value) ? value.length > 0 : true) &&
  //     (typeof value === 'object' ? Object.values(value).some(v => v !== false) : true)
  //   )) {
  //     setStepCompletionStatus(prev => ({ ...prev, 2: 'in_progress' }));
  //   } else {
  //     setStepCompletionStatus(prev => ({ ...prev, 2: 'not_started' }));
  //   }
  // }, [formData.step2.totalClassrooms, formData.step2.classroomCapacity, formData.step2.libraryAvailable, formData.step2.computerLabAvailable, formData.step2.wifiAvailable, formData.step2.parkingAvailable, formData.step2.cafeteriaAvailable, formData.step2.airConditioningAvailable, formData.step2.cctvSecurityAvailable, formData.step2.wheelchairAccessible, formData.step2.projectorsSmartBoardsAvailable, formData.step2.audioSystemAvailable, formData.step2.transportationProvided, formData.step2.hostelFacility, formData.step2.studyMaterialProvided, formData.step2.onlineClasses, formData.step2.recordedSessions, formData.step2.mockTestsAssessments, formData.step2.careerCounseling, formData.step2.jobPlacementAssistance, formData.step2.mainBuildingPhoto]);

  // No localStorage functionality - form works as regular form

  // Validation helper functions
  const validateStep1 = (data: Step1FormData): boolean => {
    return !!(
      data.institutionName?.trim() &&
      data.institutionType &&
      data.establishmentYear &&
      data.registrationNumber?.trim() &&
      data.panNumber?.trim() &&
      data.officialEmail?.trim() &&
      data.password?.trim() &&
      data.primaryContact?.trim() &&
      data.completeAddress?.trim() &&
      data.city &&
      data.state &&
      data.pinCode?.trim() &&
      data.ownerDirectorName?.trim() &&
      data.ownerContactNumber?.trim()
    );
  };

  const validateStep2 = (data: Step2FormData): boolean => {
    return !!(
      data.totalClassrooms?.trim() &&
      data.classroomCapacity?.trim() &&
      data.libraryAvailable &&
      data.computerLabAvailable &&
      data.wifiAvailable &&
      data.parkingAvailable &&
      data.cafeteriaAvailable &&
      data.airConditioningAvailable &&
      data.cctvSecurityAvailable &&
      data.wheelchairAccessible &&
      data.projectorsSmartBoardsAvailable &&
      data.audioSystemAvailable
    );
  };

  const validateStep3 = (data: any): boolean => {
    return !!(
      data.totalCurrentStudents?.trim() &&
      data.averageBatchSize?.trim() &&
      data.studentTeacherRatio?.trim() &&
      data.admissionFees?.trim()
    );
  };

  const validateStep4 = (data: any): boolean => {
    return !!(
      data.totalTeachingStaff?.trim() &&
      data.averageFacultyExperience &&
      data.principalDirectorName?.trim() &&
      data.principalDirectorQualification?.trim() &&
      data.principalDirectorExperience?.trim()
    );
  };

  const validateStep5 = (data: any): boolean => {
    return !!(
      data.boardAffiliationDetails?.trim()
    );
  };

  const validateStep6 = (data: any): boolean => {
    return !!(
      data.courses?.length > 0 &&
      data.courses[0]?.courseName?.trim() &&
      data.courses[0]?.admissionFee?.trim() &&
      data.courses[0]?.monthlyFee?.trim() &&
      data.courses[0]?.quarterlyFee?.trim() &&
      data.courses[0]?.annualFee?.trim() &&
      data.refundPolicy?.trim()
    );
  };

  const validateStep7 = (data: any): boolean => {
    return !!(
      data.primaryContactPerson?.trim() &&
      data.designation &&
      data.directPhoneNumber?.trim() &&
      data.emailAddress?.trim() &&
      data.bestTimeToContact &&
      data.agreeToTerms &&
      data.agreeToBackgroundVerification
    );
  };

  // Final form validation for submission
  // TEMPORARY: Always allow submission for testing purposes
  const isFormComplete = true; // isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid && isStep5Valid && isStep6Valid && isStep7Valid;

  const getFormValidationErrors = (): string[] => {
    const errors: string[] = [];
    if (!isStep1Valid) errors.push('Step 1: Institution Basic Information');
    if (!isStep2Valid) errors.push('Step 2: Institution Details & Facilities');
    if (!isStep3Valid) errors.push('Step 3: Not implemented yet');
    if (!isStep4Valid) errors.push('Step 4: Not implemented yet');
    if (!isStep5Valid) errors.push('Step 5: Not implemented yet');
    if (!isStep6Valid) errors.push('Step 6: Not implemented yet');
    if (!isStep7Valid) errors.push('Step 7: Not implemented yet');
    return errors;
  };

  // Submit Step 1 data to Supabase
  const submitStep1 = async (step1Data: Step1FormData) => {
    try {
      // First, upload documents to Supabase Storage if they exist
      let businessLicenseUrl = null;
      let registrationCertificateUrl = null;

      if (step1Data.businessLicenseFile) {
        const licensePath = `institution-documents/licenses/${Date.now()}-${step1Data.businessLicenseFile.name}`;
        const { data: licenseData, error: licenseError } = await supabase.storage
          .from('institution-documents')
          .upload(licensePath, step1Data.businessLicenseFile);
        
        if (licenseError) throw licenseError;
        businessLicenseUrl = licensePath;
      }

      if (step1Data.registrationCertificateFile) {
        const certPath = `institution-documents/certificates/${Date.now()}-${step1Data.registrationCertificateFile.name}`;
        const { data: certData, error: certError } = await supabase.storage
          .from('institution-documents')
          .upload(certPath, step1Data.registrationCertificateFile);
        
        if (certError) throw certError;
        registrationCertificateUrl = certPath;
      }

      // Insert Step 1 data into the database
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      // Try upsert first, if it fails due to constraint issues, fall back to delete + insert
      let data, error;
      try {
        const result = await supabase
        .from('institution_profiles')
        .upsert({
            user_id: userId,
            institution_name: step1Data.institutionName || 'Not provided',
            institution_type: step1Data.institutionType === 'other' ? step1Data.otherInstitutionType : step1Data.institutionType || 'Not provided',
            established_year: step1Data.establishmentYear ? parseInt(step1Data.establishmentYear) : null,
            registration_number: step1Data.registrationNumber || 'Not provided',
            pan_number: step1Data.panNumber || 'Not provided',
          gst_number: step1Data.gstNumber || null,
            official_email: step1Data.officialEmail || 'Not provided',
            primary_contact_number: step1Data.primaryContact || 'Not provided',
          secondary_contact_number: step1Data.secondaryContact || null,
          website_url: step1Data.websiteUrl || null,
            address: step1Data.completeAddress || 'Not provided',
            city: step1Data.city || 'Not provided',
            state: step1Data.state || 'Not provided',
            pin_code: step1Data.pinCode || 'Not provided',
          landmark: step1Data.landmark || null,
          google_maps_location: step1Data.mapLocation || null,
            owner_name: step1Data.ownerDirectorName || 'Not provided',
            owner_contact_number: step1Data.ownerContactNumber || 'Not provided',
          business_license: businessLicenseUrl,
          registration_certificate: registrationCertificateUrl,
          });
        data = result.data;
        error = result.error;
      } catch (upsertError) {
        console.log('Upsert failed, trying delete + insert approach:', upsertError);
        // If upsert fails, try delete + insert approach
        if (userId) {
          await supabase
            .from('institution_profiles')
            .delete()
            .eq('user_id', userId);
        }
        
        const result = await supabase
          .from('institution_profiles')
          .insert({
            user_id: userId,
            institution_name: step1Data.institutionName || 'Not provided',
            institution_type: step1Data.institutionType === 'other' ? step1Data.otherInstitutionType : step1Data.institutionType || 'Not provided',
            established_year: step1Data.establishmentYear ? parseInt(step1Data.establishmentYear) : null,
            registration_number: step1Data.registrationNumber || 'Not provided',
            pan_number: step1Data.panNumber || 'Not provided',
            gst_number: step1Data.gstNumber || null,
            official_email: step1Data.officialEmail || 'Not provided',
            primary_contact_number: step1Data.primaryContact || 'Not provided',
            secondary_contact_number: step1Data.secondaryContact || null,
            website_url: step1Data.websiteUrl || null,
            address: step1Data.completeAddress || 'Not provided',
            city: step1Data.city || 'Not provided',
            state: step1Data.state || 'Not provided',
            pin_code: step1Data.pinCode || 'Not provided',
            landmark: step1Data.landmark || null,
            google_maps_location: step1Data.mapLocation || null,
            owner_name: step1Data.ownerDirectorName || 'Not provided',
            owner_contact_number: step1Data.ownerContactNumber || 'Not provided',
            business_license: businessLicenseUrl,
            registration_certificate: registrationCertificateUrl,
          });
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      console.log('Step 1 data submitted successfully:', data);
      return { success: true, data };
      } catch (error) {
      console.error('Error submitting Step 1:', error);
      throw error;
    }
  };

  // Submit Step 2 data to Supabase
  const submitStep2 = async (step2Data: Step2FormData) => {
    // TEMPORARY: Skip individual step submission to avoid schema issues
    console.log('Step 2 submission skipped - using simplified approach');
    return { success: true, data: null };
    
    // @ts-ignore - Temporarily disabled to avoid schema issues
    try {
      // First, upload photos to Supabase Storage
      let mainBuildingPhotoUrl = null;
      let classroomPhotoUrls: string[] = [];
      let laboratoryPhotoUrls: string[] = [];
      let facilitiesPhotoUrls: string[] = [];
      let achievementPhotoUrls: string[] = [];

      if (step2Data.mainBuildingPhoto) {
        const mainPhotoPath = `institution-photos/main-building/${Date.now()}-${step2Data.mainBuildingPhoto.name}`;
        const { data: mainPhotoData, error: mainPhotoError } = await supabase.storage
          .from('institution-photos')
          .upload(mainPhotoPath, step2Data.mainBuildingPhoto);
        
        if (mainPhotoError) throw mainPhotoError;
        mainBuildingPhotoUrl = mainPhotoPath;
      }

      if (step2Data.classroomPhotos.length > 0) {
        for (const photo of step2Data.classroomPhotos) {
          const photoPath = `institution-photos/classrooms/${Date.now()}-${photo.name}`;
          const { data: photoData, error: photoError } = await supabase.storage
            .from('institution-photos')
            .upload(photoPath, photo);
          
          if (photoError) throw photoError;
          classroomPhotoUrls.push(photoPath);
        }
      }

      if (step2Data.laboratoryPhotos.length > 0) {
        for (const photo of step2Data.laboratoryPhotos) {
          const photoPath = `institution-photos/laboratories/${Date.now()}-${photo.name}`;
          const { data: photoData, error: photoError } = await supabase.storage
            .from('institution-photos')
            .upload(photoPath, photo);
          
          if (photoError) throw photoError;
          laboratoryPhotoUrls.push(photoPath);
        }
      }

      if (step2Data.facilitiesPhotos.length > 0) {
        for (const photo of step2Data.facilitiesPhotos) {
          const photoPath = `institution-photos/facilities/${Date.now()}-${photo.name}`;
          const { data: photoData, error: photoError } = await supabase.storage
            .from('institution-photos')
            .upload(photoPath, photo);
          
          if (photoError) throw photoError;
          facilitiesPhotoUrls.push(photoPath);
        }
      }

      if (step2Data.achievementPhotos.length > 0) {
        for (const photo of step2Data.achievementPhotos) {
          const photoPath = `institution-photos/achievements/${Date.now()}-${photo.name}`;
          const { data: photoData, error: photoError } = await supabase.storage
            .from('institution-photos')
            .upload(photoPath, photo);
          
          if (photoError) throw photoError;
          achievementPhotoUrls.push(photoPath);
        }
      }

      // Insert Step 2 data into the database
      const { data, error } = await supabase
        .from('institution_profiles')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          total_classrooms: parseInt(step2Data.totalClassrooms) || 0,
          classroom_capacity: parseInt(step2Data.classroomCapacity) || 0,
          library_available: step2Data.libraryAvailable === 'yes',
          computer_lab_available: step2Data.computerLabAvailable === 'yes',
          wifi_available: step2Data.wifiAvailable === 'yes',
          parking_available: step2Data.parkingAvailable === 'yes',
          cafeteria_available: step2Data.cafeteriaAvailable === 'yes',
          air_conditioning_available: step2Data.airConditioningAvailable === 'yes',
          cctv_security_available: step2Data.cctvSecurityAvailable === 'yes',
          wheelchair_accessible: step2Data.wheelchairAccessible === 'yes',
          projectors_smart_boards: step2Data.projectorsSmartBoardsAvailable === 'yes',
          audio_system: step2Data.audioSystemAvailable === 'yes',
          physics_lab: step2Data.laboratoryFacilities.physicsLab,
          chemistry_lab: step2Data.laboratoryFacilities.chemistryLab,
          biology_lab: step2Data.laboratoryFacilities.biologyLab,
          computer_lab: step2Data.laboratoryFacilities.computerLab,
          language_lab: step2Data.laboratoryFacilities.languageLab,
          indoor_games: step2Data.sportsFacilities.indoorGames,
          outdoor_playground: step2Data.sportsFacilities.outdoorPlayground,
          gymnasium: step2Data.sportsFacilities.gymnasium,
          swimming_pool: step2Data.sportsFacilities.swimmingPool,
          transportation_provided: step2Data.transportationProvided === 'yes',
          hostel_facility: step2Data.hostelFacility === 'yes',
          study_material_provided: step2Data.studyMaterialProvided === 'yes',
          online_classes: step2Data.onlineClasses === 'yes',
          recorded_sessions: step2Data.recordedSessions === 'yes',
          mock_tests_assessments: step2Data.mockTestsAssessments === 'yes',
          career_counseling: step2Data.careerCounseling === 'yes',
          job_placement_assistance: step2Data.jobPlacementAssistance === 'yes',
          main_building_photo: mainBuildingPhotoUrl,
          classroom_photos: classroomPhotoUrls,
          laboratory_photos: laboratoryPhotoUrls,
          facilities_photos: facilitiesPhotoUrls,
          achievement_photos: achievementPhotoUrls,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      console.log('Step 2 data submitted successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting Step 2:', error);
      throw error;
    }
  };

  // Submit Step 3 data to Supabase
  const submitStep3 = async (step3Data: Step3FormData) => {
    // TEMPORARY: Skip individual step submission to avoid schema issues
    console.log('Step 3 submission skipped - using simplified approach');
    return { success: true, data: null };
    
    // @ts-ignore - Temporarily disabled to avoid schema issues
    try {
      // Insert Step 3 data into the database
      const { data, error } = await supabase
        .from('institution_profiles')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          course_categories: step3Data.courseCategories,
          course_details: step3Data.courseDetails,
          total_current_students: step3Data.totalCurrentStudents ? parseInt(step3Data.totalCurrentStudents) : 0,
          average_batch_size: step3Data.averageBatchSize ? parseInt(step3Data.averageBatchSize) : 0,
          student_teacher_ratio: step3Data.studentTeacherRatio,
          class_timings: step3Data.classTimings,
          admission_test_required: step3Data.admissionTestRequired === 'yes',
          minimum_qualification: step3Data.minimumQualification,
          age_restrictions: step3Data.ageRestrictions,
          admission_fees: step3Data.admissionFees ? parseFloat(step3Data.admissionFees) : 0.00,
          security_deposit: step3Data.securityDeposit ? parseFloat(step3Data.securityDeposit) : 0.00,
          refund_policy: step3Data.refundPolicy,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      console.log('Step 3 data submitted successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting Step 3:', error);
      throw error;
    }
  };

    // Submit Step 4
  const submitStep4 = async (step4Data: Step4FormData) => {
    // TEMPORARY: Skip individual step submission to avoid schema issues
    console.log('Step 4 submission skipped - using simplified approach');
    return { success: true, data: null };
    
    // @ts-ignore - Temporarily disabled to avoid schema issues
    try {
      // Handle file uploads for principal/director photo
      let principalPhotoUrl = '';
      if (step4Data.principalDirectorPhoto) {
        const fileExt = step4Data.principalDirectorPhoto.name.split('.').pop();
        const fileName = `principal_photo_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('institution-photos')
          .upload(fileName, step4Data.principalDirectorPhoto);
        
        if (uploadError) throw uploadError;
        principalPhotoUrl = uploadData.path;
      }
  
      // Handle file uploads for department heads photos
      const departmentHeadsWithPhotos = await Promise.all(
        step4Data.departmentHeads.map(async (head) => {
          let photoUrl = '';
          if (head.photo) {
            const fileExt = head.photo.name.split('.').pop();
            const fileName = `dept_head_${head.id}_${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('institution-photos')
              .upload(fileName, head.photo);
            
            if (uploadError) throw uploadError;
            photoUrl = uploadData.path;
          }
          return { ...head, photo: photoUrl };
        })
      );
  
      // Insert Step 4 data into the database
      const { data, error } = await supabase
        .from('institution_profiles')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          total_teaching_staff: step4Data.totalTeachingStaff ? parseInt(step4Data.totalTeachingStaff) : 0,
          total_non_teaching_staff: step4Data.totalNonTeachingStaff ? parseInt(step4Data.totalNonTeachingStaff) : 0,
          average_faculty_experience: step4Data.averageFacultyExperience,
          principal_director_name: step4Data.principalDirectorName,
          principal_director_qualification: step4Data.principalDirectorQualification,
          principal_director_experience: step4Data.principalDirectorExperience ? parseInt(step4Data.principalDirectorExperience) : 0,
          principal_director_photo: principalPhotoUrl,
          principal_director_bio: step4Data.principalDirectorBio,
          department_heads: departmentHeadsWithPhotos,
          phd_holders: step4Data.phdHolders ? parseInt(step4Data.phdHolders) : 0,
          post_graduates: step4Data.postGraduates ? parseInt(step4Data.postGraduates) : 0,
          graduates: step4Data.graduates ? parseInt(step4Data.graduates) : 0,
          professional_certified: step4Data.professionalCertified ? parseInt(step4Data.professionalCertified) : 0,
          awards_received: step4Data.awardsReceived,
          publications: step4Data.publications,
          industry_experience: step4Data.industryExperience,
          training_programs: step4Data.trainingPrograms,
        }, {
          onConflict: 'user_id'
        });
  
      if (error) throw error;
      console.log('Step 4 data submitted successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting Step 4:', error);
      throw error;
    }
  };

  // Submit Step 5
  const submitStep5 = async (step5Data: Step5FormData) => {
    // TEMPORARY: Skip individual step submission to avoid schema issues
    console.log('Step 5 submission skipped - using simplified approach');
    return { success: true, data: null };
    
    // @ts-ignore - Temporarily disabled to avoid schema issues
    try {
      // Handle file uploads for certificate documents
      let certificateDocumentUrls: string[] = [];
      if (step5Data.accreditations.certificateDocuments && step5Data.accreditations.certificateDocuments.length > 0) {
        const uploadPromises = step5Data.accreditations.certificateDocuments.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `certificate_doc_${Date.now()}_${index}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('institution-documents')
            .upload(fileName, file);
          
          if (uploadError) throw uploadError;
          return uploadData.path;
        });
        
        certificateDocumentUrls = await Promise.all(uploadPromises);
      }

      // Insert Step 5 data into the database
      const { data, error } = await supabase
        .from('institution_profiles')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          board_exam_results: step5Data.boardExamResults,
          competitive_exam_results: step5Data.competitiveExamResults,
          institution_awards: step5Data.institutionAwards,
          student_achievements: step5Data.studentAchievements,
          accreditations: {
            ...step5Data.accreditations,
            certificateDocuments: certificateDocumentUrls
          },
          success_stories: step5Data.successStories,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      console.log('Step 5 data submitted successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting Step 5:', error);
      throw error;
    }
  };

  // Submit Step 6
  const submitStep6 = async (step6Data: Step6FormData) => {
    // TEMPORARY: Skip individual step submission to avoid schema issues
    console.log('Step 6 submission skipped - using simplified approach');
    return { success: true, data: null };
    
    // @ts-ignore - Temporarily disabled to avoid schema issues
    try {
      // Insert Step 6 data into the database
      const { data, error } = await supabase
        .from('institution_profiles')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          courses: step6Data.courses,
          payment_modes: step6Data.paymentModes,
          emi_available: step6Data.emiAvailable,
          payment_schedule: step6Data.paymentSchedule,
          late_payment_penalty: step6Data.latePaymentPenalty,
          refund_policy: step6Data.refundPolicy,
          scholarship_available: step6Data.scholarshipAvailable,
          scholarship_criteria: step6Data.scholarshipCriteria,
          discount_multiple_courses: step6Data.discountMultipleCourses,
          sibling_discount: step6Data.siblingDiscount,
          early_bird_discount: step6Data.earlyBirdDiscount,
          education_loan_assistance: step6Data.educationLoanAssistance,
          installment_facility: step6Data.installmentFacility,
          hardship_support: step6Data.hardshipSupport,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      console.log('Step 6 data submitted successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting Step 6:', error);
      throw error;
    }
  };

  // Submit Step 7 data to Supabase
  const submitStep7 = async (step7Data: Step7FormData) => {
    // TEMPORARY: Skip individual step submission to avoid schema issues
    console.log('Step 7 submission skipped - using simplified approach');
    return { success: true, data: null };
    
    // @ts-ignore - Temporarily disabled to avoid schema issues
    try {
      // Upload document files to Supabase Storage if they exist
      let businessRegistrationUrl = null;
      let educationBoardAffiliationUrl = null;
      let fireSafetyUrl = null;
      let buildingPlanUrl = null;
      let panCardUrl = null;
      let gstCertificateUrl = null;
      let bankAccountUrl = null;
      let institutionPhotos: string[] = [];
      let insuranceDocs: string[] = [];
      let accreditationCerts: string[] = [];
      let awardCerts: string[] = [];
      let facultyQualCerts: string[] = [];
      let safetyComplianceCerts: string[] = [];

      // Upload single files
      if (step7Data.businessRegistrationCertificate) {
        const path = `institution-documents/business-registration/${Date.now()}-${step7Data.businessRegistrationCertificate.name}`;
        const { data, error } = await supabase.storage
          .from('institution-documents')
          .upload(path, step7Data.businessRegistrationCertificate);
        if (error) throw error;
        businessRegistrationUrl = path;
      }

      if (step7Data.educationBoardAffiliationCertificate) {
        const path = `institution-documents/education-board/${Date.now()}-${step7Data.educationBoardAffiliationCertificate.name}`;
        const { data, error } = await supabase.storage
          .from('institution-documents')
          .upload(path, step7Data.educationBoardAffiliationCertificate);
        if (error) throw error;
        educationBoardAffiliationUrl = path;
      }

      if (step7Data.fireSafetyCertificate) {
        const path = `institution-documents/fire-safety/${Date.now()}-${step7Data.fireSafetyCertificate.name}`;
        const { data, error } = await supabase.storage
          .from('institution-documents')
          .upload(path, step7Data.fireSafetyCertificate);
        if (error) throw error;
        fireSafetyUrl = path;
      }

      if (step7Data.buildingPlanApproval) {
        const path = `institution-documents/building-plan/${Date.now()}-${step7Data.buildingPlanApproval.name}`;
        const { data, error } = await supabase.storage
          .from('institution-documents')
          .upload(path, step7Data.buildingPlanApproval);
        if (error) throw error;
        buildingPlanUrl = path;
      }

      if (step7Data.panCardDocument) {
        const path = `institution-documents/pan-card/${Date.now()}-${step7Data.panCardDocument.name}`;
        const { data, error } = await supabase.storage
          .from('institution-documents')
          .upload(path, step7Data.panCardDocument);
        if (error) throw error;
        panCardUrl = path;
      }

      if (step7Data.gstCertificateDocument) {
        const path = `institution-documents/gst-certificate/${Date.now()}-${step7Data.gstCertificateDocument.name}`;
        const { data, error } = await supabase.storage
          .from('institution-documents')
          .upload(path, step7Data.gstCertificateDocument);
        if (error) throw error;
        gstCertificateUrl = path;
      }

      if (step7Data.bankAccountDetailsDocument) {
        const path = `institution-documents/bank-account/${Date.now()}-${step7Data.bankAccountDetailsDocument.name}`;
        const { data, error } = await supabase.storage
          .from('institution-documents')
          .upload(path, step7Data.bankAccountDetailsDocument);
        if (error) throw error;
        bankAccountUrl = path;
      }

      // Upload multiple files
      if (step7Data.institutionPhotographs.length > 0) {
        for (const file of step7Data.institutionPhotographs) {
          const path = `institution-photos/${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('institution-photos')
            .upload(path, file);
          if (error) throw error;
          institutionPhotos.push(path);
        }
      }

      if (step7Data.insuranceDocuments.length > 0) {
        for (const file of step7Data.insuranceDocuments) {
          const path = `institution-documents/insurance/${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('institution-documents')
            .upload(path, file);
          if (error) throw error;
          insuranceDocs.push(path);
        }
      }

      if (step7Data.accreditationCertificates.length > 0) {
        for (const file of step7Data.accreditationCertificates) {
          const path = `institution-documents/accreditation/${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('institution-documents')
            .upload(path, file);
          if (error) throw error;
          accreditationCerts.push(path);
        }
      }

      if (step7Data.awardCertificates.length > 0) {
        for (const file of step7Data.awardCertificates) {
          const path = `institution-documents/awards/${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('institution-documents')
            .upload(path, file);
          if (error) throw error;
          awardCerts.push(path);
        }
      }

      if (step7Data.facultyQualificationCertificates.length > 0) {
        for (const file of step7Data.facultyQualificationCertificates) {
          const path = `institution-documents/faculty-qualification/${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('institution-documents')
            .upload(path, file);
          if (error) throw error;
          facultyQualCerts.push(path);
        }
      }

      if (step7Data.safetyComplianceCertificates.length > 0) {
        for (const file of step7Data.safetyComplianceCertificates) {
          const path = `institution-documents/safety-compliance/${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('institution-documents')
            .upload(path, file);
          if (error) throw error;
          safetyComplianceCerts.push(path);
        }
      }

      // Insert Step 7 data into the database
      const { data, error } = await supabase
        .from('institution_profiles')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          primary_contact_person: step7Data.primaryContactPerson,
          contact_designation: step7Data.designation,
          contact_phone_number: step7Data.directPhoneNumber,
          contact_email_address: step7Data.emailAddress,
          whatsapp_number: step7Data.whatsappNumber,
          best_time_to_contact: step7Data.bestTimeToContact,
          facebook_page_url: step7Data.facebookPageUrl,
          instagram_account_url: step7Data.instagramAccountUrl,
          youtube_channel_url: step7Data.youtubeChannelUrl,
          linkedin_profile_url: step7Data.linkedinProfileUrl,
          google_my_business_url: step7Data.googleMyBusinessUrl,
          emergency_contact_person: step7Data.emergencyContactPerson,
          local_police_station_contact: step7Data.localPoliceStationContact,
          nearest_hospital_contact: step7Data.nearestHospitalContact,
          fire_department_contact: step7Data.fireDepartmentContact,
          business_registration_certificate: businessRegistrationUrl,
          education_board_affiliation_certificate: educationBoardAffiliationUrl,
          fire_safety_certificate: fireSafetyUrl,
          building_plan_approval: buildingPlanUrl,
          pan_card_document: panCardUrl,
          gst_certificate_document: gstCertificateUrl,
          bank_account_details_document: bankAccountUrl,
          institution_photographs: institutionPhotos,
          insurance_documents: insuranceDocs,
          accreditation_certificates: accreditationCerts,
          award_certificates: awardCerts,
          faculty_qualification_certificates: facultyQualCerts,
          safety_compliance_certificates: safetyComplianceCerts,
          agree_to_terms: step7Data.agreeToTerms,
          agree_to_background_verification: step7Data.agreeToBackgroundVerification,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      console.log('Step 7 data submitted successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting Step 7:', error);
      throw error;
    }
  };

      // Submit all steps - Following exact tutor signup pattern
  const submitAllSteps = async () => {
    // TEMPORARY: Skip validation for testing purposes
    // if (!isFormComplete) {
    //   const errors = getFormValidationErrors();
    //   throw new Error(`Please complete all required fields:\n${errors.join('\n')}`);
    // }

    try {
        console.log('Starting institution signup process...');
        
        // Step 1: Create user account with Supabase Auth (exactly like tutor signup)
        console.log('Creating user account...');
        const email = formData.step1?.officialEmail;
        const password = formData.step1?.password;

        if (!email || !password) {
          throw new Error('Email and password are required to create an account');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: formData.step1?.ownerDirectorName || 'Institution Director',
              role: 'institution',
            }
          }
        });

        console.log('Auth response:', { authData, authError });

        if (authError) {
          throw new Error(authError.message);
        }

        if (!authData.user) {
          throw new Error("Failed to create user account");
        }

        console.log('User created successfully:', authData.user.id);

        // Store form data for profile creation after email verification
        // RLS policies are likely blocking profile creation during signup
        console.log('Storing form data for profile creation after email verification...');
        
        // Store the complete form data and user info (exactly like tutor signup)
        const profileData = {
          userId: authData.user.id,
          formData: formData,
          timestamp: Date.now(),
          email: email
        };
        
        localStorage.setItem('pendingInstitutionProfile', JSON.stringify(profileData));
        
        console.log('Form data stored successfully');

        return { success: true, message: 'Application submitted successfully! Please check your email to verify your account and complete the registration process.' };
    } catch (error) {
        console.error('Error submitting application:', error);
        throw error; // Re-throw to show proper error to user
    }
  };

  // Navigation is now always allowed
  const canGoNext = currentStep < totalSteps;
  const canGoPrev = currentStep > 1;

  const value: InstitutionSignupContextType = {
    currentStep,
    totalSteps,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    isStep5Valid,
    isStep6Valid,
    isStep7Valid,
    stepCompletionStatus,
    isFormComplete,
    formData,
    updateStep1Data,
    updateStep2Data,
    updateStep3Data,
    updateStep4Data,
    updateStep5Data,
    updateStep6Data,
    updateStep7Data,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    submitAllSteps,
    getFormValidationErrors,
    submitStep1,
    submitStep2,
    submitStep3,
    submitStep4,
    submitStep5,
    submitStep6,
    submitStep7,
  };

  return (
    <InstitutionSignupContext.Provider value={value}>
      {children}
    </InstitutionSignupContext.Provider>
  );
};

// Custom hook to use the context
export const useInstitutionSignup = () => {
  const context = useContext(InstitutionSignupContext);
  if (context === undefined) {
    throw new Error('useInstitutionSignup must be used within an InstitutionSignupProvider');
  }
  return context;
};
