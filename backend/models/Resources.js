const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');

const Resources = sequelize.define('Resources', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pictures_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  checksum: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'resources',
  timestamps: false
});

module.exports = Resources;