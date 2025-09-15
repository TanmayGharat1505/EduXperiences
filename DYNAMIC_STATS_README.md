# Dynamic Landing Page Statistics

This document explains how the EduXperience landing page now displays real-time statistics fetched from the database instead of static placeholder values.

## Overview

The landing page statistics are now dynamically fetched from your Supabase database, providing visitors with accurate, up-to-date information about your platform's usage and success metrics.

## Features

### Real-Time Statistics
- **Active Students**: Count of registered student profiles
- **Expert Tutors**: Count of verified tutor profiles
- **Partner Institutions**: Count of verified institution profiles
- **Success Rate**: Calculated based on reviews or verification status
- **Total Courses**: Number of available courses (if available)
- **Total Sessions**: Number of completed sessions (if available)
- **Average Rating**: Average rating from student reviews (if available)

### Smart Caching
- 5-minute cache to reduce database queries
- Force refresh option for immediate updates
- Graceful fallback to cached data on errors

### Enhanced User Experience
- Smooth number counting animations
- Loading skeletons during data fetch
- Error handling with retry options
- Last updated timestamp display

## Implementation Details

### Files Created/Modified

1. **`src/lib/stats-service.ts`** - Core service for fetching statistics
2. **`src/hooks/use-landing-stats.ts`** - React hook for managing stats state
3. **`src/components/StatsDisplay.tsx`** - Landing page stats component
4. **`src/components/admin/StatsManager.tsx`** - Admin dashboard stats manager
5. **`src/pages/Home.tsx`** - Updated to use dynamic stats
6. **`src/pages/AdminDashboard.tsx`** - Added Stats tab

### Database Queries

The system queries the following tables:
- `profiles` - For student and tutor counts
- `tutor_profiles` - For verified tutor counts
- `institution_profiles` - For verified institution counts
- `reviews` - For ratings and success calculations
- `courses` - For course counts (if available)
- `classes` - For session counts (if available)

## Usage

### For Visitors
Statistics are automatically displayed on the landing page and update every 5 minutes.

### For Developers
```typescript
import { useLandingStats } from '@/hooks/use-landing-stats';

function MyComponent() {
  const { stats, isLoading, error, refreshStats } = useLandingStats();
  
  // Access individual stats
  console.log(stats.activeStudents);
  console.log(stats.expertTutors);
  
  // Refresh stats
  await refreshStats(); // Normal refresh
  await refreshStats(true); // Force refresh
}
```

### For Admins
1. Navigate to Admin Dashboard
2. Click on the "Stats" tab
3. View real-time statistics
4. Use refresh buttons to update data
5. Monitor cache status and last update times

## Configuration

### Cache Duration
Modify the cache TTL in `StatsService`:
```typescript
private static cache = {
  stats: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 minutes - adjust as needed
};
```

### Success Rate Calculation
The success rate can be calculated in multiple ways:
1. **Reviews-based**: Average rating converted to percentage
2. **Verification-based**: Percentage of verified profiles
3. **Custom metrics**: Extend the service for your business logic

## Customization

### Adding New Statistics
1. Extend the `LandingPageStats` interface
2. Add the calculation method in `StatsService`
3. Update the `StatsDisplay` component to show the new stat
4. Add it to the admin dashboard if needed

### Modifying Calculations
Edit the private methods in `StatsService`:
- `getActiveStudentsCount()`
- `getExpertTutorsCount()`
- `getPartnerInstitutionsCount()`
- `getSuccessRate()`
- `getTotalCoursesCount()`
- `getTotalSessionsCount()`
- `getAverageRating()`

## Performance Considerations

- Statistics are fetched in parallel for better performance
- 5-minute cache reduces database load
- Lazy loading of additional stats (courses, sessions, ratings)
- Error handling prevents page crashes

## Troubleshooting

### Common Issues

1. **Stats not updating**
   - Check if cache is enabled
   - Use force refresh option
   - Verify database connectivity

2. **Missing statistics**
   - Ensure database tables exist
   - Check RLS policies
   - Verify user permissions

3. **Performance issues**
   - Reduce cache TTL
   - Optimize database queries
   - Implement pagination for large datasets

### Debug Mode
In development, additional controls are available:
- Force refresh button
- Cache status indicators
- Detailed error messages

## Future Enhancements

- Real-time updates using Supabase subscriptions
- Advanced analytics and trend analysis
- Custom metric definitions
- Export functionality for reports
- Integration with external analytics tools

## Support

For issues or questions about the dynamic stats system:
1. Check the browser console for errors
2. Verify database table structures
3. Test with the admin dashboard
4. Review the Supabase logs
