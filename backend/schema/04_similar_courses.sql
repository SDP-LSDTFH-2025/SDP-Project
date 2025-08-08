CREATE TABLE similar_courses (
  id SERIAL PRIMARY KEY,
  course_id_1 INTEGER,
  course_id_2 INTEGER,
  vote_count INTEGER,
  created_at TIMESTAMP,
  FOREIGN KEY (course_id_1) REFERENCES courses (id),
  FOREIGN KEY (course_id_2) REFERENCES courses (id)
); 