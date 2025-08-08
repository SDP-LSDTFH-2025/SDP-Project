CREATE TABLE resource_reports (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER,
  user_id VARCHAR,
  reason TEXT,
  response TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources (id),
  FOREIGN KEY (user_id) REFERENCES users (google_id)
); 