-- Complete Database Schema for SDP Project
-- Execute this file to create all tables in the correct order

-- 1. Users table (base table)
CREATE TABLE users (
  google_id VARCHAR PRIMARY KEY,
  username VARCHAR,
  role VARCHAR,
  created_at TIMESTAMP
);

-- 2. Follows table
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id VARCHAR,
  followee_id VARCHAR,
  created_at TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users (google_id),
  FOREIGN KEY (followee_id) REFERENCES users (google_id)
);

-- 3. Courses table
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

-- 4. Similar courses table
CREATE TABLE similar_courses (
  id SERIAL PRIMARY KEY,
  course_id_1 INTEGER,
  course_id_2 INTEGER,
  vote_count INTEGER,
  created_at TIMESTAMP,
  FOREIGN KEY (course_id_1) REFERENCES courses (id),
  FOREIGN KEY (course_id_2) REFERENCES courses (id)
);

-- 5. Resources table
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR,
  description TEXT,
  likes INTEGER,
  file_url VARCHAR,
  pictures_url VARCHAR,
  checksum VARCHAR,
  user_id VARCHAR,
  course_id INTEGER,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (google_id),
  FOREIGN KEY (course_id) REFERENCES courses (id)
);

-- 6. Resource tags table
CREATE TABLE resource_tags (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER,
  tag VARCHAR,
  FOREIGN KEY (resource_id) REFERENCES resources (id)
);

-- 7. Resource threads table
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

-- 8. Resource reports table
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

-- 9. Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  message JSON,
  read BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (google_id)
);

-- 10. User courses table
CREATE TABLE user_courses (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  course_id INTEGER,
  role VARCHAR,
  joined_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (google_id),
  FOREIGN KEY (course_id) REFERENCES courses (id)
);

-- 11. Study groups table
CREATE TABLE study_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  course_id INTEGER,
  user_id VARCHAR,
  scheduled_time TIMESTAMP,
  location VARCHAR,
  disabled BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses (id),
  FOREIGN KEY (user_id) REFERENCES users (google_id)
);

-- 12. Group members table
CREATE TABLE group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER,
  user_id VARCHAR,
  joined_at TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES study_groups (id),
  FOREIGN KEY (user_id) REFERENCES users (google_id)
);

-- 13. Group chats table
CREATE TABLE group_chats (
  id SERIAL PRIMARY KEY,
  group_id INTEGER,
  user_id VARCHAR,
  message TEXT,
  deleted BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES study_groups (id),
  FOREIGN KEY (user_id) REFERENCES users (google_id)
);

-- 14. Private chats table
CREATE TABLE private_chats (
  id SERIAL PRIMARY KEY,
  sender_id VARCHAR,
  receiver_id VARCHAR,
  message TEXT,
  deleted BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users (google_id),
  FOREIGN KEY (receiver_id) REFERENCES users (google_id)
);

-- 15. Progress table
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  topic VARCHAR,
  section VARCHAR,
  hours_studied FLOAT,
  study_date DATE,
  FOREIGN KEY (user_id) REFERENCES users (google_id)
);

-- 16. Study sessions table
CREATE TABLE study_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  title VARCHAR,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  reminder_sent BOOLEAN,
  FOREIGN KEY (user_id) REFERENCES users (google_id)
); 