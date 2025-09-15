import React, { useState } from 'react';
import { InstitutionSidebar } from '@/components/layout/InstitutionSidebar';
import { InquiryFiltersComponent } from '@/components/inquiries/InquiryFilters';
import { InquiryStats } from '@/components/inquiries/InquiryStats';
import { InquiryList } from '@/components/inquiries/InquiryList';
import { InquiryGridView } from '@/components/inquiries/InquiryGridView';
import { InquiryDetailModal } from '@/components/inquiries/InquiryDetailModal';
import { useInquiries } from '@/hooks/useInquiries';
import { StudentInquiry } from '@/types/inquiry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Download, 
  RefreshCw, 
  Plus,
  Menu,
  Building2,
  AlertCircle,
  Loader2,
  Search,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Eye,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Filter,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export default function InquiryDashboard() {
  const {
    inquiries,
    allInquiries,
    stats,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    updateInquiryStatus,
    refreshInquiries,
  } = useInquiries();

  const [selectedInquiry, setSelectedInquiry] = useState<StudentInquiry | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Calculate active filter count
  const activeFilterCount = Object.values(filters).filter(f => 
    f !== undefined && f !== '' && !(f instanceof Object && !f.from && !f.to)
  ).length;

  const handleViewDetails = (inquiry: StudentInquiry) => {
    setSelectedInquiry(inquiry);
  };

  const handleStatusUpdate = async (inquiryId: string, status: StudentInquiry['status']) => {
    await updateInquiryStatus(inquiryId, status);
  };

  const handleExportInquiries = () => {
    // TODO: Implement CSV export functionality
    console.log('Export inquiries to CSV');
  };

  const handleNotesUpdate = (inquiryId: string, notes: string) => {
    // TODO: Implement notes update functionality
    console.log('Update notes for inquiry:', inquiryId, notes);
  };

  const handlePriorityUpdate = (inquiryId: string, priority: StudentInquiry['priority']) => {
    // TODO: Implement priority update functionality
    console.log('Update priority for inquiry:', inquiryId, priority);
  };

  const handleCallNow = (inquiry: StudentInquiry) => {
    // TODO: Implement call functionality (could integrate with phone system)
    console.log('Calling now:', inquiry.student_name, inquiry.student_phone || inquiry.parent_phone);
    // For now, we'll just show an alert with the phone number
    const phoneNumber = inquiry.student_phone || inquiry.parent_phone;
    if (phoneNumber) {
      alert(`Calling ${inquiry.student_name} at ${phoneNumber}`);
    } else {
      alert(`No phone number available for ${inquiry.student_name}`);
    }
  };

  const handleSendDetails = (inquiry: StudentInquiry) => {
    // TODO: Implement send details functionality (email/SMS)
    console.log('Sending details to:', inquiry.student_name, inquiry.student_email);
    alert(`Sending course details to ${inquiry.student_name} at ${inquiry.student_email}`);
  };

  const handleScheduleVisit = (inquiry: StudentInquiry) => {
    // TODO: Implement schedule visit functionality
    console.log('Scheduling visit for:', inquiry.student_name);
    alert(`Scheduling campus visit for ${inquiry.student_name}`);
  };

  const handleMarkInterested = (inquiry: StudentInquiry) => {
    // Update status to interested
    updateInquiryStatus(inquiry.id, 'interested');
    console.log('Marked as interested:', inquiry.student_name);
  };

  const handleConvertToAdmission = (inquiry: StudentInquiry) => {
    // Update status to admitted
    updateInquiryStatus(inquiry.id, 'admitted');
    console.log('Converted to admission:', inquiry.student_name);
    alert(`Congratulations! ${inquiry.student_name} has been converted to admission.`);
  };

  const handleNotSuitable = (inquiry: StudentInquiry) => {
    // Update status to closed with reason
    updateInquiryStatus(inquiry.id, 'closed');
    console.log('Marked as not suitable:', inquiry.student_name);
    alert(`${inquiry.student_name} has been marked as not suitable for admission.`);
  };

  // Filter and sort inquiries
  const filteredAndSortedInquiries = React.useMemo(() => {
    let filtered = inquiries;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inquiry => 
        inquiry.student_name.toLowerCase().includes(query) ||
        inquiry.student_email.toLowerCase().includes(query) ||
        inquiry.course_interest.toLowerCase().includes(query) ||
        inquiry.message.toLowerCase().includes(query) ||
        (inquiry.parent_name && inquiry.parent_name.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'student_name':
          aValue = a.student_name.toLowerCase();
          bValue = b.student_name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [inquiries, searchQuery, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <div className="hidden lg:block">
            <InstitutionSidebar />
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-600">Loading inquiries...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <div className="hidden lg:block">
            <InstitutionSidebar />
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={refreshInquiries} variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block">
          <InstitutionSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Mobile Navigation Header */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Student Inquiries</h1>
                    <p className="text-xs text-gray-500">Institution Portal</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Page Header */}
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Student Inquiries</h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Manage and track student inquiries from various sources
                  </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshInquiries}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportInquiries}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Inquiry
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8">
              <InquiryStats stats={stats} loading={loading} />
            </div>

            {/* Search and Filter Bar */}
            <Card className="mb-6 shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search inquiries by name, email, course, or message..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Sort and View Controls */}
                  <div className="flex items-center space-x-3">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Date Created</SelectItem>
                        <SelectItem value="student_name">Student Name</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </Button>
                    
                    <div className="flex border rounded-lg">
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-r-none"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-l-none"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-2 bg-blue-600 text-white">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <div className="mt-6 pt-6 border-t">
                    <InquiryFiltersComponent
                      filters={filters}
                      onFiltersChange={updateFilters}
                      onClearFilters={clearFilters}
                      activeFilterCount={activeFilterCount}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {filteredAndSortedInquiries.length} {filteredAndSortedInquiries.length === 1 ? 'Inquiry' : 'Inquiries'}
                  </h2>
                  {searchQuery && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Filtered by: "{searchQuery}"
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Showing {filteredAndSortedInquiries.length} of {inquiries.length} total
                </div>
              </div>
            </div>

            {/* Inquiry List/Grid */}
            {viewMode === 'list' ? (
              <InquiryList
                inquiries={filteredAndSortedInquiries}
                loading={loading}
                onStatusUpdate={handleStatusUpdate}
                onViewDetails={handleViewDetails}
                onPriorityUpdate={handlePriorityUpdate}
                onCallNow={handleCallNow}
                onSendDetails={handleSendDetails}
                onScheduleVisit={handleScheduleVisit}
                onMarkInterested={handleMarkInterested}
                onConvertToAdmission={handleConvertToAdmission}
                onNotSuitable={handleNotSuitable}
              />
            ) : (
              <InquiryGridView
                inquiries={filteredAndSortedInquiries}
                loading={loading}
                onStatusUpdate={handleStatusUpdate}
                onViewDetails={handleViewDetails}
                onPriorityUpdate={handlePriorityUpdate}
                onCallNow={handleCallNow}
                onSendDetails={handleSendDetails}
                onScheduleVisit={handleScheduleVisit}
                onMarkInterested={handleMarkInterested}
                onConvertToAdmission={handleConvertToAdmission}
                onNotSuitable={handleNotSuitable}
              />
            )}

            {/* Empty State */}
            {filteredAndSortedInquiries.length === 0 && !loading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
                  <p className="text-gray-500 mb-4">
                    {Object.keys(filters).length > 0 
                      ? "No inquiries match your current filters. Try adjusting your search criteria."
                      : "No student inquiries have been received yet. They will appear here when students contact your institution."
                    }
                  </p>
                  {Object.keys(filters).length > 0 && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      <InquiryDetailModal
        inquiry={selectedInquiry}
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        onStatusUpdate={handleStatusUpdate}
        onPriorityUpdate={handlePriorityUpdate}
        onNotesUpdate={handleNotesUpdate}
      />
    </div>
  );
}
