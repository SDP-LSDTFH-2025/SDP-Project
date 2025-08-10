const { sequelize } = require('../config/database');
const User = require('./User');
const Follows = require('./Follows');
const Courses = require('./Courses');
const SimilarCourses = require('./Similar_Courses');
const Resources = require('./Resources');
const ResourceThreads = require('./Resource_threads');
const ResourceReports = require('./Resource_reports');
const Notifications = require('./Notifications');
const UserCourses = require('./User_courses');
const StudyGroups = require('./study_groups');
const GroupMembers = require('./group_members');
const GroupChats = require('./group_chats');
const PrivateChats = require('./private_chats');
const Progress = require('./progress');
const StudySession = require('./study_session');
module.exports = {
  sequelize,
  User,
  Follows,
  Courses,
  SimilarCourses,
  Resources,
  ResourceThreads,
  ResourceReports,
  Notifications,
  UserCourses,
  StudyGroups,
  GroupMembers,
  GroupChats,
  PrivateChats,
  Progress,
  StudySession
}; 