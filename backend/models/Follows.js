import { sequelize } from "../config/database";
import { DataTypes } from "sequelize";

const Follows = sequelize.define('Follows', {
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
    tableName: "Follows",
    timestamps: false
});

export default Follows;