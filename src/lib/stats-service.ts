import { supabase } from '@/integrations/supabase/client';

export interface LandingPageStats {
  activeStudents: number;
  expertTutors: number;
  partnerInstitutions: number;
  successRate: number;
  totalCourses?: number;
  totalSessions?: number;
  averageRating?: number;
}

export class StatsService {
  private static cache: {
    stats: LandingPageStats | null;
    timestamp: number;
    ttl: number;
  } = {
    stats: null,
    timestamp: 0,
    ttl: 5 * 60 * 1000 // 5 minutes cache
  };

  /**
   * Fetch real-time statistics for the landing page with caching
   */
  static async getLandingPageStats(forceRefresh = false): Promise<LandingPageStats> {
    // Check cache first
    if (!forceRefresh && this.cache.stats && Date.now() - this.cache.timestamp < this.cache.ttl) {
      return this.cache.stats;
    }

    try {
      // Fetch all stats in parallel for better performance
      const [studentsCount, tutorsCount, institutionsCount, successRate, coursesCount, sessionsCount, rating] = await Promise.all([
        this.getActiveStudentsCount(),
        this.getExpertTutorsCount(),
        this.getPartnerInstitutionsCount(),
        this.getSuccessRate(),
        this.getTotalCoursesCount(),
        this.getTotalSessionsCount(),
        this.getAverageRating()
      ]);

      const stats: LandingPageStats = {
        activeStudents: studentsCount,
        expertTutors: tutorsCount,
        partnerInstitutions: institutionsCount,
        successRate: successRate,
        totalCourses: coursesCount,
        totalSessions: sessionsCount,
        averageRating: rating
      };

      // Update cache
      this.cache.stats = stats;
      this.cache.timestamp = Date.now();

      return stats;
    } catch (error) {
      console.error('Error fetching landing page stats:', error);
      
      // Return cached data if available, otherwise return defaults
      if (this.cache.stats) {
        return this.cache.stats;
      }
      
      return {
        activeStudents: 0,
        expertTutors: 0,
        partnerInstitutions: 0,
        successRate: 0
      };
    }
  }

  /**
   * Get count of active students
   */
  private static async getActiveStudentsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      if (error) {
        console.error('Error fetching students count:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('Error fetching students count:', error);
      return 0;
    }
  }

  /**
   * Get count of expert tutors (verified tutors)
   */
  private static async getExpertTutorsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('tutor_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching tutors count:', error);
      return 0;
    }
  }

  /**
   * Get count of partner institutions (institution role users)
   */
  private static async getPartnerInstitutionsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'institution');

      if (error) {
        console.error('Error fetching institutions count:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('Error fetching institutions count:', error);
      return 0;
    }
  }

  /**
   * Calculate success rate based on verified profiles and other metrics
   */
  private static async getSuccessRate(): Promise<number> {
    try {
      // Try to get success rate from reviews first
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating');

      if (!reviewsError && reviews && reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = totalRating / reviews.length;
        return Math.round((averageRating / 5) * 100);
      }

      // Fallback to verification-based calculation
      const [verifiedTutors, institutionProfiles] = await Promise.all([
        supabase
          .from('tutor_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('verified', true),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'institution')
      ]);

      const totalVerified = (verifiedTutors.count || 0) + (institutionProfiles.count || 0);
      const totalProfiles = await this.getTotalProfilesCount();

      if (totalProfiles === 0) return 0;
      
      return Math.round((totalVerified / totalProfiles) * 100);
    } catch (error) {
      console.error('Error calculating success rate:', error);
      return 0;
    }
  }

  /**
   * Get total count of all profiles
   */
  private static async getTotalProfilesCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching total profiles count:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('Error fetching total profiles count:', error);
      return 0;
    }
  }

  /**
   * Get total courses count
   */
  private static async getTotalCoursesCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching courses count:', error);
      return 0;
    }
  }

  /**
   * Get total sessions count
   */
  private static async getTotalSessionsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching sessions count:', error);
      return 0;
    }
  }

  /**
   * Get average rating from reviews
   */
  private static async getAverageRating(): Promise<number> {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating');

      if (error || !reviews || reviews.length === 0) return 0;

      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      return Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error('Error fetching average rating:', error);
      return 0;
    }
  }

  /**
   * Clear the cache to force a fresh fetch
   */
  static clearCache(): void {
    this.cache.stats = null;
    this.cache.timestamp = 0;
  }

  /**
   * Get enhanced success rate based on actual metrics
   */
  static async getEnhancedSuccessRate(): Promise<number> {
    try {
      // This is a placeholder for future enhancement
      // You can implement actual business logic here
      
      // Example: Calculate based on reviews, session completion, etc.
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating');

      if (reviewsError) throw reviewsError;

      if (!reviews || reviews.length === 0) {
        return await this.getSuccessRate(); // Fallback to basic calculation
      }

      // Calculate average rating and convert to success rate
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = totalRating / reviews.length;
      
      // Convert 1-5 rating to 0-100 percentage
      return Math.round((averageRating / 5) * 100);
    } catch (error) {
      console.error('Error calculating enhanced success rate:', error);
      return await this.getSuccessRate(); // Fallback to basic calculation
    }
  }
}
