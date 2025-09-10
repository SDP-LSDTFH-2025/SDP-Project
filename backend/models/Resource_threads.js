const {DataTypes} = require('sequelize');
const {sequelize} = require("../config/database");
const { v4: uuidv4 } = require('uuid');

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
        type:DataTypes.UUID,
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
    timestamps: false
});

module.exports = Resource_threads;