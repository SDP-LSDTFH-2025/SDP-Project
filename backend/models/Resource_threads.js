const {DataTypes} = require('sequelize');
const {sequelize} = require("../config/database");


const Resource_threads = sequelize.define('Resource_threads',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    resource_id:{
        type:DataTypes.INTEGER,
        allowNull:false

    },
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    message:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    parent_id:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    created_at:{
        type:DataTypes.DATE,
        allowNull:false,
        defaultValue:DataTypes.NOW
    }

},{
    tableName:"resource_threads",
    timestamps:true,
    createdAt:'created_at',
    updatedAt:false
});

module.exports = Resource_threads;