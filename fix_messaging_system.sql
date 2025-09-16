-- FIX MESSAGING SYSTEM - Complete overhaul to fix broken logic
-- This script fixes the messaging system to work properly with requirements

-- ==========================================
-- STEP 1: DROP BROKEN VIEWS AND TABLES
-- ==========================================
DROP VIEW IF EXISTS conversations CASCADE;

-- ==========================================
-- STEP 2: CREATE PROPER CONVERSATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique conversations per requirement-tutor pair
    UNIQUE(requirement_id, tutor_id)
);

-- ==========================================
-- STEP 3: UPDATE MESSAGES TABLE TO LINK WITH CONVERSATIONS
-- ==========================================
-- Add conversation_id column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- Add requirement_id column to messages table for direct linking
ALTER TABLE messages ADD COLUMN IF NOT EXISTS requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE;

-- ==========================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_conversations_requirement_id ON conversations(requirement_id);
CREATE INDEX IF NOT EXISTS idx_conversations_student_id ON conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tutor_id ON conversations(tutor_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_requirement_id ON messages(requirement_id);

-- ==========================================
-- STEP 5: ENABLE RLS ON NEW TABLE
-- ==========================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 6: CREATE RLS POLICIES FOR CONVERSATIONS
-- ==========================================
CREATE POLICY "Conversations - Users can view conversations they're part of" ON conversations
    FOR SELECT USING (auth.uid() = student_id OR auth.uid() = tutor_id);

CREATE POLICY "Conversations - Students can create conversations for their requirements" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Conversations - Users can update conversations they're part of" ON conversations
    FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = tutor_id);

-- ==========================================
-- STEP 7: UPDATE MESSAGES RLS POLICIES
-- ==========================================
-- Drop old policies
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can insert messages they send" ON messages;
DROP POLICY IF EXISTS "Users can update messages they sent or received" ON messages;

-- Create new policies that work with conversations
CREATE POLICY "Messages - Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = messages.conversation_id 
            AND (c.student_id = auth.uid() OR c.tutor_id = auth.uid())
        )
    );

CREATE POLICY "Messages - Users can insert messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = messages.conversation_id 
            AND (c.student_id = auth.uid() OR c.tutor_id = auth.uid())
        )
        AND auth.uid() = messages.sender_id
    );

CREATE POLICY "Messages - Users can update their own messages" ON messages
    FOR UPDATE USING (auth.uid() = messages.sender_id);

-- ==========================================
-- STEP 8: CREATE HELPER FUNCTIONS
-- ==========================================
-- Function to get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_requirement_id UUID,
    p_student_id UUID,
    p_tutor_id UUID
) RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
BEGIN
    -- Try to find existing conversation
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE requirement_id = p_requirement_id 
    AND student_id = p_student_id 
    AND tutor_id = p_tutor_id;
    
    -- If no conversation exists, create one
    IF v_conversation_id IS NULL THEN
        INSERT INTO conversations (requirement_id, student_id, tutor_id)
        VALUES (p_requirement_id, p_student_id, p_tutor_id)
        RETURNING id INTO v_conversation_id;
    END IF;
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation messages with proper ordering
CREATE OR REPLACE FUNCTION get_conversation_messages(
    p_conversation_id UUID,
    p_limit INTEGER DEFAULT 50
) RETURNS SETOF messages AS $$
BEGIN
    RETURN QUERY
    SELECT m.*
    FROM messages m
    WHERE m.conversation_id = p_conversation_id
    ORDER BY m.created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user conversations
CREATE OR REPLACE FUNCTION get_user_conversations(
    p_user_id UUID
) RETURNS TABLE(
    conversation_id UUID,
    requirement_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    other_user_role TEXT,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conversation_id,
        c.requirement_id,
        CASE 
            WHEN c.student_id = p_user_id THEN c.tutor_id
            ELSE c.student_id
        END as other_user_id,
        p.full_name as other_user_name,
        p.role as other_user_role,
        m.content as last_message,
        m.created_at as last_message_time,
        COUNT(CASE WHEN m.read = FALSE AND m.sender_id != p_user_id THEN 1 END) as unread_count
    FROM conversations c
    LEFT JOIN LATERAL (
        SELECT content, created_at, read, sender_id
        FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) m ON true
    LEFT JOIN profiles p ON (
        CASE 
            WHEN c.student_id = p_user_id THEN c.tutor_id
            ELSE c.student_id
        END = p.user_id
    )
    WHERE c.student_id = p_user_id OR c.tutor_id = p_user_id
    GROUP BY c.id, c.requirement_id, c.student_id, c.tutor_id, p.full_name, p.role, m.content, m.created_at
    ORDER BY m.created_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- STEP 9: MIGRATE EXISTING DATA (if any)
-- ==========================================
-- This will create conversations for existing messages
INSERT INTO conversations (requirement_id, student_id, tutor_id)
SELECT DISTINCT
    rtm.requirement_id,
    r.student_id,
    rtm.tutor_id
FROM requirement_tutor_matches rtm
JOIN requirements r ON rtm.requirement_id = r.id
WHERE rtm.status = 'interested'
ON CONFLICT (requirement_id, tutor_id) DO NOTHING;

-- ==========================================
-- STEP 10: VERIFY THE FIX
-- ==========================================
SELECT 
    'MESSAGING_SYSTEM_FIXED' as status,
    'Conversations table created' as detail,
    COUNT(*) as count
FROM conversations

UNION ALL

SELECT 
    'MESSAGING_SYSTEM_FIXED' as status,
    'Messages with conversation_id' as detail,
    COUNT(*) as count
FROM messages 
WHERE conversation_id IS NOT NULL

UNION ALL

SELECT 
    'MESSAGING_SYSTEM_FIXED' as status,
    'Total conversations' as detail,
    COUNT(*) as count
FROM conversations;
