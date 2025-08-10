const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');

const Follows = sequelize.define('Follows', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  follower_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  following_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'follows',
  timestamps: false
});

module.exports = Follows;