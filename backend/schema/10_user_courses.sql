CREATE TABLE user_courses (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  course_id INTEGER,
  role VARCHAR,
  joined_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (google_id),
  FOREIGN KEY (course_id) REFERENCES courses (id)
); 