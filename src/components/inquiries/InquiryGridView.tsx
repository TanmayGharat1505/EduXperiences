import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  User, 
  Users,
  DollarSign,
  Timer,
  Globe,
  PhoneCall,
  Send,
  MapPin,
  Heart,
  GraduationCap,
  ThumbsDown,
  Eye
} from 'lucide-react';
import { StudentInquiry, InquiryStatus, PriorityLevel } from '@/types/inquiry';

interface InquiryGridViewProps {
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
  other: { label: 'Other', icon: Mail, color: 'bg-gray-100 text-gray-800' },
};

export function InquiryGridView({ 
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
}: InquiryGridViewProps) {
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

  const getSourceIcon = (source: string) => {
    const config = SOURCE_CONFIG[source as keyof typeof SOURCE_CONFIG];
    return config ? config.icon : Mail;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
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
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
          <p className="text-gray-500">
            No student inquiries match your current filters. Try adjusting your search criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {inquiries.map((inquiry) => {
        const SourceIcon = getSourceIcon(inquiry.inquiry_source);
        
        return (
          <Card 
            key={inquiry.id} 
            className="hover:shadow-lg transition-all duration-200 border-0 bg-white group"
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {getInitials(inquiry.student_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {inquiry.student_name}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <SourceIcon className="w-3 h-3" />
                      <span className="capitalize">{inquiry.inquiry_source.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge 
                    variant="outline" 
                    className={`${STATUS_CONFIG[inquiry.status].color} border text-xs`}
                  >
                    {STATUS_CONFIG[inquiry.status].label}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${PRIORITY_CONFIG[inquiry.priority].color} border text-xs`}
                  >
                    {PRIORITY_CONFIG[inquiry.priority].label}
                  </Badge>
                </div>
              </div>

              {/* Course Interest */}
              <div className="mb-4">
                <p className="text-sm font-medium text-blue-600 mb-1">
                  {inquiry.course_interest}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {inquiry.message}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{inquiry.student_email}</span>
                </div>
                {inquiry.student_phone && (
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span>{inquiry.student_phone}</span>
                  </div>
                )}
                {inquiry.budget_range && (
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <DollarSign className="w-3 h-3" />
                    <span>{inquiry.budget_range}</span>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(inquiry.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeAgo(inquiry.created_at)}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCallNow?.(inquiry)}
                  className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <PhoneCall className="w-3 h-3 mr-1" />
                  Call
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSendDetails?.(inquiry)}
                  className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(inquiry)}
                  className="text-xs col-span-2"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Full Details
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
