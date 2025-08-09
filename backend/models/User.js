const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


const User = sequelize.define('User', {

  google_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },

  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,

  },
  role:{
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'student'
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
  }
}, {
  tableName: 'users',
  timestamps: false,
  underscored: true

});


module.exports = User; 