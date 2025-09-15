import { useState, useEffect } from 'react';
import { StatsService, LandingPageStats } from '@/lib/stats-service';

export interface UseLandingStatsReturn {
  stats: LandingPageStats;
  isLoading: boolean;
  error: string | null;
  refreshStats: (forceRefresh?: boolean) => Promise<void>;
  lastUpdated: Date | null;
}

export function useLandingStats(): UseLandingStatsReturn {
  const [stats, setStats] = useState<LandingPageStats>({
    activeStudents: 0,
    expertTutors: 0,
    partnerInstitutions: 0,
    successRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedStats = await StatsService.getLandingPageStats(forceRefresh);
      setStats(fetchedStats);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      console.error('Error in useLandingStats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async (forceRefresh = false) => {
    await fetchStats(forceRefresh);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refreshStats,
    lastUpdated
  };
}
