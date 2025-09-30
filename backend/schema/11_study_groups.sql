CREATE TABLE study_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  course_code VARCHAR,
  user_id VARCHAR,
  scheduled_time TIMESTAMP,
  location VARCHAR,
  disabled BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (course_code) REFERENCES courses (code),
  FOREIGN KEY (user_id) REFERENCES users (google_id)
); 