CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR UNIQUE NOT NULL,
  username VARCHAR,
  is_active BOOLEAN,
  last_login TIMESTAMP,
  role VARCHAR,
  created_at TIMESTAMP
); 