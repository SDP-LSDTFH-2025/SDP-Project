const {DataTypes} = require('sequelize');
const {sequelize} = require("../config/database");


const Resource_tags = sequelize.define('Resource_tags',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    resource_id:{
        type:DataTypes.INTEGER,
        allowNull:false

    },
   
    tag:{
        type:DataTypes.STRING,
        allowNull:false
    }

},{
    tableName:"resource_tags",
    timestamps:true,
    createdAt:'created_at',
    updatedAt:false
});

module.exports = Resource_tags;