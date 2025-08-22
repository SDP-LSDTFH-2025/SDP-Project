const { sequelize } = require('../config/database');
const User = require('./User');
const Notifications = require('./Notifications');
const Courses = require('./Courses');
const UserCourses = require('./UserCourses');
const PrivateChats = require('./PrivateChats');

//resources table 
const Resources = require('./Resources');
const Follows = require('./Follows');
const Group_chats = require('./Group_chats');
const Group_members = require('./Group_members');
const Progress = require('./Progress');
const Study_groups = require('./Study_groups');
const Study_sessions = require('./Study_sessions');

module.exports = {
  sequelize,
  User,
  Notifications,
  Courses,
  UserCourses,
  PrivateChats,
  Resources,
  Follows,
  Group_chats,
  Group_members,
  Progress,
  Study_groups,
  Study_sessions
}; 