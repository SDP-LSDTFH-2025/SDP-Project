CREATE TABLE study_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  title VARCHAR,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  reminder_sent BOOLEAN,
  venue_name VARCHAR,
  venue_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
); 