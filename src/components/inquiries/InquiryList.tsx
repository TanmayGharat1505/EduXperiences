import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  User, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  Timer,
  Globe,
  History,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Send,
  MapPin,
  Heart,
  GraduationCap,
  ThumbsDown
} from 'lucide-react';
import { StudentInquiry, InquiryStatus, PriorityLevel } from '@/types/inquiry';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InquiryListProps {
  inquiries: StudentInquiry[];
  loading?: boolean;
  onStatusUpdate: (inquiryId: string, status: InquiryStatus) => void;
  onViewDetails: (inquiry: StudentInquiry) => void;
  onPriorityUpdate?: (inquiryId: string, priority: PriorityLevel) => void;
  onCallNow?: (inquiry: StudentInquiry) => void;
  onSendDetails?: (inquiry: StudentInquiry) => void;
  onScheduleVisit?: (inquiry: StudentInquiry) => void;
  onMarkInterested?: (inquiry: StudentInquiry) => void;
  onConvertToAdmission?: (inquiry: StudentInquiry) => void;
  onNotSuitable?: (inquiry: StudentInquiry) => void;
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

const SOURCE_CONFIG = {
  website: { label: 'Website', icon: Globe, color: 'bg-blue-100 text-blue-800' },
  phone: { label: 'Phone', icon: Phone, color: 'bg-green-100 text-green-800' },
  email: { label: 'Email', icon: Mail, color: 'bg-purple-100 text-purple-800' },
  social_media: { label: 'Social Media', icon: Users, color: 'bg-pink-100 text-pink-800' },
  referral: { label: 'Referral', icon: User, color: 'bg-indigo-100 text-indigo-800' },
  walk_in: { label: 'Walk-in', icon: User, color: 'bg-yellow-100 text-yellow-800' },
  advertisement: { label: 'Advertisement', icon: Globe, color: 'bg-orange-100 text-orange-800' },
  other: { label: 'Other', icon: MessageSquare, color: 'bg-gray-100 text-gray-800' },
};

export function InquiryList({ 
  inquiries, 
  loading, 
  onStatusUpdate, 
  onViewDetails, 
  onPriorityUpdate,
  onCallNow,
  onSendDetails,
  onScheduleVisit,
  onMarkInterested,
  onConvertToAdmission,
  onNotSuitable
}: InquiryListProps) {
  const navigate = useNavigate();
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [expandedInquiries, setExpandedInquiries] = useState<Set<string>>(new Set());

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  const toggleExpanded = (inquiryId: string) => {
    setExpandedInquiries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(inquiryId)) {
        newSet.delete(inquiryId);
      } else {
        newSet.add(inquiryId);
      }
      return newSet;
    });
  };

  const getSourceIcon = (source: string) => {
    const config = SOURCE_CONFIG[source as keyof typeof SOURCE_CONFIG];
    return config ? config.icon : MessageSquare;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
          <p className="text-gray-500">
            No student inquiries match your current filters. Try adjusting your search criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {inquiries.map((inquiry) => {
        const isExpanded = expandedInquiries.has(inquiry.id);
        const SourceIcon = getSourceIcon(inquiry.inquiry_source);
        
        return (
          <Card 
            key={inquiry.id} 
            className="hover:shadow-lg transition-all duration-200 border-0 bg-white"
          >
            <CardContent className="p-6">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                      {getInitials(inquiry.student_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {inquiry.student_name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`${STATUS_CONFIG[inquiry.status].color} border font-medium`}
                      >
                        {STATUS_CONFIG[inquiry.status].label}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${PRIORITY_CONFIG[inquiry.priority].color} border font-medium`}
                      >
                        {PRIORITY_CONFIG[inquiry.priority].label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <SourceIcon className="w-4 h-4" />
                      <span className="capitalize">{inquiry.inquiry_source.replace('_', ' ')}</span>
                      <span>•</span>
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(inquiry.created_at)} at {formatTime(inquiry.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Quick Actions - Always Visible */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCallNow?.(inquiry)}
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendDetails?.(inquiry)}
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpanded(inquiry.id)}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {isExpanded ? 'Less' : 'More'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/institution-dashboard/inquiries/${inquiry.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>

              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Student Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{inquiry.student_email}</span>
                    </div>
                    {inquiry.student_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{inquiry.student_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Parent/Guardian Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    {inquiry.parent_name && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{inquiry.parent_name}</span>
                      </div>
                    )}
                    {inquiry.parent_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{inquiry.parent_email}</span>
                      </div>
                    )}
                    {inquiry.parent_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{inquiry.parent_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Course & Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Course Interest
                  </h4>
                  <p className="text-blue-600 font-medium">{inquiry.course_interest}</p>
                </div>
                
                {inquiry.preferred_batch_timing && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Timer className="w-4 h-4 mr-2" />
                      Preferred Timing
                    </h4>
                    <p className="text-gray-600">{inquiry.preferred_batch_timing}</p>
                  </div>
                )}
                
                {inquiry.budget_range && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Budget Range
                    </h4>
                    <p className="text-green-600 font-medium">{inquiry.budget_range}</p>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Inquiry Message</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">
                  {inquiry.message}
                </p>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t pt-4 space-y-4">
                  {/* Follow-up History */}
                  {inquiry.follow_up_history && inquiry.follow_up_history.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <History className="w-4 h-4 mr-2" />
                        Follow-up History
                      </h4>
                      <div className="space-y-3">
                        {inquiry.follow_up_history.map((entry, index) => (
                          <div key={entry.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {entry.type.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {formatDate(entry.date)} at {formatTime(entry.date)}
                                </span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  entry.outcome === 'interested' ? 'bg-green-100 text-green-800' :
                                  entry.outcome === 'not_interested' ? 'bg-red-100 text-red-800' :
                                  entry.outcome === 'no_answer' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {entry.outcome.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{entry.notes}</p>
                            {entry.next_action && (
                              <p className="text-xs text-blue-600 mt-1">
                                Next: {entry.next_action}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Quick Actions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Primary Actions */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onCallNow?.(inquiry)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <PhoneCall className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onSendDetails?.(inquiry)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Details
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onScheduleVisit?.(inquiry)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Schedule Visit
                      </Button>
                      
                      {/* Status Actions */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMarkInterested?.(inquiry)}
                        className="border-pink-200 text-pink-700 hover:bg-pink-50"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Mark Interested
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onConvertToAdmission?.(inquiry)}
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Convert to Admission
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNotSuitable?.(inquiry)}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Not Suitable
                      </Button>
                    </div>
                    
                    {/* Additional Status Actions */}
                    <div className="pt-2 border-t">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Status Updates</h5>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStatusUpdate(inquiry.id, 'contacted')}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Mark Contacted
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStatusUpdate(inquiry.id, 'closed')}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Close Inquiry
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
