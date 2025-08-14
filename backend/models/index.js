const { sequelize } = require('../config/database');
const User = require('./User');
const Notifications = require('./Notifications');
const Courses = require('./Courses');
const UserCourses = require('./UserCourses');
const PrivateChats = require('./PrivateChats');

//resources table 
const Resources = require('./Resources');

module.exports = {
  sequelize,
  User,
  Notifications,
  Courses,
  UserCourses,
  PrivateChats,
  Resources
}; 