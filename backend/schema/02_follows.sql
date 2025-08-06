CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id VARCHAR,
  followee_id VARCHAR,
  created_at TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users (google_id),
  FOREIGN KEY (followee_id) REFERENCES users (google_id)
); 