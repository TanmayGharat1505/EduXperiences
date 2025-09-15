-- Batch Dashboard Summary - Key Metrics
-- Simplified view of the most important batch information

SELECT 
    'Batch Dashboard Summary' as info,
    b.batch_name,
    c.title as course_name,
    b.start_date,
    b.end_date,
    b.class_timings,
    b.days_of_week,
    b.assigned_faculty,
    b.max_capacity,
    COUNT(ce.id) as enrolled_students,
    (b.max_capacity - COUNT(ce.id)) as available_slots,
    ROUND((COUNT(ce.id)::float / b.max_capacity::float) * 100, 2) as capacity_utilization_percentage,
    b.price as price_per_student,
    (b.price * COUNT(ce.id)) as total_revenue,
    b.status,
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
GROUP BY b.id, b.batch_name, c.title, b.start_date, b.end_date, b.class_timings, 
         b.days_of_week, b.assigned_faculty, b.max_capacity, b.price, b.status
ORDER BY b.start_date DESC;
