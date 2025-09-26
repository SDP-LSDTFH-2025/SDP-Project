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
    },
    event_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    guest_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    venue_id: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'events',
    timestamps: false
});

module.exports = Events;