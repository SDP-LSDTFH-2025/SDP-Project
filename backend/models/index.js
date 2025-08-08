const { sequelize } = require('../config/database');
const User = require('./User');
const Notifications = require('./Notifications');
const Courses = require('./Courses');
const UserCourses = require('./UserCourses');
module.exports = {
  sequelize,
  User,
  Notifications,
  Courses,
  UserCourses
}; 