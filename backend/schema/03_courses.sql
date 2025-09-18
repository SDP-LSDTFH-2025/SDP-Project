CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  code VARCHAR,
  name VARCHAR,
  school VARCHAR,
  approved BOOLEAN,
  created_by UUID,
  created_at TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users (id)
); 