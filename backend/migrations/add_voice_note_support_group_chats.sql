-- Migration to add message_type, audio_data, and audio_duration to group_chats table
ALTER TABLE group_chats
ADD COLUMN message_type VARCHAR(255) NOT NULL DEFAULT 'text',
ADD COLUMN audio_data TEXT,
ADD COLUMN audio_duration FLOAT;

-- Update existing rows to have 'text' message_type
UPDATE group_chats SET message_type = 'text' WHERE message_type IS NULL;

-- Add check constraint for message_type
ALTER TABLE group_chats
ADD CONSTRAINT chk_group_message_type CHECK (message_type IN ('text', 'voice_note', 'image', 'file'));

-- Optionally, add indexes for performance if needed
CREATE INDEX idx_group_chats_message_type ON group_chats (message_type);