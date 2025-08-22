const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");

const Study_sessions = sequelize.define('Study_sessions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    reminder_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    venue_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    venue_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: "Study_sessions",
    timestamps: false
});

module.exports = Study_sessions;