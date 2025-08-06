CREATE TABLE study_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  title VARCHAR,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  reminder_sent BOOLEAN,
  FOREIGN KEY (user_id) REFERENCES users (google_id)
); 