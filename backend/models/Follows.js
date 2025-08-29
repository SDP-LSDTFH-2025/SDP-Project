const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");

const Follows = sequelize.define('follows', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    followee_id: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: "follows",
    timestamps: false
});

module.exports = Follows;