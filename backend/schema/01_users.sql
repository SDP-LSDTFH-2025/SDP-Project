CREATE TABLE users (
  google_id VARCHAR PRIMARY KEY,
  username VARCHAR,
  is_active BOOLEAN,
  last_login TIMESTAMP,
  role VARCHAR,
  created_at TIMESTAMP
); 