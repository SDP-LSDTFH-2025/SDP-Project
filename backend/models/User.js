const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    unique: true,
    defaultValue: () => uuidv4()
  },

  google_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
 
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  role:{
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'student'
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: true
  },
  school: {
    type: DataTypes.STRING,
    allowNull: true
  },
  year_of_study: {
    type: DataTypes.STRING,
    allowNull: true
  },
  course:{
    type: DataTypes.STRING,
    allowNull: true
  },
  academic_interests:{
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  study_preferences:{
    type: DataTypes.TEXT('long'),
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: false,

});


module.exports = User; 