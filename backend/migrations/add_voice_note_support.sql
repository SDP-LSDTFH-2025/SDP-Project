-- Add voice note support to private_chats table
-- Migration: add_voice_note_support.sql

-- Add message_type column
ALTER TABLE private_chats 
ADD COLUMN message_type VARCHAR(20) DEFAULT 'text' NOT NULL;

-- Add audio_data column for storing base64 encoded audio
ALTER TABLE private_chats 
ADD COLUMN audio_data TEXT;

-- Add audio_duration column for storing voice note duration
ALTER TABLE private_chats 
ADD COLUMN audio_duration FLOAT;

-- Create enum type for message types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type_enum') THEN
        CREATE TYPE message_type_enum AS ENUM ('text', 'voice_note', 'image', 'file');
    END IF;
END $$;

-- Update the message_type column to use the enum
ALTER TABLE private_chats 
ALTER COLUMN message_type TYPE message_type_enum USING message_type::message_type_enum;

-- Add index for message_type for better query performance
CREATE INDEX IF NOT EXISTS idx_private_chats_message_type ON private_chats(message_type);

-- Add index for audio_data for voice note queries
CREATE INDEX IF NOT EXISTS idx_private_chats_audio_data ON private_chats(audio_data) WHERE audio_data IS NOT NULL;
