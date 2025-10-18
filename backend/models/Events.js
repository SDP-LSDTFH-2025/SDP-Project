const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Events = sequelize.define('Events', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    eventPlanner: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'event_planner'
    },
    event_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    guest_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    venue_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: 'Events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Events;
