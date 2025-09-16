import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DatabaseCheck() {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkTables = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if courses table exists
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id')
        .limit(1);
      
      if (coursesError) {
        console.log('Courses table error:', coursesError);
      } else {
        console.log('Courses table exists, sample data:', coursesData);
      }

      // Check if profiles table exists
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .limit(1);
      
      if (profilesError) {
        console.log('Profiles table error:', profilesError);
      } else {
        console.log('Profiles table exists, sample data:', profilesData);
      }

      // Check if tutor_profiles table exists
      const { data: tutorProfilesData, error: tutorProfilesError } = await supabase
        .from('tutor_profiles')
        .select('id, user_id')
        .limit(1);
      
      if (tutorProfilesError) {
        console.log('Tutor profiles table error:', tutorProfilesError);
      } else {
        console.log('Tutor profiles table exists, sample data:', tutorProfilesData);
      }

      // Check if messages table exists
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .limit(1);
      
      if (messagesError) {
        console.log('Messages table error:', messagesError);
      } else {
        console.log('Messages table exists, sample data:', messagesData);
      }

      // Check if classes table exists
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .limit(1);
      
      if (classesError) {
        console.log('Classes table error:', classesError);
      } else {
        console.log('Classes table exists, sample data:', classesData);
      }

      // Check if learning_records table exists
      const { data: learningRecordsData, error: learningRecordsError } = await supabase
        .from('learning_records')
        .select('id')
        .limit(1);
      
      if (learningRecordsError) {
        console.log('Learning records table error:', learningRecordsError);
      } else {
        console.log('Learning records table exists, sample data:', learningRecordsData);
      }

      // Check if course_enrollments table exists
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select('id')
        .limit(1);
      
      if (enrollmentsError) {
        console.log('Course enrollments table error:', enrollmentsError);
      } else {
        console.log('Course enrollments table exists, sample data:', enrollmentsData);
      }

      setTables(['courses', 'profiles', 'tutor_profiles', 'messages', 'classes', 'learning_records', 'course_enrollments']);
      
    } catch (err) {
      console.error('Error checking tables:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Database Table Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkTables} disabled={loading}>
          {loading ? 'Checking...' : 'Check Database Tables'}
        </Button>
        
        {error && (
          <div className="text-red-600 text-sm">
            Error: {error}
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          Check the browser console for detailed table information.
        </div>
        
        <div className="text-sm">
          <strong>Tables to check:</strong>
          <ul className="list-disc list-inside mt-2">
            {tables.map(table => (
              <li key={table}>{table}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
