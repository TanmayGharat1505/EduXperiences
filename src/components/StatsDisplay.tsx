import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLandingStats } from '@/hooks/use-landing-stats';
import { TrendingUp, Users, BookOpen, Building2, Award } from 'lucide-react';

interface StatItemProps {
  icon: React.ReactNode;
  number: number;
  label: string;
  isLoading: boolean;
}

function StatItem({ icon, number, label, isLoading }: StatItemProps) {
  const [displayNumber, setDisplayNumber] = useState(0);

  useEffect(() => {
    if (!isLoading && number > 0) {
      // Animate the number counting up
      const duration = 1000; // 1 second
      const steps = 60;
      const increment = number / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
          setDisplayNumber(number);
          clearInterval(timer);
        } else {
          setDisplayNumber(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayNumber(number);
    }
  }, [number, isLoading]);

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-8 w-16 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="text-center group">
      <div className="flex justify-center mb-2">
        <div className="p-2 rounded-full bg-gradient-subtle group-hover:bg-gradient-primary transition-all duration-300">
          {icon}
        </div>
      </div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2 transition-all duration-300">
          {label === 'Success Rate' ? `${displayNumber}%` : formatNumber(displayNumber)}
        </div>
      <div className="text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

export function StatsDisplay() {
  const { stats, isLoading, error, refreshStats, lastUpdated } = useLandingStats();

  const statItems = [
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      number: stats.activeStudents,
      label: 'Active Students'
    },
    {
      icon: <BookOpen className="h-5 w-5 text-secondary" />,
      number: stats.expertTutors,
      label: 'Expert Tutors'
    },
    {
      icon: <Building2 className="h-5 w-5 text-accent" />,
      number: stats.partnerInstitutions,
      label: 'Partner Institutions'
    },
    {
      icon: <Award className="h-5 w-5 text-success" />,
      number: stats.successRate,
      label: 'Success Rate'
    }
  ];



  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Unable to load statistics</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <button
              onClick={() => refreshStats(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {statItems.map((item, index) => (
            <StatItem
              key={index}
              icon={item.icon}
              number={item.number}
              label={item.label}
              isLoading={isLoading}
            />
          ))}
        </div>


        
        {/* Stats info and refresh buttons */}
        <div className="text-center mt-8 space-y-2">
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          
          <div className="flex justify-center gap-2">
            <button
              onClick={() => refreshStats(false)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1 rounded border border-muted-foreground/20 hover:border-primary/40"
            >
              Refresh
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => refreshStats(true)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1 rounded border border-muted-foreground/20 hover:border-primary/40"
              >
                Force Refresh
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
