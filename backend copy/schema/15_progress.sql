CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  topic VARCHAR,
  section VARCHAR,
  hours_studied FLOAT,
  study_date DATE,
  FOREIGN KEY (user_id) REFERENCES users (google_id)
); 