CREATE TABLE group_chats (
  id SERIAL PRIMARY KEY,
  group_id INTEGER,
  user_id VARCHAR,
  message TEXT,
  deleted BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES study_groups (id),
  FOREIGN KEY (user_id) REFERENCES users (google_id)
); 