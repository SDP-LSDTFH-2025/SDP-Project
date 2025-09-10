const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const Follows_requests = sequelize.define('follows_requests', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement:true
    },
    follower_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    followee_id: { 
        type: DataTypes.UUID,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: "follows_requests",
    timestamps: false
});

module.exports = Follows_requests;