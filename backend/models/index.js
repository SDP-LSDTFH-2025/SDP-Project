const { sequelize } = require('../config/database');
const User = require('./User');
const Notifications = require('./Notifications');
const Courses = require('./Courses');
const UserCourses = require('./UserCourses');
const PrivateChats = require('./PrivateChats');

//resources table 
const Resources = require('./Resources');
const { default: Follows } = require('./Follows');
const { default: Group_chats } = require('./Group_chats');
const { default: Group_members } = require('./Group_members');
import Progress from './Progress';
import Study_groups from './study_groups';
import Study_sessions from './Study_sessions';

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