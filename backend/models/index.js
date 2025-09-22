const { sequelize } = require('../config/database');
const User = require('./User');
const Notifications = require('./Notifications');
const Courses = require('./Courses');
const UserCourses = require('./UserCourses');
const PrivateChats = require('./PrivateChats');
const Likes = require('./Likes');


//resources table 
const Resources = require('./Resources');
const Resource_tags = require('./Resource_tags');
const Resource_threads = require('./Resource_threads');
const Resource_reports = require('./Resource_reports');

//Socialization
const Follows = require('./Follows');
const Group_chats = require('./Group_chats');
const Group_members = require('./Group_members');
const Progress = require('./Progress');
const Study_groups = require('./Study_groups');
const Study_sessions = require('./Study_sessions');
const Follows_requests = require('./follows_requests');
const public_resources = require('./public_resources');


// Define associations
// User associations
User.hasMany(Notifications, { foreignKey: 'user_id', sourceKey: 'id' });
User.hasMany(UserCourses, { foreignKey: 'user_id', sourceKey: 'id' });
User.hasMany(Study_groups, { foreignKey: 'creator_id', sourceKey: 'id' });
User.hasMany(Group_members, { foreignKey: 'user_id', sourceKey: 'id' });
User.hasMany(Group_chats, { foreignKey: 'user_id', sourceKey: 'id' });
User.hasMany(PrivateChats, { foreignKey: 'sender_id', sourceKey: 'id' });
User.hasMany(PrivateChats, { foreignKey: 'receiver_id', sourceKey: 'id' });
User.hasMany(Progress, { foreignKey: 'user_id', sourceKey: 'id' });
User.hasMany(Study_sessions, { foreignKey: 'user_id', sourceKey: 'id' });
User.hasMany(Resources, { foreignKey: 'user_id', sourceKey: 'id' });
User.hasMany(Resource_threads, { foreignKey: 'user_id', sourceKey: 'id' });
User.hasMany(Resource_reports, { foreignKey: 'user_id', sourceKey: 'id' });

// Follow associations
User.hasMany(Follows, { as: 'Followers', foreignKey: 'follower_id', sourceKey: 'id' });
User.hasMany(Follows, { as: 'Followees', foreignKey: 'followee_id', sourceKey: 'id' });
User.hasMany(Follows_requests, { as: 'Followers_requesting', foreignKey: 'follower_id', sourceKey: 'id' });
User.hasMany(Follows_requests, { as: 'Followees_requested', foreignKey: 'followee_id', sourceKey: 'id' });

// Course associations
Courses.hasMany(Resources, { foreignKey: 'course_id', sourceKey: 'id' });
Courses.hasMany(UserCourses, { foreignKey: 'course_id', sourceKey: 'id' });
Courses.hasMany(Study_groups, { foreignKey: 'course_id', sourceKey: 'id' });
User.hasMany(Courses, { foreignKey: 'created_by', sourceKey: 'id' });

// Resource associations
Resources.hasMany(Resource_tags, { foreignKey: 'resource_id', sourceKey: 'id' });
Resources.hasMany(Resource_threads, { foreignKey: 'resource_id', sourceKey: 'id' });
Resources.hasMany(Resource_reports, { foreignKey: 'resource_id', sourceKey: 'id' });

// Study Group associations
Study_groups.hasMany(Group_members, { foreignKey: 'group_id', sourceKey: 'id' });
Study_groups.hasMany(Group_chats, { foreignKey: 'group_id', sourceKey: 'id' });

//likes associations
Likes.belongsTo(User, { foreignKey: "user_id", targetKey: 'id', as: 'user' });
User.hasMany(Likes, { foreignKey: "user_id",sourceKey:'id' });
Likes.belongsTo(Resources, { foreignKey: "resource_id",targetKey: 'id' });
Resources.hasMany(Likes, { foreignKey: "resource_id",sourceKey:'id' });

// Reverse associations
Notifications.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
UserCourses.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
UserCourses.belongsTo(Courses, { foreignKey: 'course_id', targetKey: 'id' });
Study_groups.belongsTo(User, { foreignKey: 'creator_id', targetKey: 'id' });
Study_groups.belongsTo(Courses, { foreignKey: 'course_id', targetKey: 'id' });
Group_members.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
Group_members.belongsTo(Study_groups, { foreignKey: 'group_id', targetKey: 'id' });
Group_chats.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
Group_chats.belongsTo(Study_groups, { foreignKey: 'group_id', targetKey: 'id' });
PrivateChats.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id', targetKey: 'id' });
PrivateChats.belongsTo(User, { as: 'Receiver', foreignKey: 'receiver_id', targetKey: 'id' });
Progress.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
Study_sessions.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
Resources.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
Resources.belongsTo(Courses, { foreignKey: 'course_id', targetKey: 'id' });
Resource_tags.belongsTo(Resources, { foreignKey: 'resource_id', targetKey: 'id' });
Resource_threads.belongsTo(Resources, { foreignKey: 'resource_id', targetKey: 'id' });
Resource_threads.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
Resource_reports.belongsTo(Resources, { foreignKey: 'resource_id', targetKey: 'id' });
Resource_reports.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
Follows.belongsTo(User, { as: 'Follower', foreignKey: 'follower_id', targetKey: 'id' });
Follows.belongsTo(User, { as: 'Followee', foreignKey: 'followee_id', targetKey: 'id' });
Follows_requests.belongsTo(User, { as: 'Follower_requesting', foreignKey: 'follower_id', targetKey: 'id' });
Follows_requests.belongsTo(User, { as: 'Followee_requested', foreignKey: 'followee_id', targetKey: 'id' });
Courses.belongsTo(User, { foreignKey: 'created_by', targetKey: 'id' });

module.exports = {
  sequelize,
  User,
  Notifications,
  Courses,
  UserCourses,
  PrivateChats,
  Resources,
  Resource_tags,
  Resource_threads,
  Resource_reports,
  Follows,
  Follows_requests,
  Group_chats,
  Group_members,
  Progress,
  Study_groups,
  Study_sessions,
  Likes,
  public_resources
};