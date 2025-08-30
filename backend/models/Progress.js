const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const Progress = sequelize.define('progress', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
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
        allowNull: false,
    },
    hours_studied: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    study_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    }
}, {
    tableName: "progress",
    timestamps: false
});

module.exports = Progress;