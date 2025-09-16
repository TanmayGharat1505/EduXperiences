import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  FileText,
  AlertCircle,
  Trash2
} from 'lucide-react';

interface DocumentUploadProps {
  userType: 'tutor' | 'institute';
  onUploadComplete: () => void;
}

interface DocumentFile {
  type: string;
  name: string;
  description: string;
  required: boolean;
  file?: File;
  uploaded?: boolean;
  url?: string;
}

export default function DocumentUpload({ userType, onUploadComplete }: DocumentUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Initialize required documents based on user type
  React.useEffect(() => {
    if (userType === 'tutor') {
      setDocuments([
        {
          type: 'government_id',
          name: 'Government ID',
          description: 'Valid government-issued photo ID (Passport, Driver\'s License, Aadhaar)',
          required: true
        },
        {
          type: 'academic_certificate',
          name: 'Academic Certificates',
          description: 'Your highest educational qualifications (Degree, Diploma, etc.)',
          required: true
        },
        {
          type: 'teaching_certificate',
          name: 'Teaching Certificates',
          description: 'Any teaching or training certifications (if applicable)',
          required: false
        }
      ]);
    } else {
      setDocuments([
        {
          type: 'registration_certificate',
          name: 'Registration Certificate',
          description: 'Official business registration certificate',
          required: true
        },
        {
          type: 'tax_id',
          name: 'Tax ID',
          description: 'Business tax identification number',
          required: true
        },
        {
          type: 'location_proof',
          name: 'Location Proof',
          description: 'Proof of business location (utility bill, lease agreement)',
          required: true
        }
      ]);
    }
  }, [userType]);

  const handleFileSelect = (documentType: string, file: File) => {
    setDocuments(prev => prev.map(doc => 
      doc.type === documentType 
        ? { ...doc, file, uploaded: false }
        : doc
    ));
  };

  const removeFile = (documentType: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.type === documentType 
        ? { ...doc, file: undefined, uploaded: false, url: undefined }
        : doc
    ));
    
    // Clear the file input
    if (fileInputRefs.current[documentType]) {
      fileInputRefs.current[documentType]!.value = '';
    }
  };

  const uploadDocuments = async () => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to upload documents.",
          variant: "destructive",
        });
        return;
      }

      // Create verification request if it doesn't exist
      let requestId: string;
      const { data: existingRequest, error: requestError } = await supabase
        .from('verification_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('user_type', userType)
        .single();

      if (existingRequest) {
        requestId = existingRequest.id;
      } else {
        const { data: newRequest, error: createError } = await supabase
          .from('verification_requests')
          .insert({
            user_id: user.id,
            user_type: userType,
            status: 'pending'
          })
          .select('id')
          .single();

        if (createError) throw createError;
        requestId = newRequest.id;
      }

      // Upload each document
      const documentsToUpload = documents.filter(doc => doc.file && !doc.uploaded);
      let uploadedCount = 0;

      for (const doc of documentsToUpload) {
        if (!doc.file) continue;

        try {
          // Generate unique filename
          const fileExt = doc.file.name.split('.').pop();
          const fileName = `${requestId}_${doc.type}_${Date.now()}.${fileExt}`;
          const filePath = `${requestId}/${fileName}`;

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('verification-documents')
            .upload(filePath, doc.file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('verification-documents')
            .getPublicUrl(filePath);

          // Save document metadata to database
          const { error: docError } = await supabase
            .from('verification_documents')
            .insert({
              verification_request_id: requestId,
              document_type: doc.type,
              document_name: doc.file.name,
              file_url: urlData.publicUrl,
              file_size: doc.file.size,
              mime_type: doc.file.type,
              is_required: doc.required
            });

          if (docError) throw docError;

          // Update local state
          setDocuments(prev => prev.map(d => 
            d.type === doc.type 
              ? { ...d, uploaded: true, url: urlData.publicUrl }
              : d
          ));

          uploadedCount++;
          setUploadProgress((uploadedCount / documentsToUpload.length) * 100);

        } catch (error) {
          console.error(`Error uploading ${doc.type}:`, error);
          toast({
            title: "Upload Error",
            description: `Failed to upload ${doc.name}. Please try again.`,
            variant: "destructive",
          });
        }
      }

      if (uploadedCount > 0) {
        toast({
          title: "Upload Complete",
          description: `${uploadedCount} document(s) uploaded successfully. Your verification request has been submitted.`,
        });
        
        // Update verification request status to pending
        await supabase
          .from('verification_requests')
          .update({ status: 'pending' })
          .eq('id', requestId);

        onUploadComplete();
      }

    } catch (error) {
      console.error('Error during document upload:', error);
      toast({
        title: "Error",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getDocumentStatus = (doc: DocumentFile) => {
    if (doc.uploaded) return 'uploaded';
    if (doc.file) return 'selected';
    return 'missing';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Uploaded</Badge>;
      case 'selected':
        return <Badge variant="secondary" className="flex items-center gap-1"><FileText className="h-3 w-3" /> Ready to Upload</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1"><FileText className="h-3 w-3" /> Not Uploaded</Badge>;
    }
  };

  const canSubmit = documents.some(doc => doc.required && doc.file) && !uploading;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document List */}
        <div className="space-y-4">
          {documents.map((doc) => {
            const status = getDocumentStatus(doc);
            return (
              <div key={doc.type} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-900">{doc.name}</h5>
                      {doc.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  </div>
                  <div className="ml-3">
                    {getStatusBadge(status)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    ref={(el) => fileInputRefs.current[doc.type] = el}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(doc.type, file);
                    }}
                    className="hidden"
                  />
                  
                  {!doc.file ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRefs.current[doc.type]?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select File
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{doc.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(doc.type)}
                        disabled={uploading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Uploading documents...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={uploadDocuments}
            disabled={!canSubmit || uploading}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Verification Request
              </>
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Verification Process</h4>
              <p className="text-sm text-blue-700 mt-1">
                After uploading your documents, our admin team will review them within 2-3 business days. 
                You'll receive an email notification once the review is complete.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
