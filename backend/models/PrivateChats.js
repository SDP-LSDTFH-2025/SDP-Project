const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const PrivateChats = sequelize.define('PrivateChats', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sender_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    receiver_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    message_type: {
        type: DataTypes.ENUM('text', 'voice_note', 'image', 'file'),
        allowNull: false,
        defaultValue: 'text'
    },
    audio_data: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    audio_duration: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    delivered_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tempId: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'private_chats',
    timestamps: false
});

module.exports = PrivateChats ;