const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");

const Group_members = sequelize.define('Group_members', {
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
    joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: "Group_members",
    timestamps: false
});

module.exports = Group_members;