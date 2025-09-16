import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StudentInquiry, InquiryFilters, InquiryStats, FollowUpEntry } from '@/types/inquiry';

export function useInquiries() {
  const [inquiries, setInquiries] = useState<StudentInquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<StudentInquiry[]>([]);
  const [stats, setStats] = useState<InquiryStats>({
    total: 0,
    new: 0,
    contacted: 0,
    interested: 0,
    admitted: 0,
    closed: 0,
    this_month: 0,
    conversion_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InquiryFilters>({});

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // TODO: Implement proper inquiry system with dedicated inquiries table
      // For now, we'll return empty inquiries to avoid showing student-tutor conversations
      // as inquiries in the institution dashboard
      
      setInquiries([]);
      calculateStats([]);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const extractCourseInterest = (content: string): string => {
    // Simple extraction logic - in real app, this would be more sophisticated
    const courses = ['Mathematics', 'Science', 'English', 'Computer Science', 'Physics', 'Chemistry', 'Biology'];
    const found = courses.find(course => 
      content.toLowerCase().includes(course.toLowerCase())
    );
    return found || 'General Inquiry';
  };

  // Removed all dummy data generation functions

  const calculateStats = (inquiryList: StudentInquiry[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats: InquiryStats = {
      total: inquiryList.length,
      new: inquiryList.filter(i => i.status === 'new').length,
      contacted: inquiryList.filter(i => i.status === 'contacted').length,
      interested: inquiryList.filter(i => i.status === 'interested').length,
      admitted: inquiryList.filter(i => i.status === 'admitted').length,
      closed: inquiryList.filter(i => i.status === 'closed').length,
      this_month: inquiryList.filter(i => new Date(i.created_at) >= thisMonth).length,
      conversion_rate: inquiryList.length > 0 
        ? (inquiryList.filter(i => i.status === 'admitted').length / inquiryList.length) * 100 
        : 0,
    };

    setStats(stats);
  };

  const applyFilters = (inquiryList: StudentInquiry[], filterOptions: InquiryFilters) => {
    return inquiryList.filter(inquiry => {
      // Course interest filter
      if (filterOptions.course_interest && 
          !inquiry.course_interest.toLowerCase().includes(filterOptions.course_interest.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filterOptions.date_range) {
        const inquiryDate = new Date(inquiry.created_at);
        const startDate = new Date(filterOptions.date_range.start);
        const endDate = new Date(filterOptions.date_range.end);
        if (inquiryDate < startDate || inquiryDate > endDate) {
          return false;
        }
      }

      // Source filter
      if (filterOptions.inquiry_source && filterOptions.inquiry_source !== 'all' && inquiry.inquiry_source !== filterOptions.inquiry_source) {
        return false;
      }

      // Status filter
      if (filterOptions.status && filterOptions.status !== 'all' && inquiry.status !== filterOptions.status) {
        return false;
      }

      // Priority filter
      if (filterOptions.priority && filterOptions.priority !== 'all' && inquiry.priority !== filterOptions.priority) {
        return false;
      }

      // Search filter
      if (filterOptions.search) {
        const searchTerm = filterOptions.search.toLowerCase();
        const searchableText = [
          inquiry.student_name,
          inquiry.student_email,
          inquiry.course_interest,
          inquiry.message,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  };

  const updateFilters = (newFilters: Partial<InquiryFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    const filtered = applyFilters(inquiries, updatedFilters);
    setFilteredInquiries(filtered);
  };

  const clearFilters = () => {
    setFilters({});
    setFilteredInquiries(inquiries);
  };

  const updateInquiryStatus = async (inquiryId: string, status: StudentInquiry['status']) => {
    try {
      // In a real app, this would update the database
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status, updated_at: new Date().toISOString() }
          : inquiry
      ));
      
      // Reapply filters to update filtered list
      const updatedInquiries = inquiries.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status, updated_at: new Date().toISOString() }
          : inquiry
      );
      setFilteredInquiries(applyFilters(updatedInquiries, filters));
      calculateStats(updatedInquiries);
    } catch (err) {
      console.error('Error updating inquiry status:', err);
      setError('Failed to update inquiry status');
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    const filtered = applyFilters(inquiries, filters);
    setFilteredInquiries(filtered);
  }, [inquiries, filters]);

  return {
    inquiries: filteredInquiries,
    allInquiries: inquiries,
    stats,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    updateInquiryStatus,
    refreshInquiries: fetchInquiries,
  };
}
