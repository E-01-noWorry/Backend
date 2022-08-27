'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      this.belongsTo(models.Users, {
        foreignKey: 'userKey',
        targetKey: 'userKey',
      });
      this.hasMany(models.Chats, {
        foreignKey: 'roomKey',
        sourceKey: 'roomKey',
      });
    }
  }
  Room.init(
    {
      roomKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: DataTypes.STRING,
      keyword: DataTypes.JSON,
      max: DataTypes.INTEGER,
      currentPeople: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Room',
    }
  );
  return Room;
};
