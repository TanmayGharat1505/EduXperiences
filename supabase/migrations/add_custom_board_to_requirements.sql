-- Add custom board field for "other" board selection in requirements table
-- This migration adds support for custom board names when board is "other"

-- Add custom board field to requirements table
ALTER TABLE requirements 
ADD COLUMN IF NOT EXISTS custom_board TEXT;

-- Add comment for documentation
COMMENT ON COLUMN requirements.custom_board IS 'Custom board name when board is "other"';

-- Create index for custom board field for better performance
CREATE INDEX IF NOT EXISTS idx_requirements_custom_board ON requirements(custom_board);
