-- Performance optimization indexes for SDP Project
-- Run this script to add critical database indexes

-- Resources table indexes
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_course_id ON resources(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_title ON resources USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_resources_likes ON resources(likes DESC);

-- User courses table indexes
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_composite ON user_courses(user_id, course_id);

-- Follows table indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followee_id ON follows(followee_id);
CREATE INDEX IF NOT EXISTS idx_follows_composite ON follows(follower_id, followee_id);

-- Follows requests table indexes
CREATE INDEX IF NOT EXISTS idx_follows_requests_follower_id ON follows_requests(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_requests_followee_id ON follows_requests(followee_id);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution);
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school);

-- Courses table indexes
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_school ON courses(school);
CREATE INDEX IF NOT EXISTS idx_courses_approved ON courses(approved);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses USING gin(to_tsvector('english', name));

-- Likes table indexes
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_resource_id ON likes(resource_id);
CREATE INDEX IF NOT EXISTS idx_likes_composite ON likes(user_id, resource_id);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Group members table indexes
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);

-- Group chats table indexes
CREATE INDEX IF NOT EXISTS idx_group_chats_group_id ON group_chats(group_id);
CREATE INDEX IF NOT EXISTS idx_group_chats_user_id ON group_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_group_chats_created_at ON group_chats(created_at);

-- Private chats table indexes
CREATE INDEX IF NOT EXISTS idx_private_chats_sender_id ON private_chats(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_chats_receiver_id ON private_chats(receiver_id);
CREATE INDEX IF NOT EXISTS idx_private_chats_created_at ON private_chats(created_at);

-- Study groups table indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_creator_id ON study_groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_course_id ON study_groups(course_id);

-- Progress table indexes
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_created_at ON progress(created_at);

-- Study sessions table indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON study_sessions(created_at);

-- Resource threads table indexes
CREATE INDEX IF NOT EXISTS idx_resource_threads_resource_id ON resource_threads(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_threads_user_id ON resource_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_threads_created_at ON resource_threads(created_at);

-- Resource reports table indexes
CREATE INDEX IF NOT EXISTS idx_resource_reports_resource_id ON resource_reports(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_reports_user_id ON resource_reports(user_id);

-- Resource tags table indexes
CREATE INDEX IF NOT EXISTS idx_resource_tags_resource_id ON resource_tags(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_tags_tag_name ON resource_tags(tag_name);

-- Analyze tables after adding indexes for better query planning
ANALYZE resources;
ANALYZE users;
ANALYZE user_courses;
ANALYZE follows;
ANALYZE courses;
ANALYZE likes;
ANALYZE notifications;
ANALYZE group_members;
ANALYZE group_chats;
ANALYZE private_chats;
ANALYZE study_groups;
ANALYZE progress;
ANALYZE study_sessions;
ANALYZE resource_threads;
ANALYZE resource_reports;
ANALYZE resource_tags;
ANALYZE follows_requests;
