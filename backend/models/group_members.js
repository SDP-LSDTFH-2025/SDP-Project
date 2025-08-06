const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');

const GroupMembers = sequelize.define('GroupMembers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  joined_at: {      
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'group_members',
  timestamps: false
});

module.exports = GroupMembers;