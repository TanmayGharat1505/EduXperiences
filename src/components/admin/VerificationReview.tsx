import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  FileText,
  User,
  Building2,
  Download
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface VerificationRequest {
  id: string;
  user_id: string;
  user_type: string; // Changed from strict union to string to match database
  status: string; // Changed from strict union to string to match database
  created_at: string;
  updated_at: string;
  rejection_reason?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  re_verification_due_date?: string | null;
  last_verification_date?: string | null;
  user_email?: string;
  user_name?: string;
  documents_count: number;
}

interface VerificationDocument {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

interface VerificationReviewProps {
  statusFilter?: 'all' | 'pending' | 'verified' | 'rejected';
  showTitle?: boolean;
}

export default function VerificationReview({ statusFilter = 'all', showTitle = true }: VerificationReviewProps) {
  const { toast } = useToast();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<VerificationDocument[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadVerificationRequests();
  }, []);

  const loadVerificationRequests = async () => {
    try {
      setLoading(true);
      
      // Get all verification requests without complex joins
      const { data: requests, error } = await supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Raw verification requests loaded:', requests?.length || 0);
      console.log('Raw data:', requests);

      // Get document counts for each request
      const requestsWithCounts = await Promise.all(
        (requests || []).map(async (request) => {
          const { count } = await supabase
            .from('verification_documents')
            .select('*', { count: 'exact', head: true })
            .eq('verification_request_id', request.id);

          return {
            ...request,
            user_email: `User ${request.user_id?.slice(0, 8) || 'Unknown'}`,
            user_name: `${request.user_type} ${request.user_id?.slice(0, 8) || 'Unknown'}`,
            documents_count: count || 0
          } as VerificationRequest;
        })
      );

      console.log('Processed verification requests:', requestsWithCounts.length);
      console.log('Processed data:', requestsWithCounts);

      setVerificationRequests(requestsWithCounts);
    } catch (error) {
      console.error('Error loading verification requests:', error);
      toast({
        title: "Error",
        description: "Failed to load verification requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (requestId: string) => {
    try {
      const { data: documents, error } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('verification_request_id', requestId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setSelectedDocuments(documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents.",
        variant: "destructive",
      });
    }
  };

  const handleViewDocuments = async (request: VerificationRequest) => {
    setSelectedRequest(request);
    await loadDocuments(request.id);
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(true);
      
      // Update verification request status
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update user profile verification status
      const request = verificationRequests.find(r => r.id === requestId);
      if (request) {
        if (request.user_type === 'tutor') {
          const { error: profileError } = await supabase
            .from('tutor_profiles')
            .update({ verified: true })
            .eq('user_id', request.user_id);

          if (profileError) throw profileError;
        }
        // Add institution profile update when that table exists
      }

      // Update local state
      setVerificationRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: 'verified' } : r)
      );

      toast({
        title: "Success",
        description: "User verification approved successfully.",
      });

      // Close document viewer
      setSelectedRequest(null);
      setSelectedDocuments([]);

    } catch (error) {
      console.error('Error approving verification:', error);
      toast({
        title: "Error",
        description: "Failed to approve verification.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return;

    try {
      setProcessing(true);
      
      // Update verification request status
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      // Update local state
      setVerificationRequests(prev => 
        prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'rejected' } : r)
      );

      toast({
        title: "Success",
        description: "User verification rejected successfully.",
      });

      // Close dialogs
      setShowRejectionDialog(false);
      setSelectedRequest(null);
      setSelectedDocuments([]);
      setRejectionReason('');

    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast({
        title: "Error",
        description: "Failed to reject verification.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'verified':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'government_id': 'Government ID',
      'academic_certificate': 'Academic Certificate',
      'teaching_certificate': 'Teaching Certificate',
      'registration_certificate': 'Registration Certificate',
      'tax_id': 'Tax ID',
      'location_proof': 'Location Proof'
    };
    return labels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter verification requests based on status filter
  const filteredRequests = verificationRequests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

  // Update the header title based on filter
  const getHeaderTitle = () => {
    switch (statusFilter) {
      case 'pending':
        return 'Pending Verification Requests';
      case 'verified':
        return 'Verified Users';
      case 'rejected':
        return 'Rejected Users';
      default:
        return 'Verification Review';
    }
  };

  const getHeaderDescription = () => {
    switch (statusFilter) {
      case 'pending':
        return 'Review and approve/reject pending verification requests';
      case 'verified':
        return 'View all verified tutors and institutions';
      case 'rejected':
        return 'Review rejected verification requests and reasons';
      default:
        return 'Review and approve/reject tutor and institution verification requests';
    }
  };

  if (loading) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{getHeaderTitle()}</h2>
        <p className="text-gray-600">{getHeaderDescription()}</p>
        
        {/* Request Counter */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-blue-900">
                {statusFilter === 'all' ? 'Total Requests' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Requests`}: {filteredRequests.length}
              </span>
              {statusFilter !== 'all' && (
                <span className="text-sm text-blue-600 ml-2">
                  (of {verificationRequests.length} total)
                </span>
              )}
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-orange-600">
                Pending: {verificationRequests.filter(r => r.status === 'pending').length}
              </span>
              <span className="text-green-600">
                Verified: {verificationRequests.filter(r => r.status === 'verified').length}
              </span>
              <span className="text-red-600">
                Rejected: {verificationRequests.filter(r => r.status === 'rejected').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Requests List */}
      <div className="space-y-4">
        {/* Debug Info */}
        <div className="p-4 bg-gray-100 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Total requests in state: {verificationRequests.length}</p>
          <p>Filtered requests ({statusFilter}): {filteredRequests.length}</p>
          <p>Requests being rendered: {filteredRequests.filter(r => r).length}</p>
          <p>First request ID: {filteredRequests[0]?.id || 'None'}</p>
          <p>Last request ID: {filteredRequests[filteredRequests.length - 1]?.id || 'None'}</p>
        </div>

        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No verification requests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {request.user_type === 'tutor' ? (
                        <User className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Building2 className="h-5 w-5 text-green-600" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{request.user_name}</h3>
                        <p className="text-sm text-gray-600">{request.user_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Type: {request.user_type}</span>
                      <span>Documents: {request.documents_count}</span>
                      <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(request.status)}
                    
                    {request.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocuments(request)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review Documents
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Document Viewer Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Review Documents - {selectedRequest.user_name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedRequest.user_name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedRequest.user_email}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedRequest.user_type}
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span> {new Date(selectedRequest.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3">
                <h4 className="font-medium">Uploaded Documents</h4>
                {selectedDocuments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No documents uploaded</p>
                ) : (
                  selectedDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium">{getDocumentTypeLabel(doc.document_type)}</h5>
                          <p className="text-sm text-gray-600">{doc.document_name}</p>
                          <p className="text-xs text-gray-500">
                            {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {doc.mime_type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectionDialog(true)}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for rejecting this verification request. This will help the user understand what needs to be improved.
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border rounded-lg resize-none"
              rows={4}
            />
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRejectionDialog(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processing}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
