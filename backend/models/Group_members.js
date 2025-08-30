const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const Group_members = sequelize.define('group_members', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: "group_members",
    timestamps: false
});

module.exports = Group_members;