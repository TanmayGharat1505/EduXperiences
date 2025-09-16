import { supabase } from '@/lib/supabase';

export interface CourseFormData {
  courseName: string;
  category: string;
  description: string;
  duration: string;
  feeStructure: {
    type: 'fixed' | 'monthly' | 'installment';
    amount: number;
    currency: string;
  };
  prerequisites: string[];
  syllabus: File | null;
  certificateDetails: {
    provided: boolean;
    name: string;
    description: string;
  };
  images: File[];
}

export interface InstitutionCourse {
  id: string;
  institution_id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  fee_structure: {
    type: 'fixed' | 'monthly' | 'installment';
    amount: number;
    currency: string;
  };
  prerequisites: string[];
  syllabus_url: string | null;
  certificate_details: {
    provided: boolean;
    name: string;
    description: string;
  };
  images: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Active' | 'Inactive' | 'Draft';
  instructor: string | null;
  students_enrolled: number;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface InstitutionBatch {
  id: string;
  course_id: string;
  batch_name: string;
  start_date: string;
  end_date: string;
  schedule: string;
  max_students: number;
  current_students: number;
  instructor: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  location: string;
  price: number;
  created_at: string;
  updated_at: string;
}

class CourseService {
  // Upload file to Supabase storage
  async uploadFile(file: File, bucket: string, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  }

  // Upload multiple files to Supabase storage
  async uploadFiles(files: File[], bucket: string, folder: string): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${index}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      return this.uploadFile(file, bucket, filePath);
    });

    return Promise.all(uploadPromises);
  }

  // Create a new course
  async createCourse(courseData: CourseFormData, institutionId: string): Promise<InstitutionCourse> {
    try {
      // Upload syllabus if provided
      let syllabusUrl: string | null = null;
      if (courseData.syllabus) {
        const fileExt = courseData.syllabus.name.split('.').pop();
        const fileName = `syllabus-${Date.now()}.${fileExt}`;
        const filePath = `${institutionId}/${fileName}`;
        syllabusUrl = await this.uploadFile(courseData.syllabus, 'institution-course-files', filePath);
      }

      // Upload images if provided
      let imageUrls: string[] = [];
      if (courseData.images.length > 0) {
        imageUrls = await this.uploadFiles(courseData.images, 'institution-course-images', institutionId);
      }

      // Create course record
      const { data, error } = await supabase
        .from('institution_courses')
        .insert({
          institution_id: institutionId,
          title: courseData.courseName,
          description: courseData.description,
          category: courseData.category,
          duration: courseData.duration,
          fee_structure: courseData.feeStructure,
          prerequisites: courseData.prerequisites,
          syllabus_url: syllabusUrl,
          certificate_details: courseData.certificateDetails,
          images: imageUrls,
          level: 'Beginner', // Default level
          status: 'Draft',
          instructor: null, // Will be set later
          students_enrolled: 0,
          rating: 0,
          total_reviews: 0
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create course: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // Get all courses for an institution
  async getCourses(institutionId: string): Promise<InstitutionCourse[]> {
    try {
      const { data, error } = await supabase
        .from('institution_courses')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch courses: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  // Get a single course by ID
  async getCourse(courseId: string): Promise<InstitutionCourse | null> {
    try {
      const { data, error } = await supabase
        .from('institution_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Course not found
        }
        throw new Error(`Failed to fetch course: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  // Update a course
  async updateCourse(courseId: string, courseData: CourseFormData): Promise<InstitutionCourse> {
    try {
      // Get current course to check for existing files
      const currentCourse = await this.getCourse(courseId);
      if (!currentCourse) {
        throw new Error('Course not found');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Handle syllabus upload if new file is provided
      let syllabusUrl = currentCourse.syllabus_url;
      if (courseData.syllabus) {
        const fileExt = courseData.syllabus.name.split('.').pop();
        const fileName = `syllabus-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        syllabusUrl = await this.uploadFile(courseData.syllabus, 'institution-course-files', filePath);
      }

      // Handle new images upload
      let imageUrls = currentCourse.images || [];
      if (courseData.images.length > 0) {
        const newImageUrls = await this.uploadFiles(courseData.images, 'institution-course-images', user.id);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Update course record
      const { data, error } = await supabase
        .from('institution_courses')
        .update({
          title: courseData.courseName,
          description: courseData.description,
          category: courseData.category,
          duration: courseData.duration,
          fee_structure: courseData.feeStructure,
          prerequisites: courseData.prerequisites,
          syllabus_url: syllabusUrl,
          certificate_details: courseData.certificateDetails,
          images: imageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update course: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  // Delete a course
  async deleteCourse(courseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('institution_courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        throw new Error(`Failed to delete course: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Get all batches for an institution
  async getBatches(institutionId: string): Promise<InstitutionBatch[]> {
    try {
      const { data, error } = await supabase
        .from('institution_batches')
        .select(`
          *,
          institution_courses!inner(institution_id)
        `)
        .eq('institution_courses.institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch batches: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  }

  // Create a new batch
  async createBatch(batchData: Omit<InstitutionBatch, 'id' | 'created_at' | 'updated_at'>): Promise<InstitutionBatch> {
    try {
      const { data, error } = await supabase
        .from('institution_batches')
        .insert(batchData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create batch: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  }

  // Update a batch
  async updateBatch(batchId: string, updates: Partial<InstitutionBatch>): Promise<InstitutionBatch> {
    try {
      const { data, error } = await supabase
        .from('institution_batches')
        .update(updates)
        .eq('id', batchId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update batch: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  }

  // Delete a batch
  async deleteBatch(batchId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('institution_batches')
        .delete()
        .eq('id', batchId);

      if (error) {
        throw new Error(`Failed to delete batch: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  }
}

export const courseService = new CourseService();
