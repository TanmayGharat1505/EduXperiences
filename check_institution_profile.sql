-- Simple query to check institution profile for maseerah2003@gmail.com
-- Run this in Supabase SQL Editor

SELECT 
    'institution_profiles' as table_name,
    ip.user_id,
    ip.institution_name,
    ip.institution_type,
    ip.established_year,
    ip.contact_person_name,
    ip.contact_person_title,
    ip.country,
    ip.state,
    ip.city,
    ip.address,
    ip.created_at,
    u.email
FROM institution_profiles ip
JOIN auth.users u ON ip.user_id = u.id
WHERE u.email = 'maseerah2003@gmail.com';
