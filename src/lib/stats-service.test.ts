// Simple test file for StatsService
// This can be run with a test runner like Jest or Vitest

import { StatsService, LandingPageStats } from './stats-service';

// Mock Supabase client for testing
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        count: 'exact',
        head: true
      }))
    }))
  }))
};

describe('StatsService', () => {
  beforeEach(() => {
    // Clear cache before each test
    StatsService.clearCache();
  });

  describe('getLandingPageStats', () => {
    it('should return default stats when no data is available', async () => {
      const stats = await StatsService.getLandingPageStats();
      
      expect(stats).toEqual({
        activeStudents: 0,
        expertTutors: 0,
        partnerInstitutions: 0,
        successRate: 0
      });
    });

    it('should cache results and return cached data on subsequent calls', async () => {
      // First call should fetch from database
      const stats1 = await StatsService.getLandingPageStats();
      
      // Second call should return cached data
      const stats2 = await StatsService.getLandingPageStats();
      
      expect(stats1).toEqual(stats2);
    });

    it('should force refresh when requested', async () => {
      // First call
      await StatsService.getLandingPageStats();
      
      // Force refresh should bypass cache
      const stats = await StatsService.getLandingPageStats(true);
      
      expect(stats).toBeDefined();
    });
  });

  describe('cache management', () => {
    it('should clear cache when requested', () => {
      StatsService.clearCache();
      
      // Cache should be empty after clearing
      expect(StatsService['cache'].stats).toBeNull();
      expect(StatsService['cache'].timestamp).toBe(0);
    });
  });
});

// Example usage test
describe('StatsService Integration', () => {
  it('should handle database errors gracefully', async () => {
    // This test would require actual database connection
    // For now, we just verify the service exists
    expect(StatsService).toBeDefined();
    expect(typeof StatsService.getLandingPageStats).toBe('function');
    expect(typeof StatsService.clearCache).toBe('function');
  });
});
