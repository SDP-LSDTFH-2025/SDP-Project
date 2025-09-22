CREATE TABLE progress (
  id integer GENERATED ALWAYS AS IDENTITY,
  user_id VARCHAR,
  topic VARCHAR,
  section VARCHAR,
  hours_studied FLOAT,
  study_date DATE,
  FOREIGN KEY (user_id) REFERENCES users (google_id)
); 