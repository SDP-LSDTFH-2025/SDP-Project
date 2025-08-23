const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");

const Group_chats = sequelize.define('group_chats', {
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
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: "group_chats",
    timestamps: false
});

module.exports = Group_chats;