CREATE TABLE group_chats (
  id SERIAL PRIMARY KEY,
  group_id INTEGER,
  user_id VARCHAR,
  message TEXT,
  message_type VARCHAR(255) NOT NULL DEFAULT 'text',
  audio_data TEXT,
  audio_duration FLOAT,
  deleted BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES study_groups (id),
  FOREIGN KEY (user_id) REFERENCES users (google_id),
  CONSTRAINT chk_group_message_type CHECK (message_type IN ('text', 'voice_note', 'image', 'file'))
); 