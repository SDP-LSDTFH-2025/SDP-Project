import { sequelize } from "../config/database";
import { DataTypes } from "sequelize";

const Progress = sequelize.define('Progress', {
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
    tableName: "Progress",
    timestamps: false
});

export default Progress;