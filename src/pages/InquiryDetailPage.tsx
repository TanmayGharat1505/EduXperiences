import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InstitutionSidebar } from '@/components/layout/InstitutionSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  Users,
  DollarSign,
  Timer,
  Globe,
  History,
  MessageSquare,
  PhoneCall,
  Send,
  MapPin,
  Heart,
  GraduationCap,
  ThumbsDown,
  Star,
  Tag,
  Plus,
  Edit,
  Trash2,
  Bell,
  Target,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { StudentInquiry, FollowUpEntry } from '@/types/inquiry';

interface CommunicationEntry {
  id: string;
  type: 'call' | 'email' | 'sms' | 'meeting' | 'note';
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  outcome?: string;
  duration?: number; // in minutes
}

interface FollowUpReminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface ResponseTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'call_script';
}

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<StudentInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInquiry({
        id: id || '1',
        student_name: 'Priya Sharma',
        student_email: 'priya.sharma@gmail.com',
        student_phone: '+91 98765 43210',
        parent_name: 'Rajesh Sharma',
        parent_phone: '+91 98765 43211',
        parent_email: 'rajesh.sharma@gmail.com',
        course_interest: 'Data Science & Machine Learning',
        preferred_batch_timing: 'Evening (4:00 PM - 8:00 PM)',
        budget_range: '₹20,000 - ₹30,000',
        inquiry_source: 'website',
        status: 'interested',
        priority: 'high',
        message: 'I am interested in learning data science and machine learning. I have a background in computer science and want to enhance my skills for career growth. Please provide details about the course curriculum, duration, and placement assistance.',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-16T14:20:00Z',
        last_contacted: '2024-01-16T14:20:00Z',
        notes: 'Very interested student with strong technical background. Follow up scheduled for tomorrow.',
        assigned_to: 'current_user_id',
        follow_up_date: '2024-01-17T10:00:00Z',
        follow_up_history: [
          {
            id: '1',
            date: '2024-01-15T10:30:00Z',
            type: 'call',
            notes: 'Initial inquiry call - very interested in data science course',
            outcome: 'interested',
            next_action: 'Send detailed course information',
            created_by: 'current_user_id'
          },
          {
            id: '2',
            date: '2024-01-16T14:20:00Z',
            type: 'email',
            notes: 'Sent course brochure and curriculum details',
            outcome: 'answered',
            next_action: 'Schedule campus visit',
            created_by: 'current_user_id'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const [communicationHistory] = useState<CommunicationEntry[]>([
    {
      id: '1',
      type: 'call',
      direction: 'inbound',
      content: 'Initial inquiry about data science course',
      timestamp: '2024-01-15T10:30:00Z',
      outcome: 'interested',
      duration: 15
    },
    {
      id: '2',
      type: 'email',
      direction: 'outbound',
      content: 'Sent course brochure and curriculum details',
      timestamp: '2024-01-15T11:00:00Z'
    },
    {
      id: '3',
      type: 'call',
      direction: 'outbound',
      content: 'Follow-up call to discuss course details',
      timestamp: '2024-01-16T14:20:00Z',
      outcome: 'answered',
      duration: 25
    }
  ]);

  const [followUpReminders] = useState<FollowUpReminder[]>([
    {
      id: '1',
      title: 'Send course brochure',
      description: 'Email detailed course information and curriculum',
      dueDate: '2024-01-17T10:00:00Z',
      priority: 'high',
      completed: false
    },
    {
      id: '2',
      title: 'Schedule campus visit',
      description: 'Arrange for student to visit the campus',
      dueDate: '2024-01-18T15:00:00Z',
      priority: 'medium',
      completed: false
    }
  ]);

  const [responseTemplates] = useState<ResponseTemplate[]>([
    {
      id: '1',
      name: 'Course Information',
      subject: 'Data Science Course Details - EduXperience',
      content: 'Dear [Student Name],\n\nThank you for your interest in our Data Science course...',
      type: 'email'
    },
    {
      id: '2',
      name: 'Campus Visit Invitation',
      subject: 'Campus Visit Invitation - EduXperience',
      content: 'Dear [Student Name],\n\nWe would like to invite you for a campus visit...',
      type: 'email'
    },
    {
      id: '3',
      name: 'Follow-up Call Script',
      subject: 'Follow-up Call Script',
      content: 'Hello [Student Name], this is [Your Name] from EduXperience...',
      type: 'call_script'
    }
  ]);

  const [notes, setNotes] = useState(inquiry?.notes || '');
  const [tags, setTags] = useState<string[]>(['high-priority', 'technical-background', 'evening-batch']);
  const [newTag, setNewTag] = useState('');

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

  const calculateConversionProbability = () => {
    if (!inquiry) return 0;
    
    let score = 0;
    
    // Status scoring
    switch (inquiry.status) {
      case 'new': score += 20; break;
      case 'contacted': score += 40; break;
      case 'interested': score += 70; break;
      case 'admitted': score += 100; break;
      case 'closed': score += 0; break;
    }
    
    // Priority scoring
    switch (inquiry.priority) {
      case 'low': score += 10; break;
      case 'medium': score += 20; break;
      case 'high': score += 30; break;
      case 'urgent': score += 40; break;
    }
    
    // Follow-up history scoring
    if (inquiry.follow_up_history && inquiry.follow_up_history.length > 0) {
      score += Math.min(inquiry.follow_up_history.length * 5, 20);
    }
    
    // Budget range scoring
    if (inquiry.budget_range && inquiry.budget_range.includes('₹20,000')) {
      score += 15;
    }
    
    return Math.min(score, 100);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <div className="hidden lg:block">
            <InstitutionSidebar />
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-700">Loading inquiry details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <div className="hidden lg:block">
            <InstitutionSidebar />
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Inquiry Not Found</h2>
              <p className="text-gray-600 mb-4">The inquiry you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/institution-dashboard/inquiries')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Inquiries
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const conversionProbability = calculateConversionProbability();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <InstitutionSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/institution-dashboard/inquiries')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Inquiries
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inquiry Details</h1>
                    <p className="text-gray-600">Manage and track student inquiry progress</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant="outline" 
                    className={`${
                      inquiry.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      inquiry.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      inquiry.status === 'interested' ? 'bg-purple-100 text-purple-800' :
                      inquiry.status === 'admitted' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    } border`}
                  >
                    {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${
                      inquiry.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                      inquiry.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                      inquiry.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    } border`}
                  >
                    {inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)} Priority
                  </Badge>
                </div>
              </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
                <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="notes">Notes & Tags</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Student Information */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <User className="w-5 h-5 mr-2" />
                          Student Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                              {getInitials(inquiry.student_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{inquiry.student_name}</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span>{inquiry.student_email}</span>
                              </div>
                              {inquiry.student_phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{inquiry.student_phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="w-5 h-5 mr-2" />
                          Parent/Guardian Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
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
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Course Interest & Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Course Interest</Label>
                          <p className="text-blue-600 font-medium">{inquiry.course_interest}</p>
                        </div>
                        {inquiry.preferred_batch_timing && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Preferred Timing</Label>
                            <p className="text-gray-600">{inquiry.preferred_batch_timing}</p>
                          </div>
                        )}
                        {inquiry.budget_range && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Budget Range</Label>
                            <p className="text-green-600 font-medium">{inquiry.budget_range}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Inquiry Message</Label>
                          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm mt-1">
                            {inquiry.message}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Conversion Probability */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Target className="w-5 h-5 mr-2" />
                          Conversion Probability
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {conversionProbability}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${conversionProbability}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {conversionProbability >= 80 ? 'High conversion potential' :
                             conversionProbability >= 60 ? 'Good conversion potential' :
                             conversionProbability >= 40 ? 'Moderate conversion potential' :
                             'Low conversion potential'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <PhoneCall className="w-4 h-4 mr-2" />
                          Call Now
                        </Button>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Send className="w-4 h-4 mr-2" />
                          Send Details
                        </Button>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          <MapPin className="w-4 h-4 mr-2" />
                          Schedule Visit
                        </Button>
                        <Button className="w-full bg-pink-600 hover:bg-pink-700">
                          <Heart className="w-4 h-4 mr-2" />
                          Mark Interested
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Inquiry Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Inquiry Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Source:</span>
                          <span className="capitalize">{inquiry.inquiry_source.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span>{formatDate(inquiry.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Contacted:</span>
                          <span>{inquiry.last_contacted ? getTimeAgo(inquiry.last_contacted) : 'Never'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Follow-up Date:</span>
                          <span>{inquiry.follow_up_date ? formatDate(inquiry.follow_up_date) : 'Not set'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Communication Tab */}
              <TabsContent value="communication" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="w-5 h-5 mr-2" />
                      Communication History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {communicationHistory.map((entry) => (
                        <div key={entry.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            entry.direction === 'inbound' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {entry.type === 'call' && <Phone className="w-5 h-5" />}
                            {entry.type === 'email' && <Mail className="w-5 h-5" />}
                            {entry.type === 'sms' && <MessageSquare className="w-5 h-5" />}
                            {entry.type === 'meeting' && <Calendar className="w-5 h-5" />}
                            {entry.type === 'note' && <FileText className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium capitalize">{entry.type}</span>
                                <Badge variant="outline" className="text-xs">
                                  {entry.direction}
                                </Badge>
                                {entry.duration && (
                                  <span className="text-xs text-gray-500">{entry.duration} min</span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">{getTimeAgo(entry.timestamp)}</span>
                            </div>
                            <p className="text-gray-600 text-sm">{entry.content}</p>
                            {entry.outcome && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs mt-2 ${
                                  entry.outcome === 'interested' ? 'bg-green-100 text-green-800' :
                                  entry.outcome === 'not_interested' ? 'bg-red-100 text-red-800' :
                                  entry.outcome === 'no_answer' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {entry.outcome.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Follow-ups Tab */}
              <TabsContent value="follow-ups" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Follow-up Reminders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {followUpReminders.map((reminder) => (
                        <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${
                              reminder.priority === 'high' ? 'bg-red-500' :
                              reminder.priority === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}></div>
                            <div>
                              <h4 className="font-medium">{reminder.title}</h4>
                              <p className="text-sm text-gray-600">{reminder.description}</p>
                              <p className="text-xs text-gray-500">Due: {formatDate(reminder.dueDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Response Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {responseTemplates.map((template) => (
                        <div key={template.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {template.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{template.content}</p>
                          <div className="flex items-center space-x-2 mt-3">
                            <Button size="sm" variant="outline">
                              <Send className="w-4 h-4 mr-1" />
                              Use Template
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Schedule Callback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="callback-date">Callback Date</Label>
                        <Input type="date" id="callback-date" />
                      </div>
                      <div>
                        <Label htmlFor="callback-time">Callback Time</Label>
                        <Input type="time" id="callback-time" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="callback-notes">Notes</Label>
                      <Textarea 
                        id="callback-notes" 
                        placeholder="Add notes for the callback..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="callback-priority">Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Callback
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes & Tags Tab */}
              <TabsContent value="notes" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this inquiry..."
                        rows={8}
                      />
                      <Button className="mt-4">
                        <Edit className="w-4 h-4 mr-2" />
                        Save Notes
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Tag className="w-5 h-5 mr-2" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="flex items-center space-x-1"
                          >
                            <span>{tag}</span>
                            <button 
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Input 
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add new tag..."
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button onClick={addTag}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
