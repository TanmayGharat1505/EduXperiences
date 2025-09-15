import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  Clock,
  Edit,
  Save,
  X
} from 'lucide-react';
import { StudentInquiry, InquiryStatus, PriorityLevel } from '@/types/inquiry';

interface InquiryDetailModalProps {
  inquiry: StudentInquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (inquiryId: string, status: InquiryStatus) => void;
  onPriorityUpdate: (inquiryId: string, priority: PriorityLevel) => void;
  onNotesUpdate: (inquiryId: string, notes: string) => void;
}

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  interested: { label: 'Interested', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  admitted: { label: 'Admitted', color: 'bg-green-100 text-green-800 border-green-200' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
};

export function InquiryDetailModal({ 
  inquiry, 
  isOpen, 
  onClose, 
  onStatusUpdate, 
  onPriorityUpdate,
  onNotesUpdate 
}: InquiryDetailModalProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [notes, setNotes] = React.useState(inquiry?.notes || '');

  React.useEffect(() => {
    if (inquiry) {
      setNotes(inquiry.notes || '');
    }
  }, [inquiry]);

  if (!inquiry) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSaveNotes = () => {
    onNotesUpdate(inquiry.id, notes);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Inquiry Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{inquiry.student_name}</CardTitle>
                  <p className="text-gray-600 mt-1">{inquiry.student_email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`${STATUS_CONFIG[inquiry.status].color} border`}
                  >
                    {STATUS_CONFIG[inquiry.status].label}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${PRIORITY_CONFIG[inquiry.priority].color} border`}
                  >
                    {PRIORITY_CONFIG[inquiry.priority].label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{inquiry.student_email}</span>
                  </div>
                  {inquiry.student_phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{inquiry.student_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Received: {formatDate(inquiry.created_at)}</span>
                  </div>
                  {inquiry.last_contacted && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Last contacted: {formatDate(inquiry.last_contacted)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Course Interest:</span>
                    <p className="text-sm text-blue-600 font-medium">{inquiry.course_interest}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Source:</span>
                    <p className="text-sm text-gray-600 capitalize">{inquiry.inquiry_source}</p>
                  </div>
                  {inquiry.follow_up_date && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Follow-up Date:</span>
                      <p className="text-sm text-gray-600">{formatDate(inquiry.follow_up_date)}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inquiry Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notes</CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Add or update notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this inquiry..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={handleSaveNotes}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Notes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNotes(inquiry.notes || '');
                        setIsEditing(false);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  {inquiry.notes ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{inquiry.notes}</p>
                  ) : (
                    <p className="text-gray-500 italic">No notes added yet.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusUpdate(inquiry.id, 'contacted')}
                  disabled={inquiry.status === 'contacted'}
                >
                  Mark as Contacted
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusUpdate(inquiry.id, 'interested')}
                  disabled={inquiry.status === 'interested'}
                >
                  Mark as Interested
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusUpdate(inquiry.id, 'admitted')}
                  disabled={inquiry.status === 'admitted'}
                >
                  Mark as Admitted
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusUpdate(inquiry.id, 'closed')}
                  disabled={inquiry.status === 'closed'}
                  className="text-red-600 hover:text-red-700"
                >
                  Close Inquiry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
