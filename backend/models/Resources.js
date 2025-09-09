{/*For resources table these are the column names and their
    schema. */}

const {DataTypes} = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const {sequelize} = require("../config/database");

const Resources = sequelize.define('Resources',{
 id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
 },
 title: {
    type:DataTypes.STRING,
    allowNull: false
 },
 description: {
    type:DataTypes.STRING,
    allowNull:false

 },
 likes: {
    type:DataTypes.INTEGER,
    allowNull:true

 },
 file_url: {
    type:DataTypes.STRING,
    allowNull: true

 },
 public_id: {
    type:DataTypes.STRING,
    allowNull:false

 },
 pictures_url: {
    type:DataTypes.STRING,
    allowNull:true
 },
 checksum: {
    type:DataTypes.STRING,
    allowNull:false

 },
 user_id: {
    type:DataTypes.UUID,
    allowNull:false
 },
 course_code: {
    type:DataTypes.STRING,
    allowNull:true
 },
 
 created_at: {
    type:DataTypes.DATE,
    allowNull:false,
    defaultValue:DataTypes.NOW

 }
},{
    tableName: "resources",
    timestamps:true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Resources;
