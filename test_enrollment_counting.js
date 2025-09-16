// Test script to verify enrollment counting logic
// This can be run in the browser console to test the enrollment queries

async function testEnrollmentCounting() {
  console.log('🧪 Testing enrollment counting logic...');
  
  try {
    // Test 1: Get all institution courses
    const { data: courses, error: coursesError } = await supabase
      .from('institution_courses')
      .select('id, title, institution_id')
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError);
      return;
    }

    console.log('📚 Found courses:', courses);

    // Test 2: For each course, count enrollments
    for (const course of courses) {
      console.log(`\n🔍 Checking course: ${course.title} (ID: ${course.id})`);
      
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('id, student_id, status')
        .eq('course_id', course.id)
        .eq('status', 'enrolled');

      if (enrollmentError) {
        console.error(`❌ Error fetching enrollments for ${course.title}:`, enrollmentError);
        continue;
      }

      console.log(`✅ Found ${enrollments?.length || 0} enrollments for ${course.title}`);
      
      if (enrollments && enrollments.length > 0) {
        console.log('📋 Enrollment details:', enrollments);
      }
    }

    // Test 3: Check for the specific "Fundamentals of Cloud Computing" course
    const cloudCourse = courses.find(c => 
      c.title.toLowerCase().includes('cloud') || 
      c.title.toLowerCase().includes('fundamentals')
    );

    if (cloudCourse) {
      console.log(`\n☁️ Found cloud computing course: ${cloudCourse.title}`);
      
      const { data: cloudEnrollments, error: cloudError } = await supabase
        .from('course_enrollments')
        .select('id, student_id, status, enrolled_at')
        .eq('course_id', cloudCourse.id)
        .eq('status', 'enrolled');

      if (cloudError) {
        console.error('❌ Error fetching cloud course enrollments:', cloudError);
      } else {
        console.log(`✅ Cloud course has ${cloudEnrollments?.length || 0} enrollments`);
        if (cloudEnrollments && cloudEnrollments.length > 0) {
          console.log('📋 Cloud course enrollment details:', cloudEnrollments);
        }
      }
    } else {
      console.log('❌ Cloud computing course not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEnrollmentCounting();
