import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, X, Search } from 'lucide-react';
import { InquiryFilters, InquirySource, InquiryStatus, PriorityLevel } from '@/types/inquiry';

interface InquiryFiltersProps {
  filters: InquiryFilters;
  onFiltersChange: (filters: Partial<InquiryFilters>) => void;
  onClearFilters: () => void;
  totalResults: number;
}

const INQUIRY_SOURCES: { value: InquirySource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'other', label: 'Other' },
];

const INQUIRY_STATUSES: { value: InquiryStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'interested', label: 'Interested', color: 'bg-purple-100 text-purple-800' },
  { value: 'admitted', label: 'Admitted', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
];

const PRIORITY_LEVELS: { value: PriorityLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export function InquiryFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  totalResults 
}: InquiryFiltersProps) {
  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof InquiryFilters];
    return value !== undefined && value !== '';
  });

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.course_interest) count++;
    if (filters.date_range) count++;
    if (filters.inquiry_source) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.search) count++;
    return count;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {totalResults} results
            </span>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, email, course, or message..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Course Interest */}
          <div className="space-y-2">
            <Label htmlFor="course-interest">Course Interest</Label>
            <Input
              id="course-interest"
              placeholder="e.g., Mathematics"
              value={filters.course_interest || ''}
              onChange={(e) => onFiltersChange({ course_interest: e.target.value })}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex space-x-2">
              <Input
                type="date"
                value={filters.date_range?.start || ''}
                onChange={(e) => onFiltersChange({
                  date_range: {
                    start: e.target.value,
                    end: filters.date_range?.end || ''
                  }
                })}
                className="flex-1"
              />
              <Input
                type="date"
                value={filters.date_range?.end || ''}
                onChange={(e) => onFiltersChange({
                  date_range: {
                    start: filters.date_range?.start || '',
                    end: e.target.value
                  }
                })}
                className="flex-1"
              />
            </div>
          </div>

          {/* Inquiry Source */}
          <div className="space-y-2">
            <Label>Source</Label>
            <Select
              value={filters.inquiry_source || ''}
              onValueChange={(value) => onFiltersChange({ 
                inquiry_source: value as InquirySource || undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {INQUIRY_SOURCES.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => onFiltersChange({ 
                status: value as InquiryStatus || undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {INQUIRY_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`} />
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={filters.priority || ''}
              onValueChange={(value) => onFiltersChange({ 
                priority: value as PriorityLevel || undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PRIORITY_LEVELS.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${priority.color.split(' ')[0]}`} />
                      <span>{priority.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Date Filters */}
          <div className="space-y-2">
            <Label>Quick Filters</Label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  onFiltersChange({
                    date_range: {
                      start: weekAgo.toISOString().split('T')[0],
                      end: today.toISOString().split('T')[0]
                    }
                  });
                }}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                  onFiltersChange({
                    date_range: {
                      start: monthAgo.toISOString().split('T')[0],
                      end: today.toISOString().split('T')[0]
                    }
                  });
                }}
              >
                Last 30 days
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Search: {filters.search}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ search: undefined })}
                  />
                </Badge>
              )}
              {filters.course_interest && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Course: {filters.course_interest}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ course_interest: undefined })}
                  />
                </Badge>
              )}
              {filters.inquiry_source && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Source: {INQUIRY_SOURCES.find(s => s.value === filters.inquiry_source)?.label}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ inquiry_source: undefined })}
                  />
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Status: {INQUIRY_STATUSES.find(s => s.value === filters.status)?.label}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ status: undefined })}
                  />
                </Badge>
              )}
              {filters.priority && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Priority: {PRIORITY_LEVELS.find(p => p.value === filters.priority)?.label}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ priority: undefined })}
                  />
                </Badge>
              )}
              {filters.date_range && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>
                    Date: {filters.date_range.start} to {filters.date_range.end}
                  </span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ date_range: undefined })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
