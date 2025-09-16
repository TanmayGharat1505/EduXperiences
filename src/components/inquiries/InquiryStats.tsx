import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  UserCheck, 
  TrendingUp, 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { InquiryStats as InquiryStatsType } from '@/types/inquiry';

interface InquiryStatsProps {
  stats: InquiryStatsType;
  loading?: boolean;
}

export function InquiryStats({ stats, loading = false }: InquiryStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Inquiries',
      value: stats.total,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All time inquiries'
    },
    {
      title: 'New This Month',
      value: stats.this_month,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Inquiries this month'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversion_rate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Inquiry to admission'
    },
    {
      title: 'Active Inquiries',
      value: stats.total - stats.closed,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Not closed yet'
    }
  ];

  const statusCards = [
    {
      title: 'New',
      value: stats.new,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Contacted',
      value: stats.contacted,
      icon: MessageSquare,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Interested',
      value: stats.interested,
      icon: AlertCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Admitted',
      value: stats.admitted,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      title: 'Closed',
      value: stats.closed,
      icon: UserCheck,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200'
    }
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <Card className="shadow-md border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {statusCards.map((status, index) => {
              const Icon = status.icon;
              const percentage = stats.total > 0 ? (status.value / stats.total) * 100 : 0;
              
              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 ${status.bgColor} ${status.borderColor} border-2 rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-8 h-8 ${status.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{status.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{status.value}</p>
                  <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
