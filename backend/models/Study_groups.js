const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");


const Study_groups = sequelize.define('Study_groups',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false,
        unique:true,
    },
    name:{
        type:DataTypes.STRING,
        allowNull: false,
    },
    course_id:{
        type:DataTypes.INTEGER,
        allowNull: false,
    },
    creater_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    scheduled_time:{
        type:DataTypes.TIME,
        allowNull:false,
    },
    location:{
        type:DataTypes.STRING,
        allowNull:false
    },
    disabled:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    created_at:{
        type:DataTypes.TIME
    }
},{
    tableName: "Study_groups",
    timestamps:false
})

module.exports = Study_groups