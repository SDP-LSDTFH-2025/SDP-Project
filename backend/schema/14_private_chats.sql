CREATE TABLE private_chats (
  id SERIAL PRIMARY KEY,
  sender_id VARCHAR,
  receiver_id VARCHAR,
  message TEXT,
  deleted BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users (google_id),
  FOREIGN KEY (receiver_id) REFERENCES users (google_id)
); 