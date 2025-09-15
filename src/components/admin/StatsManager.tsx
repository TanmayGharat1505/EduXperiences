import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLandingStats } from '@/hooks/use-landing-stats';
import { StatsService } from '@/lib/stats-service';
import { RefreshCw, TrendingUp, Users, BookOpen, Building2, Award } from 'lucide-react';

export function StatsManager() {
  const { stats, isLoading, error, refreshStats, lastUpdated } = useLandingStats();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async (forceRefresh = false) => {
    setIsRefreshing(true);
    try {
      await refreshStats(forceRefresh);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearCache = () => {
    StatsService.clearCache();
    handleRefresh(true);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number) => {
    return `${num}%`;
  };



  const mainStats = [
    {
      icon: <Users className="h-6 w-6" />,
      label: 'Active Students',
      value: stats.activeStudents,
      formatter: formatNumber,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      label: 'Expert Tutors',
      value: stats.expertTutors,
      formatter: formatNumber,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      label: 'Partner Institutions',
      value: stats.partnerInstitutions,
      formatter: formatNumber,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: <Award className="h-6 w-6" />,
      label: 'Success Rate',
      value: stats.successRate,
      formatter: formatPercentage,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Landing Page Statistics
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRefresh(false)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRefresh(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Force Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                disabled={isRefreshing}
              >
                Clear Cache
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Error loading statistics</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={() => handleRefresh(true)}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Core Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mainStats.map((stat, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${stat.bgColor} ${stat.color}`}
                    >
                      <div className="flex items-center gap-3">
                        {stat.icon}
                        <div>
                          <p className="text-sm font-medium opacity-80">{stat.label}</p>
                          <p className="text-2xl font-bold">
                            {isLoading ? '...' : stat.formatter(stat.value)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>



              {/* Status Indicators */}
              <div className="flex flex-wrap gap-2">
                <Badge variant={isLoading ? "secondary" : "default"}>
                  {isLoading ? "Loading..." : "Ready"}
                </Badge>
                <Badge variant="outline">
                  Cache: {StatsService['cache'].stats ? 'Active' : 'Empty'}
                </Badge>
                {lastUpdated && (
                  <Badge variant="outline">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
