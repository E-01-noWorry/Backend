'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userKey',
        targetKey: 'userKey',
      });
      this.belongsTo(models.Room, {
        foreignKey: 'roomKey',
        targetKey: 'roomKey',
      });
    }
  }
  Chat.init(
    {
      chatKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      roomId: DataTypes.STRING,
      userId: DataTypes.STRING,
      userNickname: DataTypes.STRING,
      chat: DataTypes.STRING,
      userImg: DataTypes.STRING,
    },
    {
      timestamp: true,
      sequelize,
      modelName: "Chats",
    }
  );
  return Chat;
};
