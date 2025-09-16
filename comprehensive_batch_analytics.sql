-- Comprehensive Batch Analytics Dashboard
-- This script displays detailed information about all institution batches

-- 1. Basic Batch Information with Course Details
SELECT 
    'Basic Batch Information' as section,
    b.id as batch_id,
    b.batch_name,
    c.title as course_name,
    c.category as course_category,
    b.start_date,
    b.end_date,
    b.class_timings,
    b.days_of_week,
    b.max_capacity,
    b.assigned_faculty,
    b.classroom_assignment,
    b.status,
    b.price,
    b.created_at
FROM institution_batches b
LEFT JOIN institution_courses c ON b.course_id = c.id
ORDER BY b.created_at DESC;

-- 2. Student Count vs Capacity Analysis
SELECT 
    'Student Capacity Analysis' as section,
    b.batch_name,
    c.title as course_name,
    b.max_capacity,
    COUNT(ce.id) as enrolled_students,
    (b.max_capacity - COUNT(ce.id)) as available_slots,
    ROUND((COUNT(ce.id)::float / b.max_capacity::float) * 100, 2) as capacity_utilization_percentage,
    CASE 
        WHEN COUNT(ce.id) = 0 THEN 'No Enrollments'
        WHEN COUNT(ce.id) < b.max_capacity * 0.5 THEN 'Low Enrollment'
        WHEN COUNT(ce.id) < b.max_capacity * 0.8 THEN 'Moderate Enrollment'
        WHEN COUNT(ce.id) < b.max_capacity THEN 'High Enrollment'
        ELSE 'Full Capacity'
    END as enrollment_status
FROM institution_batches b
LEFT JOIN institution_courses c ON b.course_id = c.id
LEFT JOIN course_enrollments ce ON b.id = ce.batch_id AND ce.status = 'enrolled'
GROUP BY b.id, b.batch_name, c.title, b.max_capacity
ORDER BY capacity_utilization_percentage DESC;

-- 3. Faculty Assignment and Schedule Overview
SELECT 
    'Faculty and Schedule Overview' as section,
    b.batch_name,
    c.title as course_name,
    b.assigned_faculty,
    b.class_timings,
    b.days_of_week,
    b.classroom_assignment,
    b.start_date,
    b.end_date,
    EXTRACT(DAYS FROM (b.end_date - b.start_date)) as duration_days,
    CASE 
        WHEN b.status = 'Active' THEN 'Currently Running'
        WHEN b.status = 'Completed' THEN 'Finished'
        WHEN b.status = 'Scheduled' THEN 'Upcoming'
        ELSE 'Unknown Status'
    END as batch_status
FROM institution_batches b
LEFT JOIN institution_courses c ON b.course_id = c.id
ORDER BY b.start_date DESC;

-- 4. Performance Metrics and Revenue Analysis
SELECT 
    'Performance and Revenue Analysis' as section,
    b.batch_name,
    c.title as course_name,
    b.price as batch_price,
    COUNT(ce.id) as total_enrollments,
    COUNT(CASE WHEN ce.status = 'enrolled' THEN 1 END) as active_enrollments,
    COUNT(CASE WHEN ce.status = 'completed' THEN 1 END) as completed_enrollments,
    COUNT(CASE WHEN ce.status = 'dropped' THEN 1 END) as dropped_enrollments,
    ROUND((COUNT(CASE WHEN ce.status = 'completed' THEN 1 END)::float / 
           NULLIF(COUNT(ce.id), 0)) * 100, 2) as completion_rate_percentage,
    (b.price * COUNT(CASE WHEN ce.status = 'enrolled' THEN 1 END)) as potential_revenue,
    (b.price * COUNT(CASE WHEN ce.status = 'completed' THEN 1 END)) as realized_revenue
FROM institution_batches b
LEFT JOIN institution_courses c ON b.course_id = c.id
LEFT JOIN course_enrollments ce ON b.id = ce.batch_id
GROUP BY b.id, b.batch_name, c.title, b.price
ORDER BY potential_revenue DESC;

-- 5. Student Attendance Rates (if attendance tracking exists)
SELECT 
    'Attendance Analysis' as section,
    b.batch_name,
    c.title as course_name,
    COUNT(DISTINCT ce.student_id) as total_students,
    COUNT(CASE WHEN ce.status = 'enrolled' THEN 1 END) as active_students,
    -- Note: This assumes attendance data exists in a separate table
    -- You may need to adjust based on your actual attendance tracking system
    'Attendance data not available' as attendance_note
FROM institution_batches b
LEFT JOIN institution_courses c ON b.course_id = c.id
LEFT JOIN course_enrollments ce ON b.id = ce.batch_id
GROUP BY b.id, b.batch_name, c.title
ORDER BY total_students DESC;

-- 6. Batch-wise Revenue Summary
SELECT 
    'Revenue Summary' as section,
    b.batch_name,
    c.title as course_name,
    b.price as price_per_student,
    COUNT(CASE WHEN ce.status = 'enrolled' THEN 1 END) as enrolled_students,
    COUNT(CASE WHEN ce.status = 'completed' THEN 1 END) as completed_students,
    (b.price * COUNT(CASE WHEN ce.status = 'enrolled' THEN 1 END)) as total_potential_revenue,
    (b.price * COUNT(CASE WHEN ce.status = 'completed' THEN 1 END)) as realized_revenue,
    ROUND((COUNT(CASE WHEN ce.status = 'completed' THEN 1 END)::float / 
           NULLIF(COUNT(CASE WHEN ce.status = 'enrolled' THEN 1 END), 0)) * 100, 2) as revenue_realization_rate
FROM institution_batches b
LEFT JOIN institution_courses c ON b.course_id = c.id
LEFT JOIN course_enrollments ce ON b.id = ce.batch_id
GROUP BY b.id, b.batch_name, c.title, b.price
ORDER BY total_potential_revenue DESC;

-- 7. Overall Institution Batch Statistics
SELECT 
    'Overall Institution Statistics' as section,
    COUNT(*) as total_batches,
    COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_batches,
    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_batches,
    COUNT(CASE WHEN status = 'Scheduled' THEN 1 END) as scheduled_batches,
    SUM(max_capacity) as total_capacity,
    SUM(price) as total_potential_revenue,
    AVG(price) as average_batch_price,
    MIN(start_date) as earliest_batch_start,
    MAX(end_date) as latest_batch_end
FROM institution_batches;

-- 8. Recent Batch Activity
SELECT 
    'Recent Batch Activity' as section,
    b.batch_name,
    c.title as course_name,
    b.status,
    b.created_at,
    b.start_date,
    COUNT(ce.id) as current_enrollments,
    b.max_capacity,
    ROUND((COUNT(ce.id)::float / b.max_capacity::float) * 100, 2) as capacity_filled_percentage
FROM institution_batches b
LEFT JOIN institution_courses c ON b.course_id = c.id
LEFT JOIN course_enrollments ce ON b.id = ce.batch_id AND ce.status = 'enrolled'
GROUP BY b.id, b.batch_name, c.title, b.status, b.created_at, b.start_date, b.max_capacity
ORDER BY b.created_at DESC
LIMIT 10;
