CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  code VARCHAR,
  name VARCHAR,
  school VARCHAR,
  approved BOOLEAN,
  created_by VARCHAR,
  created_at TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users (google_id)
); 