CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  message JSON,
  read BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (google_id)
); 