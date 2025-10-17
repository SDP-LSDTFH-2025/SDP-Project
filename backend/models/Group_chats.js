const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");

const GroupChats = sequelize.define(
  "group_chats",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // You can add a reference if you have a Groups model:
      // references: { model: 'groups', key: 'id' },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'users', key: 'id' },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // ✅ automatically false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // ✅ automatically current time
    },
  },
  {
    tableName: "group_chats",
    timestamps: false, // ✅ no Sequelize managed timestamps
    underscored: true, // optional — helps keep naming consistent
  }
);

module.exports = GroupChats;
