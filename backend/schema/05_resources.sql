CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR,
  description TEXT,
  likes INTEGER,
  file_url VARCHAR,
  pictures_url VARCHAR,
  checksum VARCHAR,
  user_id VARCHAR,
  course_id INTEGER,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (google_id),
  FOREIGN KEY (course_id) REFERENCES courses (id)
); 