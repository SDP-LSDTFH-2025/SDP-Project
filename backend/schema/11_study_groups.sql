CREATE TABLE study_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  course_id INTEGER,
  user_id VARCHAR,
  scheduled_time TIMESTAMP,
  location VARCHAR,
  disabled BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses (id),
  FOREIGN KEY (user_id) REFERENCES users (google_id)
); 