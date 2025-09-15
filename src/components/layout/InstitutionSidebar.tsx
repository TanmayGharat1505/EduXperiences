import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitutionDashboard } from '@/hooks/useInstitutionDashboard';
import { cn } from '@/lib/utils';
import { 
  Home,
  MessageSquare,
  Users,
  BookOpen,
  UserCheck,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

interface InstitutionSidebarProps {
  className?: string;
}

export function InstitutionSidebar({ className }: InstitutionSidebarProps) {
  const { stats } = useInstitutionDashboard();
  const navigate = useNavigate();

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/institution-dashboard'
    },
    {
      id: 'inquiries',
      label: 'Student Inquiries',
      icon: MessageSquare,
      href: '/institution-dashboard/inquiries',
      badge: stats.newInquiries
    },
    {
      id: 'students',
      label: 'My Students',
      icon: Users,
      href: '/institution/students'
    },
    {
      id: 'courses',
      label: 'Courses & Batches',
      icon: BookOpen,
      href: '/institution/courses'
    },
    {
      id: 'faculty',
      label: 'Faculty Management',
      icon: UserCheck,
      href: '/institution/faculty'
    },
    {
      id: 'admissions',
      label: 'Admissions',
      icon: FileText,
      href: '/institution/admissions'
    },
    {
      id: 'fees',
      label: 'Fee Management',
      icon: DollarSign,
      href: '/institution/fees'
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      href: '/institution/reports'
    },
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: Settings,
      href: '/institution/profile'
    },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <div className={cn(
      "w-64 bg-white border-r border-gray-200 h-full flex flex-col",
      className
    )}>
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">EduXperience</h1>
            <p className="text-xs text-gray-500">Institution Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                "hover:bg-gray-100 hover:text-gray-900",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "text-gray-700"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>© 2024 EduXperience</p>
          <p>Institution Portal v1.0</p>
        </div>
      </div>
    </div>
  );
}
