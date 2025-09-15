-- Add custom fields for "other" category in requirements table
-- This migration adds support for custom category names and subjects

-- Add custom fields to requirements table
ALTER TABLE requirements 
ADD COLUMN IF NOT EXISTS custom_category TEXT,
ADD COLUMN IF NOT EXISTS custom_subject TEXT;

-- Add comments for documentation
COMMENT ON COLUMN requirements.custom_category IS 'Custom category name when category is "other"';
COMMENT ON COLUMN requirements.custom_subject IS 'Custom subject/skill when category is "other"';

-- Create index for custom fields for better performance
CREATE INDEX IF NOT EXISTS idx_requirements_custom_category ON requirements(custom_category);
CREATE INDEX IF NOT EXISTS idx_requirements_custom_subject ON requirements(custom_subject);
