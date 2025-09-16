import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext';
import { toast } from 'sonner';

export default function Step1() {
  const { 
    formData, 
    updateStep1Data, 
    isStep1Valid
  } = useInstitutionSignup();

  // Local state for form fields
  const [institutionName, setInstitutionName] = useState(formData.step1.institutionName);
  const [institutionType, setInstitutionType] = useState(formData.step1.institutionType);
  const [otherInstitutionType, setOtherInstitutionType] = useState(formData.step1.otherInstitutionType);
  const [establishmentYear, setEstablishmentYear] = useState(formData.step1.establishmentYear);
  const [registrationNumber, setRegistrationNumber] = useState(formData.step1.registrationNumber);
  const [panNumber, setPanNumber] = useState(formData.step1.panNumber);
  const [gstNumber, setGstNumber] = useState(formData.step1.gstNumber);
  const [officialEmail, setOfficialEmail] = useState(formData.step1.officialEmail);
  const [password, setPassword] = useState(formData.step1.password);
  const [primaryContact, setPrimaryContact] = useState(formData.step1.primaryContact);
  const [secondaryContact, setSecondaryContact] = useState(formData.step1.secondaryContact);
  const [websiteUrl, setWebsiteUrl] = useState(formData.step1.websiteUrl);
  const [completeAddress, setCompleteAddress] = useState(formData.step1.completeAddress);
  const [city, setCity] = useState(formData.step1.city);
  const [citySearch, setCitySearch] = useState('');
  const [state, setState] = useState(formData.step1.state);
  const [pinCode, setPinCode] = useState(formData.step1.pinCode);
  const [landmark, setLandmark] = useState(formData.step1.landmark);
  const [mapLocation, setMapLocation] = useState(formData.step1.mapLocation);
  const [ownerDirectorName, setOwnerDirectorName] = useState(formData.step1.ownerDirectorName);
  const [ownerContactNumber, setOwnerContactNumber] = useState(formData.step1.ownerContactNumber);
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(formData.step1.businessLicenseFile);
  const [registrationCertificateFile, setRegistrationCertificateFile] = useState<File | null>(formData.step1.registrationCertificateFile);

  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [isEmailValidating, setIsEmailValidating] = useState(false);
  const [emailValidationResult, setEmailValidationResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [emailValidationMessage, setEmailValidationMessage] = useState('');
  const [isContactValidating, setIsContactValidating] = useState(false);
  const [contactValidationResult, setContactValidationResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [contactValidationMessage, setContactValidationMessage] = useState('');
  const [isPanValidating, setIsPanValidating] = useState(false);
  const [panValidationResult, setPanValidationResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [panValidationMessage, setPanValidationMessage] = useState('');
  const [isGstValidating, setIsGstValidating] = useState(false);
  const [gstValidationResult, setGstValidationResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [gstValidationMessage, setGstValidationMessage] = useState('');
  const [isRegistrationValidating, setIsRegistrationValidating] = useState(false);
  const [registrationValidationResult, setRegistrationValidationResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [registrationValidationMessage, setRegistrationValidationMessage] = useState('');

  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  
  // Ref to prevent infinite re-render loops
  const isSyncingRef = useRef(false);

  // Load saved data from context on component mount only
  useEffect(() => {
    // Only sync on initial load, not on every field change
    if (formData.step1 && !isSyncingRef.current) {
      isSyncingRef.current = true;
      const step1Data = formData.step1;
      
      // Always sync all fields, even if they're empty strings
      setInstitutionName(step1Data.institutionName || '');
      setInstitutionType(step1Data.institutionType || '');
      setOtherInstitutionType(step1Data.otherInstitutionType || '');
      setEstablishmentYear(step1Data.establishmentYear || '');
      setRegistrationNumber(step1Data.registrationNumber || '');
      setPanNumber(step1Data.panNumber || '');
      setGstNumber(step1Data.gstNumber || '');
      setOfficialEmail(step1Data.officialEmail || '');
      setPassword(step1Data.password || '');
      setPrimaryContact(step1Data.primaryContact || '');
      setSecondaryContact(step1Data.secondaryContact || '');
      setWebsiteUrl(step1Data.websiteUrl || '');
      setCompleteAddress(step1Data.completeAddress || '');
      setCity(step1Data.city || '');
      setState(step1Data.state || '');
      setPinCode(step1Data.pinCode || '');
      setLandmark(step1Data.landmark || '');
      setMapLocation(step1Data.mapLocation || '');
      setOwnerDirectorName(step1Data.ownerDirectorName || '');
      setOwnerContactNumber(step1Data.ownerContactNumber || '');
      setBusinessLicenseFile(step1Data.businessLicenseFile || null);
      setRegistrationCertificateFile(step1Data.registrationCertificateFile || null);
      
      console.log('Step 1 data synced from context:', step1Data);
      
      // Reset the flag after a short delay to allow for initial sync
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    }
  }, []); // Empty dependency array - only run on mount

  // Generate years from 1950 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  const institutionTypes = [
    'Coaching Institute',
    'Training Center',
    'Language Institute',
    'Music Academy',
    'Dance School',
    'Sports Academy',
    'Computer Training Center',
    'Professional Institute',
    'Arts & Crafts Center',
    'Other'
  ];

  // Major Indian cities for autocomplete (removed duplicates)
  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Vijayawada',
    'Kolhapur', 'Jabalpur', 'Gwalior', 'Bhiwandi', 'Amravati', 'Nanded', 'Sangli',
    'Bhubaneswar', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Bhavnagar',
    'Warangal', 'Tiruchirappalli', 'Mira-Bhayandar', 'Bikaner', 'Amritsar', 'Noida',
    'Jodhpur', 'Ranchi', 'Howrah', 'Coimbatore', 'Raipur', 'Kota', 'Durgapur',
    'Ajmer', 'Bhilwara', 'Madurai', 'Tiruppur', 'Gurgaon', 'Moradabad', 'Aligarh',
    'Jalandhar', 'Tirunelveli', 'Rajahmundry', 'Salem', 'Guntur', 'Ujjain', 'Loni',
    'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Mangalore', 'Erode', 'Belgaum',
    'Ambattur', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala'
  ];

  // Filter cities based on search input
  const filteredCities = cities.filter(cityName =>
    cityName.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Indian states and union territories
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    // Union Territories
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Automatic validation removed - no more "already exists" warnings while typing
  // Validation will only occur when explicitly triggered (e.g., on form submission)

  // Sync local state with context whenever form data changes
  useEffect(() => {
    // Only update context if we're not in the middle of syncing from context
    if (!isSyncingRef.current) {
      updateStep1Data({
        institutionName,
        institutionType,
        otherInstitutionType,
        establishmentYear,
        registrationNumber,
        panNumber,
        gstNumber,
        officialEmail,
        password,
        primaryContact,
        secondaryContact,
        websiteUrl,
        completeAddress,
        city,
        state,
        pinCode,
        landmark,
        mapLocation,
        ownerDirectorName,
        ownerContactNumber,
        businessLicenseFile,
        registrationCertificateFile,
      });
    }
  }, [
    institutionName, institutionType, otherInstitutionType, establishmentYear,
    registrationNumber, panNumber, gstNumber, officialEmail, password, primaryContact,
    secondaryContact, websiteUrl, completeAddress, city, state, pinCode,
    landmark, mapLocation, ownerDirectorName, ownerContactNumber,
    businessLicenseFile, registrationCertificateFile
    // Removed updateStep1Data from dependencies to prevent infinite loop
  ]);

  const validateInstitutionName = async (name: string) => {
    if (name.trim().length < 3) return;
    
    setIsValidating(true);
    setValidationResult('idle');
    
    try {
      // Simulate API call for unique validation
      // In real implementation, this would check against your database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation logic - replace with actual API call
      const isUnique = Math.random() > 0.3; // Simulate 70% chance of being unique
      
      if (isUnique) {
        setValidationResult('valid');
        setValidationMessage('Institution name is available');
      } else {
        setValidationResult('invalid');
        setValidationMessage('Institution name already exists');
      }
    } catch (error) {
      setValidationResult('invalid');
      setValidationMessage('Error validating institution name');
    } finally {
      setIsValidating(false);
    }
  };

  // Validation icon functions - now show nothing since automatic validation is disabled
  const getValidationIcon = () => {
    return null;
  };

  const getInputBorderColor = () => {
    if (validationResult === 'valid') return 'border-green-500';
    if (validationResult === 'invalid') return 'border-red-500';
    return 'border-input';
  };

  const getEmailBorderColor = () => {
    if (emailValidationResult === 'valid') return 'border-green-500';
    if (emailValidationResult === 'invalid') return 'border-red-500';
    return 'border-input';
  };

  const isValidEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmail = async (email: string) => {
    if (!email.trim() || !isValidEmailFormat(email)) return;
    
    setIsEmailValidating(true);
    setEmailValidationResult('idle');
    
    try {
      // Simulate API call for unique email validation
      // In real implementation, this would check against your database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation logic - replace with actual API call
      const isUnique = Math.random() > 0.3; // Simulate 70% chance of being unique
      
      if (isUnique) {
        setEmailValidationResult('valid');
        setEmailValidationMessage('Email is available');
      } else {
        setEmailValidationResult('invalid');
        setEmailValidationMessage('Email already registered');
      }
    } catch (error) {
      setEmailValidationResult('invalid');
      setEmailValidationMessage('Error validating email');
    } finally {
      setIsEmailValidating(false);
    }
  };

  // Validation icon functions - now show nothing since automatic validation is disabled
  const getEmailValidationIcon = () => {
    return null;
  };

  const getContactBorderColor = () => {
    if (contactValidationResult === 'valid') return 'border-green-500';
    if (contactValidationResult === 'invalid') return 'border-red-500';
    return 'border-input';
  };

  const isValidContactFormat = (contact: string) => {
    const contactRegex = /^\d{10}$/;
    return contactRegex.test(contact);
  };

  const validateContact = async (contact: string) => {
    if (!contact.trim() || !isValidContactFormat(contact)) return;
    
    setIsContactValidating(true);
    setContactValidationResult('idle');
    
    try {
      // Simulate API call for unique contact validation
      // In real implementation, this would check against your database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation logic - replace with actual API call
      const isUnique = Math.random() > 0.3; // Simulate 70% chance of being unique
      
      if (isUnique) {
        setContactValidationResult('valid');
        setContactValidationMessage('Contact number is available');
      } else {
        setContactValidationResult('invalid');
        setContactValidationMessage('Contact number already registered');
      }
    } catch (error) {
      setContactValidationResult('invalid');
      setContactValidationMessage('Error validating contact number');
    } finally {
      setIsContactValidating(false);
    }
  };

  // Validation icon functions - now show nothing since automatic validation is disabled
  const getContactValidationIcon = () => {
    return null;
  };

  const isValidUrlFormat = (url: string) => {
    if (!url.trim()) return true; // Empty is valid for optional field
    
    try {
      // Basic URL validation - allows http, https, and www formats
      const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/.*)?$/;
      return urlPattern.test(url);
    } catch {
      return false;
    }
  };

  // PAN Number validation - Format: ABCDE1234F (5 letters + 4 digits + 1 letter)
  const isValidPanFormat = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validatePanNumber = async (pan: string) => {
    if (!pan.trim() || !isValidPanFormat(pan)) return;
    
    setIsPanValidating(true);
    setPanValidationResult('idle');
    
    try {
      // Simulate API call for PAN validation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock validation logic - replace with actual API call
      const isValid = Math.random() > 0.2; // Simulate 80% chance of being valid
      
      if (isValid) {
        setPanValidationResult('valid');
        setPanValidationMessage('PAN number format is valid');
      } else {
        setPanValidationResult('invalid');
        setPanValidationMessage('Invalid PAN number format');
      }
    } catch (error) {
      setPanValidationResult('invalid');
      setPanValidationMessage('Error validating PAN number');
    } finally {
      setIsPanValidating(false);
    }
  };

  // Validation icon functions - now show nothing since automatic validation is disabled
  const getPanValidationIcon = () => {
    return null;
  };

  const getPanBorderColor = () => {
    if (panValidationResult === 'valid') return 'border-green-500';
    if (panValidationResult === 'invalid') return 'border-red-500';
    return 'border-input';
  };

  // GST Number validation - 15 characters format
  const isValidGstFormat = (gst: string) => {
    if (!gst.trim()) return true; // Empty is valid for optional field
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const validateGstNumber = async (gst: string) => {
    if (!gst.trim() || !isValidGstFormat(gst)) return;
    
    setIsGstValidating(true);
    setGstValidationResult('idle');
    
    try {
      // Simulate API call for GST validation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock validation logic - replace with actual API call
      const isValid = Math.random() > 0.2; // Simulate 80% chance of being valid
      
      if (isValid) {
        setGstValidationResult('valid');
        setGstValidationMessage('GST number format is valid');
      } else {
        setGstValidationResult('invalid');
        setGstValidationMessage('Invalid GST number format');
      }
    } catch (error) {
      setGstValidationResult('invalid');
      setGstValidationMessage('Error validating GST number');
    } finally {
      setIsGstValidating(false);
    }
  };

  // Validation icon functions - now show nothing since automatic validation is disabled
  const getGstValidationIcon = () => {
    return null;
  };

  const getGstBorderColor = () => {
    if (gstValidationResult === 'valid') return 'border-green-500';
    if (gstValidationResult === 'invalid') return 'border-red-500';
    return 'border-input';
  };

  // Registration Number validation - Unique in DB
  const validateRegistrationNumber = async (regNumber: string) => {
    if (!regNumber.trim() || regNumber.trim().length < 5) return;
    
    setIsRegistrationValidating(true);
    setRegistrationValidationResult('idle');
    
    try {
      // Simulate API call for unique registration number validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation logic - replace with actual API call
      const isUnique = Math.random() > 0.3; // Simulate 70% chance of being unique
      
      if (isUnique) {
        setRegistrationValidationResult('valid');
        setRegistrationValidationMessage('Registration number is available');
      } else {
        setRegistrationValidationResult('invalid');
        setRegistrationValidationMessage('Registration number already exists');
      }
    } catch (error) {
      setRegistrationValidationResult('invalid');
      setRegistrationValidationMessage('Error validating registration number');
    } finally {
      setIsRegistrationValidating(false);
    }
  };

  // Validation icon functions - now show nothing since automatic validation is disabled
  const getRegistrationValidationIcon = () => {
    return null;
  };

  const getRegistrationBorderColor = () => {
    if (registrationValidationResult === 'valid') return 'border-green-500';
    if (registrationValidationResult === 'invalid') return 'border-red-500';
    return 'border-input';
  };







  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Institution Basic Information</h2>
        <p className="text-muted-foreground">
          Let's start with the basic details about your institution
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="institution-name" className="text-sm font-medium">
            Institution Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="institution-name"
              type="text"
              placeholder="Enter your institution name"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className={`pr-10 ${getInputBorderColor()}`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getValidationIcon()}
            </div>
          </div>
          

          
          {institutionName.trim().length > 0 && institutionName.trim().length < 3 && (
            <p className="text-sm text-muted-foreground">
              Institution name must be at least 3 characters long
            </p>
          )}
        </div>

        {/* Institution Type Field */}
        <div className="space-y-2">
          <Label htmlFor="institution-type" className="text-sm font-medium">
            Institution Type <span className="text-red-500">*</span>
          </Label>
          <Popover open={isTypeOpen} onOpenChange={setIsTypeOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                role="combobox"
                aria-expanded={isTypeOpen}
                className={cn(
                  "w-full justify-between px-3 py-2 border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md",
                  !institutionType && "text-muted-foreground"
                )}
              >
                {institutionType || "Select institution type..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="max-h-60 overflow-auto">
                {institutionTypes.map((type) => (
                  <div
                    key={type}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      setInstitutionType(type);
                      if (type !== 'Other') {
                        setOtherInstitutionType('');
                      }
                      setIsTypeOpen(false);
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Other Institution Type Field - Only shown when "Other" is selected */}
          {institutionType === 'Other' && (
            <div className="space-y-2 mt-3">
              <Label htmlFor="other-institution-type" className="text-sm font-medium">
                Specify Institution Type <span className="text-red-500">*</span>
              </Label>
              <Input
                id="other-institution-type"
                type="text"
                placeholder="Please specify your institution type"
                value={otherInstitutionType}
                onChange={(e) => setOtherInstitutionType(e.target.value)}
                className="w-full"
              />
              {otherInstitutionType.trim().length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Please specify your institution type
                </p>
              )}
            </div>
          )}
        </div>

        {/* Establishment Year Field */}
        <div className="space-y-2">
          <Label htmlFor="establishment-year" className="text-sm font-medium">
            Establishment Year <span className="text-red-500">*</span>
          </Label>
          <Popover open={isYearOpen} onOpenChange={setIsYearOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                role="combobox"
                aria-expanded={isYearOpen}
                className={cn(
                  "w-full justify-between px-3 py-2 border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md",
                  !establishmentYear && "text-muted-foreground"
                )}
              >
                {establishmentYear || "Select establishment year..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="max-h-60 overflow-auto">
                {years.map((year) => (
                  <div
                    key={year}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      setEstablishmentYear(year.toString());
                      setIsYearOpen(false);
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Registration Number Field */}
        <div className="space-y-2">
          <Label htmlFor="registration-number" className="text-sm font-medium">
            Registration Number <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="registration-number"
              type="text"
              placeholder="Enter government registration number"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className={`w-full pr-10 ${getRegistrationBorderColor()}`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getRegistrationValidationIcon()}
            </div>
          </div>
          

          
          <p className="text-xs text-muted-foreground">
            This should be your official government registration number or license number
          </p>
          {registrationNumber.trim().length > 0 && registrationNumber.trim().length < 5 && (
            <p className="text-xs text-amber-600">
              Registration number must be at least 5 characters long
            </p>
          )}
        </div>

        {/* PAN Number Field */}
        <div className="space-y-2">
          <Label htmlFor="pan-number" className="text-sm font-medium">
            PAN Number <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="pan-number"
              type="text"
              placeholder="Enter 10-character PAN number"
              value={panNumber}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setPanNumber(value);
              }}
              maxLength={10}
              className={`w-full font-mono tracking-wider pr-10 ${getPanBorderColor()}`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getPanValidationIcon()}
            </div>
          </div>
          

          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Format: ABCDE1234F (5 letters + 4 digits + 1 letter)
            </p>
            <span className={`text-xs ${
              panNumber.length === 10 ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              {panNumber.length}/10
            </span>
          </div>
          {panNumber.length > 0 && panNumber.length < 10 && (
            <p className="text-xs text-amber-600">
              PAN number must be exactly 10 characters
            </p>
          )}
          {panNumber.length === 10 && !isValidPanFormat(panNumber) && (
            <p className="text-xs text-red-600">
              Invalid PAN format. Must be 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
            </p>
          )}
        </div>

        {/* GST Number Field */}
        <div className="space-y-2">
          <Label htmlFor="gst-number" className="text-sm font-medium">
            GST Number <span className="text-muted-foreground text-xs">(Optional)</span>
          </Label>
          <div className="relative">
            <Input
              id="gst-number"
              type="text"
              placeholder="Enter 15-character GST number"
              value={gstNumber}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setGstNumber(value);
              }}
              maxLength={15}
              className={`w-full font-mono tracking-wider pr-10 ${getGstBorderColor()}`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getGstValidationIcon()}
            </div>
          </div>
          

          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Format: 22AAAAA0000A1Z5 (15 characters, alphanumeric)
            </p>
            <span className={`text-xs ${
              gstNumber.length === 15 ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              {gstNumber.length}/15
            </span>
          </div>
          {gstNumber.length > 0 && gstNumber.length < 15 && (
            <p className="text-xs text-amber-600">
              GST number must be exactly 15 characters
            </p>
          )}
          {gstNumber.length === 15 && !isValidGstFormat(gstNumber) && (
            <p className="text-xs text-red-600">
              Invalid GST format. Must follow the pattern: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
            </p>
          )}
        </div>

        {/* Email Address Field */}
        <div className="space-y-2">
          <Label htmlFor="official-email" className="text-sm font-medium">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="official-email"
              type="email"
              placeholder="Enter your email address"
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
              className={`pr-10 ${getEmailBorderColor()}`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getEmailValidationIcon()}
            </div>
          </div>
          

          
          {officialEmail.trim().length > 0 && !isValidEmailFormat(officialEmail) && (
            <p className="text-sm text-amber-600">
              Please enter a valid email address
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Password must be at least 8 characters long
          </p>
        </div>

        {/* Primary Contact Number Field */}
        <div className="space-y-2">
          <Label htmlFor="primary-contact" className="text-sm font-medium">
            Primary Contact Number <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="primary-contact"
              type="tel"
              placeholder="Enter 10-digit contact number"
              value={primaryContact}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPrimaryContact(value);
              }}
              maxLength={10}
              className={`pr-10 ${getContactBorderColor()}`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getContactValidationIcon()}
            </div>
          </div>
          

          
          {primaryContact.length > 0 && primaryContact.length < 10 && (
            <p className="text-sm text-amber-600">
              Contact number must be exactly 10 digits
            </p>
          )}
          
          {primaryContact.length === 10 && !isValidContactFormat(primaryContact) && (
            <p className="text-sm text-amber-600">
              Contact number must contain only digits
            </p>
          )}
          

        </div>

        {/* Secondary Contact Number Field */}
        <div className="space-y-2">
          <Label htmlFor="secondary-contact" className="text-sm font-medium">
            Secondary Contact Number <span className="text-muted-foreground text-xs">(Optional)</span>
          </Label>
          <div className="space-y-1">
            <Input
              id="secondary-contact"
              type="tel"
              placeholder="Enter secondary contact number (optional)"
              value={secondaryContact}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setSecondaryContact(value);
              }}
              maxLength={10}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Additional contact number for backup purposes
              </p>
              {secondaryContact.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {secondaryContact.length}/10
                </span>
              )}
            </div>
            {secondaryContact.length > 0 && secondaryContact.length < 10 && (
              <p className="text-xs text-amber-600">
                Contact number must be exactly 10 digits
              </p>
            )}
          </div>
        </div>

        {/* Website URL Field */}
        <div className="space-y-2">
          <Label htmlFor="website-url" className="text-sm font-medium">
            Website URL <span className="text-muted-foreground text-xs">(Optional)</span>
          </Label>
          <div className="space-y-1">
            <Input
              id="website-url"
              type="url"
              placeholder="Enter website URL (e.g., https://www.example.com)"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Your institution's official website address
              </p>
              {websiteUrl.length > 0 && (
                <span className={`text-xs ${
                  isValidUrlFormat(websiteUrl) ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {isValidUrlFormat(websiteUrl) ? 'Valid URL' : 'Invalid format'}
                </span>
              )}
            </div>
            {websiteUrl.length > 0 && !isValidUrlFormat(websiteUrl) && (
              <p className="text-xs text-amber-600">
                Please enter a valid URL (e.g., https://www.example.com or www.example.com)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Address Information</h3>
          <p className="text-muted-foreground">
            Provide the complete address details of your institution
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Complete Address Field */}
          <div className="space-y-2">
            <Label htmlFor="complete-address" className="text-sm font-medium">
              Complete Address <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-1">
              <textarea
                id="complete-address"
                placeholder="Enter complete address including street, city, state, and PIN code"
                value={completeAddress}
                onChange={(e) => setCompleteAddress(e.target.value)}
                rows={4}
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Include street address, city, state, and PIN code
                </p>
                {completeAddress.length > 0 && (
                  <span className={`text-xs ${
                    completeAddress.length >= 20 ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {completeAddress.length} characters
                  </span>
                )}
              </div>
              {completeAddress.length > 0 && completeAddress.length < 20 && (
                <p className="text-xs text-amber-600">
                  Please provide a more detailed address (minimum 20 characters)
                </p>
              )}
            </div>
          </div>

          {/* City Field */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              City <span className="text-red-500">*</span>
            </Label>
            <Popover open={isCityOpen} onOpenChange={setIsCityOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={isCityOpen}
                  className={cn(
                    "w-full justify-between px-3 py-2 border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md",
                    !city && "text-muted-foreground"
                  )}
                >
                  {city || "Select city..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <div className="p-2">
                  <Input
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-60 overflow-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((cityName, index) => (
                        <div
                          key={`${cityName}-${index}`}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                          onClick={() => {
                            setCity(cityName);
                            setCitySearch('');
                            setIsCityOpen(false);
                          }}
                        >
                          {cityName}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No cities found
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* State Field */}
          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium">
              State <span className="text-red-500">*</span>
            </Label>
            <Popover open={isStateOpen} onOpenChange={setIsStateOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={isStateOpen}
                  className={cn(
                    "w-full justify-between px-3 py-2 border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md",
                    !state && "text-muted-foreground"
                  )}
                >
                  {state || "Select state..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <div className="max-h-60 overflow-auto">
                  {states.map((stateName) => (
                    <div
                      key={stateName}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        setState(stateName);
                        setIsStateOpen(false);
                      }}
                    >
                      {stateName}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Pin Code Field */}
          <div className="space-y-2">
            <Label htmlFor="pin-code" className="text-sm font-medium">
              Pin Code <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-1">
              <Input
                id="pin-code"
                type="text"
                placeholder="Enter 6-digit PIN code"
                value={pinCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setPinCode(value);
                }}
                maxLength={6}
                className="w-full font-mono tracking-wider"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                Enter your 6-digit postal PIN code
                </p>
                {pinCode.length > 0 && (
                  <span className={`text-xs ${
                    pinCode.length === 6 ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {pinCode.length}/6
                  </span>
                )}
              </div>
              {pinCode.length > 0 && pinCode.length < 6 && (
                <p className="text-xs text-amber-600">
                  PIN code must be exactly 6 digits
                </p>
              )}
            </div>
          </div>

          {/* Landmark Field */}
          <div className="space-y-2">
            <Label htmlFor="landmark" className="text-sm font-medium">
              Landmark <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <div className="space-y-1">
              <Input
                id="landmark"
                type="text"
                placeholder="Enter nearby landmark (e.g., near metro station, shopping mall)"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Help visitors locate your institution easily
                </p>
                {landmark.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {landmark.length} characters
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Google Maps Location Field */}
          <div className="space-y-2">
            <Label htmlFor="map-location" className="text-sm font-medium">
              Google Maps Location <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <div className="space-y-1">
              <Input
                id="map-location"
                type="url"
                placeholder="Paste Google Maps URL or coordinates"
                value={mapLocation}
                onChange={(e) => setMapLocation(e.target.value)}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Help visitors navigate to your exact location
                </p>
                {mapLocation.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {mapLocation.length} characters
                  </span>
                )}
              </div>
              <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Map Preview Placeholder
                  </p>
                  <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">
                      Interactive map will be integrated here
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Users can paste Google Maps URLs or coordinates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Information Section */}
      <div className="space-y-6 border-t border-border pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Legal Information</h3>
          <p className="text-muted-foreground">
            Provide legal and registration details of your institution
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Institution Owner/Director Name Field */}
          <div className="space-y-2">
            <Label htmlFor="owner-director-name" className="text-sm font-medium">
              Institution Owner/Director Name <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-1">
              <Input
                id="owner-director-name"
                type="text"
                placeholder="Enter the name of owner or director"
                value={ownerDirectorName}
                onChange={(e) => setOwnerDirectorName(e.target.value)}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Full name of the person legally responsible for the institution
                </p>
                {ownerDirectorName.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {ownerDirectorName.length} characters
                  </span>
                )}
              </div>
              {ownerDirectorName.trim().length > 0 && ownerDirectorName.trim().length < 3 && (
                <p className="text-xs text-amber-600">
                  Name must be at least 3 characters long
                </p>
              )}
            </div>
          </div>

          {/* Owner Contact Number Field */}
          <div className="space-y-2">
            <Label htmlFor="owner-contact-number" className="text-sm font-medium">
              Owner Contact Number <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-1">
              <Input
                id="owner-contact-number"
                type="tel"
                placeholder="Enter owner's contact number"
                value={ownerContactNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setOwnerContactNumber(value);
                }}
                maxLength={10}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Primary contact number for the institution owner/director
                </p>
                {ownerContactNumber.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {ownerContactNumber.length}/10 digits
                  </span>
                )}
              </div>
              {ownerContactNumber.length > 0 && ownerContactNumber.length < 10 && (
                <p className="text-xs text-amber-600">
                  Contact number must be exactly 10 digits
                </p>
              )}
              {ownerContactNumber.length === 10 && (
                <p className="text-xs text-green-600">
                  ✓ Valid contact number format
                </p>
              )}
            </div>

            {/* Business License Upload Field */}
            <div className="space-y-2">
              <Label htmlFor="business-license" className="text-sm font-medium">
                Business License Upload <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-1">
                <div className="space-y-3">
                  {/* File Input */}
                  <div className="flex items-center space-x-3">
                    <Input
                      id="business-license"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBusinessLicenseFile(file);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                  
                  {/* File Preview and Info */}
                  {businessLicenseFile && (
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                            {businessLicenseFile.type === 'application/pdf' ? (
                              <span className="text-xs font-bold text-primary">PDF</span>
                            ) : (
                              <span className="text-xs font-bold text-primary">IMG</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{businessLicenseFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(businessLicenseFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBusinessLicenseFile(null)}
                          className="h-8 px-2 border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Guidelines */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Accepted formats: PDF, JPG, JPEG, PNG</p>
                    <p>• Maximum file size: 10 MB</p>
                    <p>• Upload your business license, registration certificate, or permit</p>
                    <p>• Ensure the document is clear and all text is readable</p>
                  </div>
                  
                  {/* Validation Messages */}
                  {businessLicenseFile && businessLicenseFile.size > 10 * 1024 * 1024 && (
                    <p className="text-xs text-red-600">
                      File size exceeds 10 MB limit. Please choose a smaller file.
                    </p>
                  )}
                  {businessLicenseFile && !['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(businessLicenseFile.type) && (
                    <p className="text-xs text-red-600">
                      Invalid file type. Please upload PDF, JPG, JPEG, or PNG files only.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Registration Certificate Upload Field */}
            <div className="space-y-2">
              <Label htmlFor="registration-certificate" className="text-sm font-medium">
                Registration Certificate Upload <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-1">
                <div className="space-y-3">
                  {/* File Input */}
                  <div className="flex items-center space-x-3">
                    <Input
                      id="registration-certificate"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setRegistrationCertificateFile(file);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                  
                  {/* File Preview and Info */}
                  {registrationCertificateFile && (
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                            {registrationCertificateFile.type === 'application/pdf' ? (
                              <span className="text-xs font-bold text-primary">PDF</span>
                            ) : (
                              <span className="text-xs font-bold text-primary">IMG</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{registrationCertificateFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(registrationCertificateFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRegistrationCertificateFile(null)}
                          className="h-8 px-2 border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Guidelines */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Accepted formats: PDF, JPG, JPEG, PNG</p>
                    <p>• Maximum file size: 10 MB</p>
                    <p>• Upload your official registration certificate from government authorities</p>
                    <p>• Ensure the document shows registration number and validity clearly</p>
                  </div>
                  
                  {/* Validation Messages */}
                  {registrationCertificateFile && registrationCertificateFile.size > 10 * 1024 * 1024 && (
                    <p className="text-xs text-red-600">
                      File size exceeds 10 MB limit. Please choose a smaller file.
                    </p>
                  )}
                  {registrationCertificateFile && !['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(registrationCertificateFile.type) && (
                    <p className="text-xs text-red-600">
                      Invalid file type. Please upload PDF, JPG, JPEG, or PNG files only.
                    </p>
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
