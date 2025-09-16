import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Upload,
  AlertCircle
} from 'lucide-react';
import DocumentUpload from './DocumentUpload';

interface VerificationStatusProps {
  userType: 'tutor' | 'institute';
  onStartVerification?: () => void;
}

interface VerificationRequest {
  id: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

interface VerificationDocument {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  is_verified: boolean;
  uploaded_at: string;
}

export default function VerificationStatus({ userType, onStartVerification }: VerificationStatusProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Get verification request
      const { data: request, error: requestError } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('user_type', userType)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (requestError && requestError.code !== 'PGRST116') {
        console.error('Error fetching verification request:', requestError);
      } else if (request) {
        setVerificationRequest(request);
        
        // Get documents for this request
        const { data: docs, error: docsError } = await supabase
          .from('verification_documents')
          .select('*')
          .eq('verification_request_id', request.id)
          .order('uploaded_at', { ascending: false });

        if (!docsError && docs) {
          setDocuments(docs);
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>;
      case 'verified':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-8 w-8 text-yellow-600" />;
      case 'verified': return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'rejected': return <XCircle className="h-8 w-8 text-red-600" />;
      default: return <Shield className="h-8 w-8 text-gray-600" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return "Your verification request is currently under review. Our team will examine your documents within 2-3 business days.";
      case 'verified':
        return "Congratulations! Your account has been verified. You now have access to all platform features.";
      case 'rejected':
        return "Your verification request was not approved. Please review the feedback and submit updated documents.";
      default:
        return `Complete your ${userType} verification by uploading the required documents to unlock all platform features.`;
    }
  };

  const getRequiredDocuments = () => {
    if (userType === 'tutor') {
      return [
        { type: 'government_id', name: 'Government ID', description: 'Valid government-issued photo ID' },
        { type: 'academic_certificate', name: 'Academic Certificates', description: 'Your highest educational qualifications' },
        { type: 'teaching_certificate', name: 'Teaching Certificates', description: 'Any teaching or training certifications' }
      ];
    } else {
      return [
        { type: 'registration_certificate', name: 'Registration Certificate', description: 'Official business registration' },
        { type: 'tax_id', name: 'Tax ID', description: 'Business tax identification number' },
        { type: 'location_proof', name: 'Location Proof', description: 'Proof of business location' }
      ];
    }
  };

  const getDocumentStatus = (documentType: string) => {
    const doc = documents.find(d => d.document_type === documentType);
    if (doc) {
      return doc.is_verified ? 'verified' : 'pending';
    }
    return 'missing';
  };

  const handleUploadComplete = () => {
    setShowUploadForm(false);
    checkVerificationStatus(); // Refresh status
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show upload form if no verification request exists or if user wants to upload new documents
  if (showUploadForm || !verificationRequest) {
    return (
      <DocumentUpload 
        userType={userType} 
        onUploadComplete={handleUploadComplete}
      />
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="text-center space-y-4">
          {getStatusIcon(verificationRequest?.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {verificationRequest?.status ? 
                `${userType.charAt(0).toUpperCase() + userType.slice(1)} Verification` : 
                'Verification Required'
              }
            </h3>
            <div className="mt-2">
              {getStatusBadge(verificationRequest?.status)}
            </div>
          </div>
          <p className="text-gray-600 max-w-md mx-auto">
            {getStatusMessage(verificationRequest?.status)}
          </p>
        </div>

        {/* Progress Bar for Pending */}
        {verificationRequest?.status === 'pending' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Verification Progress</span>
              <span>Under Review</span>
            </div>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-gray-500 text-center">
              Estimated completion: 2-3 business days
            </p>
          </div>
        )}

        {/* Required Documents */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Required Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getRequiredDocuments().map((doc) => {
              const status = getDocumentStatus(doc.type);
              return (
                <div key={doc.type} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{doc.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                    </div>
                    <div className="ml-3">
                      {status === 'verified' && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </Badge>
                      )}
                      {status === 'pending' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending
                        </Badge>
                      )}
                      {status === 'missing' && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <FileText className="h-3 w-3" /> Not Uploaded
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 pt-4">
          {verificationRequest?.status === 'rejected' && (
            <Button 
              onClick={() => setShowUploadForm(true)}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Submit Updated Documents
            </Button>
          )}

          {verificationRequest?.status === 'verified' && (
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Start Teaching
            </Button>
          )}

          {verificationRequest?.status === 'pending' && (
            <Button 
              onClick={() => setShowUploadForm(true)}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Add More Documents
            </Button>
          )}
        </div>

        {/* Additional Info */}
        {verificationRequest?.status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Verification in Progress</h4>
                <p className="text-sm text-blue-700 mt-1">
                  While your verification is pending, you can still complete your profile and prepare your teaching materials. 
                  Once verified, you'll be able to accept students immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {verificationRequest?.status === 'rejected' && verificationRequest.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Rejection Reason</h4>
                <p className="text-sm text-red-700 mt-1">
                  {verificationRequest.rejection_reason}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
