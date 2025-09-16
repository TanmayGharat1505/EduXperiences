export interface StudentInquiry {
  id: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  course_interest: string;
  preferred_batch_timing?: string;
  budget_range?: string;
  inquiry_source: InquirySource;
  status: InquiryStatus;
  priority: PriorityLevel;
  message: string;
  created_at: string;
  updated_at: string;
  last_contacted?: string;
  notes?: string;
  assigned_to?: string;
  follow_up_date?: string;
  follow_up_history?: FollowUpEntry[];
}

export interface FollowUpEntry {
  id: string;
  date: string;
  type: 'call' | 'email' | 'sms' | 'meeting' | 'other';
  notes: string;
  outcome: 'no_answer' | 'answered' | 'interested' | 'not_interested' | 'callback_requested' | 'other';
  next_action?: string;
  created_by: string;
}

export type InquirySource = 
  | 'website'
  | 'phone'
  | 'email'
  | 'social_media'
  | 'referral'
  | 'walk_in'
  | 'advertisement'
  | 'other';

export type InquiryStatus = 
  | 'new'
  | 'contacted'
  | 'interested'
  | 'admitted'
  | 'closed';

export type PriorityLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface InquiryFilters {
  course_interest?: string;
  date_range?: {
    start: string;
    end: string;
  };
  inquiry_source?: InquirySource;
  status?: InquiryStatus;
  priority?: PriorityLevel;
  search?: string;
}

export interface InquiryStats {
  total: number;
  new: number;
  contacted: number;
  interested: number;
  admitted: number;
  closed: number;
  this_month: number;
  conversion_rate: number;
}
