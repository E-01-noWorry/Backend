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
      chat: DataTypes.STRING,
    },
    {
      timestamp: true,
      sequelize,
      modelName: 'Chat',
    }
  );
  return Chat;
};
