const {DataTypes} = require('sequelize');  
const {sequelize} = require('../config/database');

const Progress = sequelize.define('Progress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hours_studied: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  study_date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'progress',
  timestamps: false
});

module.exports = Progress;