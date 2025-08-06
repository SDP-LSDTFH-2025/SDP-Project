const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');

const SimilarCourses = sequelize.define('SimilarCourses', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_id_1: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  course_id_2: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  vote_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'similar_courses',
  timestamps: false
});

module.exports = SimilarCourses;