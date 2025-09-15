import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext';
import { toast } from 'sonner';
import SuccessPopup from '@/components/SuccessPopup';

export default function Step7() {
  const { formData, updateStep7Data, submitAllSteps, isFormComplete } = useInstitutionSignup();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Local state for form fields (synced with context)
  const [primaryContactPerson, setPrimaryContactPerson] = useState(formData.step7.primaryContactPerson);
  const [designation, setDesignation] = useState(formData.step7.designation);
  const [directPhoneNumber, setDirectPhoneNumber] = useState(formData.step7.directPhoneNumber);
  const [emailAddress, setEmailAddress] = useState(formData.step7.emailAddress);
  const [whatsappNumber, setWhatsappNumber] = useState(formData.step7.whatsappNumber);
  const [bestTimeToContact, setBestTimeToContact] = useState(formData.step7.bestTimeToContact);
  const [facebookPageUrl, setFacebookPageUrl] = useState(formData.step7.facebookPageUrl);
  const [instagramAccountUrl, setInstagramAccountUrl] = useState(formData.step7.instagramAccountUrl);
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState(formData.step7.youtubeChannelUrl);
  const [linkedinProfileUrl, setLinkedinProfileUrl] = useState(formData.step7.linkedinProfileUrl);
  const [googleMyBusinessUrl, setGoogleMyBusinessUrl] = useState(formData.step7.googleMyBusinessUrl);
  const [emergencyContactPerson, setEmergencyContactPerson] = useState(formData.step7.emergencyContactPerson);
  const [localPoliceStationContact, setLocalPoliceStationContact] = useState(formData.step7.localPoliceStationContact);
  const [nearestHospitalContact, setNearestHospitalContact] = useState(formData.step7.nearestHospitalContact);
  const [fireDepartmentContact, setFireDepartmentContact] = useState(formData.step7.fireDepartmentContact);
  const [businessRegistrationCertificate, setBusinessRegistrationCertificate] = useState<File | null>(formData.step7.businessRegistrationCertificate);
  const [educationBoardAffiliationCertificate, setEducationBoardAffiliationCertificate] = useState<File | null>(formData.step7.educationBoardAffiliationCertificate);
  const [fireSafetyCertificate, setFireSafetyCertificate] = useState<File | null>(formData.step7.fireSafetyCertificate);
  const [buildingPlanApproval, setBuildingPlanApproval] = useState<File | null>(formData.step7.buildingPlanApproval);
  const [panCardDocument, setPanCardDocument] = useState<File | null>(formData.step7.panCardDocument);
  const [gstCertificateDocument, setGstCertificateDocument] = useState<File | null>(formData.step7.gstCertificateDocument);
  const [bankAccountDetailsDocument, setBankAccountDetailsDocument] = useState<File | null>(formData.step7.bankAccountDetailsDocument);
  const [institutionPhotographs, setInstitutionPhotographs] = useState<File[]>(formData.step7.institutionPhotographs);
  const [insuranceDocuments, setInsuranceDocuments] = useState<File[]>(formData.step7.insuranceDocuments);
  const [accreditationCertificates, setAccreditationCertificates] = useState<File[]>(formData.step7.accreditationCertificates);
  const [awardCertificates, setAwardCertificates] = useState<File[]>(formData.step7.awardCertificates);
  const [facultyQualificationCertificates, setFacultyQualificationCertificates] = useState<File[]>(formData.step7.facultyQualificationCertificates);
  const [safetyComplianceCertificates, setSafetyComplianceCertificates] = useState<File[]>(formData.step7.safetyComplianceCertificates);
  const [agreeToTerms, setAgreeToTerms] = useState(formData.step7.agreeToTerms);
  const [agreeToBackgroundVerification, setAgreeToBackgroundVerification] = useState(formData.step7.agreeToBackgroundVerification);

  // No complex syncing - form works as regular form

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Update the context with current form data before submission
      updateStep7Data({
        primaryContactPerson,
        designation,
        directPhoneNumber,
        emailAddress,
        whatsappNumber,
        bestTimeToContact,
        facebookPageUrl,
        instagramAccountUrl,
        youtubeChannelUrl,
        linkedinProfileUrl,
        googleMyBusinessUrl,
        emergencyContactPerson,
        localPoliceStationContact,
        nearestHospitalContact,
        fireDepartmentContact,
        businessRegistrationCertificate,
        educationBoardAffiliationCertificate,
        fireSafetyCertificate,
        buildingPlanApproval,
        panCardDocument,
        gstCertificateDocument,
        bankAccountDetailsDocument,
        institutionPhotographs,
        insuranceDocuments,
        accreditationCertificates,
        awardCertificates,
        facultyQualificationCertificates,
        safetyComplianceCertificates,
        agreeToTerms,
        agreeToBackgroundVerification,
      });

      const result = await submitAllSteps();
      if (result.success) {
        // Show success popup instead of toast
        setShowSuccessPopup(true);
      } else {
        toast.error(result.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    setShowSuccessPopup(false);
    window.location.href = '/login';
  };

  // File handling functions
  const handleFileChange = (setter: (file: File | null) => void, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setter(file);
  };

  const handleMultipleFileChange = (setter: (files: File[]) => void, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setter(files);
  };

  const removeFile = (setter: (file: File | null) => void) => {
    setter(null);
  };

  const removeMultipleFile = (setter: React.Dispatch<React.SetStateAction<File[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contact & Verification
          </h1>
          <p className="text-gray-600">
            Complete your institution registration with contact verification and final submission
          </p>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Section Title */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Contact Information
              </h2>
            </div>

            {/* Primary Contact Person Field */}
            <div className="space-y-2">
              <Label htmlFor="primaryContactPerson" className="text-sm font-medium text-gray-700">
                Primary Contact Person <span className="text-red-500">*</span>
              </Label>
              <Input
                id="primaryContactPerson"
                type="text"
                placeholder="Enter the name of the primary contact person"
                value={primaryContactPerson}
                onChange={(e) => setPrimaryContactPerson(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Designation Field */}
            <div className="space-y-2">
              <Label htmlFor="designation" className="text-sm font-medium text-gray-700">
                Designation <span className="text-red-500">*</span>
              </Label>
              <Select value={designation} onValueChange={setDesignation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Direct Phone Number Field */}
            <div className="space-y-2">
              <Label htmlFor="directPhoneNumber" className="text-sm font-medium text-gray-700">
                Direct Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="directPhoneNumber"
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={directPhoneNumber}
                onChange={(e) => setDirectPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Enter a 10-digit phone number</p>
            </div>

            {/* Email Address Field */}
            <div className="space-y-2">
              <Label htmlFor="emailAddress" className="text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emailAddress"
                type="email"
                placeholder="Enter contact email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Must be different from institution email</p>
            </div>

            {/* WhatsApp Number Field */}
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-sm font-medium text-gray-700">
                WhatsApp Number
              </Label>
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="Enter 10-digit WhatsApp number"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Enter a 10-digit WhatsApp number</p>
            </div>

            {/* Best Time to Contact Field */}
            <div className="space-y-2">
              <Label htmlFor="bestTimeToContact" className="text-sm font-medium text-gray-700">
                Best Time to Contact <span className="text-red-500">*</span>
              </Label>
              <Select value={bestTimeToContact} onValueChange={setBestTimeToContact}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select best time to contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9:00 AM - 12:00 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12:00 PM - 3:00 PM)</SelectItem>
                  <SelectItem value="evening">Evening (3:00 PM - 6:00 PM)</SelectItem>
                  <SelectItem value="late-evening">Late Evening (6:00 PM - 9:00 PM)</SelectItem>
                  <SelectItem value="weekend">Weekend (Any time)</SelectItem>
                  <SelectItem value="flexible">Flexible (Any time)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Social Media & Online Presence Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Section Title */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Social Media & Online Presence
              </h2>
            </div>

            {/* Facebook Page Field */}
            <div className="space-y-2">
              <Label htmlFor="facebookPageUrl" className="text-sm font-medium text-gray-700">
                Facebook Page (URL)
              </Label>
              <Input
                id="facebookPageUrl"
                type="url"
                placeholder="Enter Facebook page URL"
                value={facebookPageUrl}
                onChange={(e) => setFacebookPageUrl(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Instagram Account Field */}
            <div className="space-y-2">
              <Label htmlFor="instagramAccountUrl" className="text-sm font-medium text-gray-700">
                Instagram Account (URL)
              </Label>
              <Input
                id="instagramAccountUrl"
                type="url"
                placeholder="Enter Instagram account URL"
                value={instagramAccountUrl}
                onChange={(e) => setInstagramAccountUrl(e.target.value)}
                className="w-full"
              />
            </div>

            {/* YouTube Channel Field */}
            <div className="space-y-2">
              <Label htmlFor="youtubeChannelUrl" className="text-sm font-medium text-gray-700">
                YouTube Channel (URL)
              </Label>
              <Input
                id="youtubeChannelUrl"
                type="url"
                placeholder="Enter YouTube channel URL"
                value={youtubeChannelUrl}
                onChange={(e) => setYoutubeChannelUrl(e.target.value)}
                className="w-full"
              />
            </div>

            {/* LinkedIn Profile Field */}
            <div className="space-y-2">
              <Label htmlFor="linkedinProfileUrl" className="text-sm font-medium text-gray-700">
                LinkedIn Profile (URL)
              </Label>
              <Input
                id="linkedinProfileUrl"
                type="url"
                placeholder="Enter LinkedIn profile URL"
                value={linkedinProfileUrl}
                onChange={(e) => setLinkedinProfileUrl(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Google My Business Field */}
            <div className="space-y-2">
              <Label htmlFor="googleMyBusinessUrl" className="text-sm font-medium text-gray-700">
                Google My Business (URL)
              </Label>
              <Input
                id="googleMyBusinessUrl"
                type="url"
                placeholder="Enter Google My Business URL"
                value={googleMyBusinessUrl}
                onChange={(e) => setGoogleMyBusinessUrl(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contacts Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Section Title */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Emergency Contacts
              </h2>
            </div>

            {/* Emergency Contact Person Field */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPerson" className="text-sm font-medium text-gray-700">
                Emergency Contact Person <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emergencyContactPerson"
                type="text"
                placeholder="Enter emergency contact person name and phone"
                value={emergencyContactPerson}
                onChange={(e) => setEmergencyContactPerson(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Enter name and phone number (e.g., John Doe - 9876543210)</p>
            </div>

            {/* Local Police Station Contact Field */}
            <div className="space-y-2">
              <Label htmlFor="localPoliceStationContact" className="text-sm font-medium text-gray-700">
                Local Police Station Contact
              </Label>
              <Input
                id="localPoliceStationContact"
                type="text"
                placeholder="Enter police station name and contact number"
                value={localPoliceStationContact}
                onChange={(e) => setLocalPoliceStationContact(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Enter police station name and phone number</p>
            </div>

            {/* Nearest Hospital Contact Field */}
            <div className="space-y-2">
              <Label htmlFor="nearestHospitalContact" className="text-sm font-medium text-gray-700">
                Nearest Hospital Contact
              </Label>
              <Input
                id="nearestHospitalContact"
                type="text"
                placeholder="Enter hospital name and contact number"
                value={nearestHospitalContact}
                onChange={(e) => setNearestHospitalContact(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Enter hospital name and phone number</p>
            </div>

            {/* Fire Department Contact Field */}
            <div className="space-y-2">
              <Label htmlFor="fireDepartmentContact" className="text-sm font-medium text-gray-700">
                Fire Department Contact
              </Label>
              <Input
                id="fireDepartmentContact"
                type="text"
                placeholder="Enter fire department name and contact number"
                value={fireDepartmentContact}
                onChange={(e) => setFireDepartmentContact(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Enter fire department name and phone number</p>
            </div>
          </div>
        </div>

        {/* Document Verification Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Section Title */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Document Verification
              </h2>
            </div>

            {/* Business Registration Certificate Field */}
            <div className="space-y-2">
              <Label htmlFor="businessRegistrationCertificate" className="text-sm font-medium text-gray-700">
                Business Registration Certificate <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessRegistrationCertificate"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(setBusinessRegistrationCertificate, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload PDF format only</p>
              {businessRegistrationCertificate && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{businessRegistrationCertificate.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(setBusinessRegistrationCertificate)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Education Board Affiliation Certificate Field */}
            <div className="space-y-2">
              <Label htmlFor="educationBoardAffiliationCertificate" className="text-sm font-medium text-gray-700">
                Education Board Affiliation Certificate <span className="text-red-500">*</span>
              </Label>
              <Input
                id="educationBoardAffiliationCertificate"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(setEducationBoardAffiliationCertificate, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload PDF format only</p>
              {educationBoardAffiliationCertificate && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{educationBoardAffiliationCertificate.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(setEducationBoardAffiliationCertificate)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Fire Safety Certificate Field */}
            <div className="space-y-2">
              <Label htmlFor="fireSafetyCertificate" className="text-sm font-medium text-gray-700">
                Fire Safety Certificate <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fireSafetyCertificate"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(setFireSafetyCertificate, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload PDF format only</p>
              {fireSafetyCertificate && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{fireSafetyCertificate.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(setFireSafetyCertificate)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Building Plan Approval Field */}
            <div className="space-y-2">
              <Label htmlFor="buildingPlanApproval" className="text-sm font-medium text-gray-700">
                Building Plan Approval <span className="text-red-500">*</span>
              </Label>
              <Input
                id="buildingPlanApproval"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(setBuildingPlanApproval, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload PDF format only</p>
              {buildingPlanApproval && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{buildingPlanApproval.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(setBuildingPlanApproval)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* PAN Card Field */}
            <div className="space-y-2">
              <Label htmlFor="panCardDocument" className="text-sm font-medium text-gray-700">
                PAN Card <span className="text-red-500">*</span>
              </Label>
              <Input
                id="panCardDocument"
                type="file"
                accept=".pdf,.jpg,.jpeg"
                onChange={(e) => handleFileChange(setPanCardDocument, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload PDF or JPG format</p>
              {panCardDocument && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{panCardDocument.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(setPanCardDocument)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* GST Certificate Field */}
            <div className="space-y-2">
              <Label htmlFor="gstCertificateDocument" className="text-sm font-medium text-gray-700">
                GST Certificate (PDF, if applicable)
              </Label>
              <Input
                id="gstCertificateDocument"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(setGstCertificateDocument, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload PDF format if applicable</p>
              {gstCertificateDocument && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{gstCertificateDocument.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(setGstCertificateDocument)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Bank Account Details Field */}
            <div className="space-y-2">
              <Label htmlFor="bankAccountDetailsDocument" className="text-sm font-medium text-gray-700">
                Bank Account Details <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bankAccountDetailsDocument"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(setBankAccountDetailsDocument, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload cancelled cheque or bank statement (PDF, JPG, PNG)</p>
              {bankAccountDetailsDocument && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{bankAccountDetailsDocument.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(setBankAccountDetailsDocument)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Photographs of Institution Field */}
            <div className="space-y-2">
              <Label htmlFor="institutionPhotographs" className="text-sm font-medium text-gray-700">
                Photographs of Institution <span className="text-red-500">*</span>
              </Label>
              <Input
                id="institutionPhotographs"
                type="file"
                accept=".jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleMultipleFileChange(setInstitutionPhotographs, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload minimum 5 photos of your institution (JPG, PNG)</p>
              {institutionPhotographs.length > 0 && (
                <div className="space-y-2">
                  {institutionPhotographs.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMultipleFile(setInstitutionPhotographs, index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Insurance Documents Field */}
            <div className="space-y-2">
              <Label htmlFor="insuranceDocuments" className="text-sm font-medium text-gray-700">
                Insurance Documents
              </Label>
              <Input
                id="insuranceDocuments"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleMultipleFileChange(setInsuranceDocuments, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload insurance documents if applicable (PDF, JPG, PNG)</p>
              {insuranceDocuments.length > 0 && (
                <div className="space-y-2">
                  {insuranceDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMultipleFile(setInsuranceDocuments, index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accreditation Certificates Field */}
            <div className="space-y-2">
              <Label htmlFor="accreditationCertificates" className="text-sm font-medium text-gray-700">
                Accreditation Certificates
              </Label>
              <Input
                id="accreditationCertificates"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleMultipleFileChange(setAccreditationCertificates, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload accreditation certificates if applicable (PDF, JPG, PNG)</p>
              {accreditationCertificates.length > 0 && (
                <div className="space-y-2">
                  {accreditationCertificates.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMultipleFile(setAccreditationCertificates, index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Award Certificates Field */}
            <div className="space-y-2">
              <Label htmlFor="awardCertificates" className="text-sm font-medium text-gray-700">
                Award Certificates
              </Label>
              <Input
                id="awardCertificates"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleMultipleFileChange(setAwardCertificates, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload award certificates if applicable (PDF, JPG, PNG)</p>
              {awardCertificates.length > 0 && (
                <div className="space-y-2">
                  {awardCertificates.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMultipleFile(setAwardCertificates, index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Faculty Qualification Certificates Field */}
            <div className="space-y-2">
              <Label htmlFor="facultyQualificationCertificates" className="text-sm font-medium text-gray-700">
                Faculty Qualification Certificates
              </Label>
              <Input
                id="facultyQualificationCertificates"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleMultipleFileChange(setFacultyQualificationCertificates, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload faculty qualification certificates if applicable (PDF, JPG, PNG)</p>
              {facultyQualificationCertificates.length > 0 && (
                <div className="space-y-2">
                  {facultyQualificationCertificates.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMultipleFile(setFacultyQualificationCertificates, index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Safety Compliance Certificates Field */}
            <div className="space-y-2">
              <Label htmlFor="safetyComplianceCertificates" className="text-sm font-medium text-gray-700">
                Safety Compliance Certificates
              </Label>
              <Input
                id="safetyComplianceCertificates"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleMultipleFileChange(setSafetyComplianceCertificates, e)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Upload safety compliance certificates if applicable (PDF, JPG, PNG)</p>
              {safetyComplianceCertificates.length > 0 && (
                <div className="space-y-2">
                  {safetyComplianceCertificates.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMultipleFile(setSafetyComplianceCertificates, index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legal Agreements Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Section Title */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Legal Agreements
            </h2>
          </div>

          {/* Terms & Conditions Agreement Field */}
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="agree-terms" className="text-sm font-medium leading-relaxed">
                  I agree to the <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By checking this box, I acknowledge that I have read, understood, and agree to comply with all the terms and conditions, privacy policy, and user agreement of this platform.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                      onClick={() => window.open('/terms', '_blank')}
                    >
                      Terms & Conditions
                    </button>
                    <span className="text-muted-foreground">•</span>
                    <button
                      type="button"
                      className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                      onClick={() => window.open('/privacy', '_blank')}
                    >
                      Privacy Policy
                    </button>
                    <span className="text-muted-foreground">•</span>
                    <button
                      type="button"
                      className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                      onClick={() => window.open('/user-agreement', '_blank')}
                    >
                      User Agreement
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    I understand that failure to comply with these terms may result in account suspension or termination.
                  </p>
                </div>
              </div>
            </div>
            {!agreeToTerms && (
              <p className="text-xs text-amber-600 ml-7">
                You must agree to the terms and conditions to proceed
              </p>
            )}
          </div>

          {/* Background Verification Agreement Field */}
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="agree-background-verification"
                  type="checkbox"
                  checked={agreeToBackgroundVerification}
                  onChange={(e) => setAgreeToBackgroundVerification(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="agree-background-verification" className="text-sm font-medium leading-relaxed">
                  I agree to background verification <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    I consent to and authorize the platform to conduct comprehensive background verification including but not limited to educational credentials, professional qualifications, legal compliance, and business legitimacy verification.
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Verification may include document authenticity checks</p>
                    <p>• Business registration and license verification</p>
                    <p>• Compliance with educational regulations</p>
                    <p>• Professional standing and reputation checks</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    I understand that this verification is mandatory for platform access and failure to provide accurate information may result in account suspension.
                  </p>
                </div>
              </div>
            </div>
            {!agreeToBackgroundVerification && (
              <p className="text-xs text-amber-600 ml-7">
                You must agree to background verification to proceed
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Final Submit Button */}
      <div className="mt-8 text-center">
        <Button onClick={handleFinalSubmit} className="w-full max-w-md" disabled={isSubmitting || !isFormComplete}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Final Submit
            </>
          )}
        </Button>
        {!isFormComplete && (
          <p className="mt-2 text-sm text-amber-600">
            Please complete all required fields in previous steps to submit your application.
          </p>
        )}
      </div>

      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        onButtonClick={handleGoToLogin}
        title="Application Submitted Successfully!"
        message="Your institution application has been submitted and is now under review. Our team will contact you within 2-3 business days. You can now log in to track your application status."
        buttonText="Go to Login"
      />
    </div>
  );
}
