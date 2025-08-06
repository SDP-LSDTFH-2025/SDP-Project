const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - google_id
 *         - username
 *       properties:
 *         google_id:
 *           type: string
 *           description: Google OAuth ID
 *         username:
 *           type: string
 *           description: User's username
 *         is_active:
 *           type: boolean
 *           description: Whether the user account is active
 *         last_login:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       
 */

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