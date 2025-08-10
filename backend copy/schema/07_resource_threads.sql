CREATE TABLE resource_threads (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER,
  user_id VARCHAR,
  message TEXT,
  parent_id INTEGER,
  created_at TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources (id),
  FOREIGN KEY (user_id) REFERENCES users (google_id),
  FOREIGN KEY (parent_id) REFERENCES resource_threads (id)
); 