{/*For likes table these are the column names and their
    schema. */}

const {DataTypes} = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const {sequelize} = require("../config/database");

const Likes = sequelize.define('Likes',{
 like_id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
 },
  user_id: {
    type:DataTypes.UUID,
    allowNull:false
 },

 resource_id: {
    type:DataTypes.INTEGER,
    allowNull:true
 },
 
 created_at: {
    type:DataTypes.DATE,
    allowNull:false,
    defaultValue:DataTypes.NOW

 }
},{
    tableName: "likes",
    timestamps:true,
    createdAt: 'created_at',
    updatedAt: false
});


module.exports = Likes;
