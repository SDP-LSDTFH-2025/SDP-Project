{/*For resources table these are the column names and their
    schema. */}

const {DataTypes} = require('sequelize');

const {sequelize} = require("../config/database");

const Resources = sequalize.define('Resources',{
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
    allowNull:false
 },
 checksum: {
    type:DataTypes.STRING,
    allowNull:false

 },
 upload_id: {
    type:DataTypes.INTEGER,
    allowNull:false
 },
 course_id: {
    type:DataTypes.INTEGER,
    allowNull:false
 },
 
 created_at: {
    type:DataTypes.TIME,
    allowNull:false,
    defaultValue:DataTypes.NOW
 }
},{
    tableName: "resources",
    tiemstamps:false
});

module.exports = Resources;
