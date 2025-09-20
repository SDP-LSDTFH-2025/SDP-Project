const { DataTypes } = require('sequelize'); 
const { sequelize } = require('../config/database');

const public_resources = sequelize.define('public_resources', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    public_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    picture_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    event_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = public_resources;