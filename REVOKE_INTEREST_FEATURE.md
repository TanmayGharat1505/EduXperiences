# Revoke Interest Feature for Tutors

## Overview
This feature allows tutors to revoke their interest in student requirements even after they have already shown interest and sent a message. Once revoked, the requirement disappears from the tutor's view and the student no longer sees that tutor listed under responses.

## Database Changes

### New Columns Added
- `revoked_at`: Timestamp when the tutor revoked their interest
- `revoke_reason`: Optional reason provided by the tutor for revoking interest

### Status Updates
- Added 'revoked' as a new status option in the `requirement_tutor_matches` table
- Updated the status constraint to include: 'pending', 'interested', 'not_interested', 'accepted', 'rejected', 'revoked'

### New Functions
1. **`revoke_tutor_interest(p_requirement_id, p_tutor_id, p_revoke_reason)`**
   - Allows tutors to revoke their interest in a requirement
   - Only works if the current status is 'interested'
   - Automatically sends a notification to the student
   - Returns boolean indicating success/failure

2. **`get_tutor_requirement_responses(p_tutor_id)`**
   - Returns all responses (including revoked ones) for a specific tutor
   - Useful for tracking tutor activity and history

### Updated Views
- **`tutor_requirements_view`**: Now excludes requirements where the tutor has revoked interest
- Ensures revoked requirements don't appear in the tutor's available requirements list

## Frontend Changes

### Tutor Dashboard
- Added "Revoke Interest" button for requirements where the tutor has already shown interest
- Button appears alongside "View Chat" and "Message Sent" buttons
- Clicking the button calls the `revoke_tutor_interest` RPC function
- Successfully revoked requirements are immediately removed from the tutor's view

### Student Dashboard
- Responses from tutors who have revoked their interest are automatically filtered out
- Response counts exclude revoked responses
- Students no longer see revoked tutors in their requirement responses

## User Experience Flow

1. **Tutor shows interest**: Tutor clicks "Show Interest" and sends a message
2. **Student sees response**: Student receives notification and can see the tutor's response
3. **Tutor can revoke**: Tutor sees "Revoke Interest" button on the requirement card
4. **Revocation process**: 
   - Tutor clicks "Revoke Interest"
   - System updates the status to 'revoked'
   - Requirement disappears from tutor's view
   - Student receives notification about the revocation
   - Student no longer sees that tutor in responses
5. **Clean separation**: Revoked interests are completely separated from active ones

## Security and Permissions

### Row Level Security (RLS)
- Tutors can only revoke their own interests
- Students cannot see revoked responses
- All operations respect existing RLS policies

### Function Security
- `revoke_tutor_interest` is marked as `SECURITY DEFINER`
- Only authenticated users can execute the function
- Function validates that the tutor owns the interest before allowing revocation

## Notifications

### Student Notifications
- Type: 'requirement_response'
- Title: 'Tutor Revoked Interest'
- Message: 'A tutor has revoked their interest in your requirement.'
- Includes metadata about the revocation

### Data Integrity
- Revoked interests maintain their history for audit purposes
- Original response message and proposed rate are preserved
- Timestamps track when the interest was shown and when it was revoked

## Migration

### Running the Migration
```sql
-- Apply the migration
\i supabase/migrations/add_revoke_interest_functionality.sql

-- Verify the changes
\i test_revoke_functionality.sql
```

### Rollback (if needed)
```sql
-- Remove the new columns
ALTER TABLE requirement_tutor_matches 
DROP COLUMN IF EXISTS revoked_at,
DROP COLUMN IF EXISTS revoke_reason;

-- Restore original status constraint
ALTER TABLE requirement_tutor_matches 
DROP CONSTRAINT IF EXISTS requirement_tutor_matches_status_check;

ALTER TABLE requirement_tutor_matches 
ADD CONSTRAINT requirement_tutor_matches_status_check 
CHECK (status IN ('pending', 'interested', 'not_interested', 'accepted', 'rejected'));

-- Drop the new functions
DROP FUNCTION IF EXISTS revoke_tutor_interest(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS get_tutor_requirement_responses(UUID);
```

## Testing

### Manual Testing Steps
1. **Tutor shows interest** in a requirement
2. **Verify student sees** the tutor's response
3. **Tutor revokes interest** using the new button
4. **Verify requirement disappears** from tutor's view
5. **Verify student no longer sees** the revoked tutor in responses
6. **Check notifications** are sent correctly

### Edge Cases
- Attempting to revoke already revoked interests
- Revoking interests in different statuses
- Network failures during revocation
- Concurrent revocation attempts

## Future Enhancements

### Potential Improvements
1. **Revoke reason input**: Allow tutors to provide a reason for revocation
2. **Revocation history**: Show tutors their revocation history
3. **Student feedback**: Allow students to provide feedback on revoked tutors
4. **Analytics**: Track revocation patterns and reasons
5. **Re-engagement**: Allow tutors to re-express interest after revocation

### Configuration Options
- Time limits for revocation (e.g., only within 24 hours)
- Required reasons for revocation
- Revocation limits per tutor
- Student notification preferences

## Support and Troubleshooting

### Common Issues
1. **Button not appearing**: Check if tutor has actually shown interest
2. **Revocation fails**: Verify the requirement status is 'interested'
3. **Student still sees response**: Check if the migration was applied correctly
4. **Permission errors**: Verify RLS policies are in place

### Debug Queries
```sql
-- Check current status of a requirement-tutor match
SELECT * FROM requirement_tutor_matches 
WHERE requirement_id = 'UUID' AND tutor_id = 'UUID';

-- Verify revoked interests are filtered out
SELECT * FROM tutor_requirements_view 
WHERE id = 'REQUIREMENT_UUID';

-- Check notification was sent
SELECT * FROM notifications 
WHERE data->>'requirement_id' = 'UUID' 
AND data->>'status' = 'revoked';
```
