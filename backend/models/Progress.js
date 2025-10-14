const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const Progress = sequelize.define('progress', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    section: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hours_studied: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    date_last_studied: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    progress:{
        type:DataTypes.FLOAT,
        allowNull: true
    },
    completed:{
        type:DataTypes.BOOLEAN,
        allowNull:true
    },
    study_days_streak: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: "progress",
    timestamps: false
});

module.exports = Progress;