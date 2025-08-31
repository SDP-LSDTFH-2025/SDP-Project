const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require('uuid');

const Study_groups = sequelize.define('study_groups',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false,
        unique:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull: false,
    },
    course_id:{
        type:DataTypes.INTEGER,
        allowNull: true,
    },
    creator_id:{
        type:DataTypes.UUID,
        allowNull:false,
    },
    scheduled_time:{
        type:DataTypes.DATE,
        allowNull:false,
    },
    location:{
        type:DataTypes.STRING,
        allowNull:true
    },
    disabled:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue: false
    },
    created_at:{
        type:DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
},{
    tableName: "study_groups",
    timestamps:false
})

module.exports = Study_groups;