'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userKey',
        targetKey: 'userKey',
      });
      this.hasMany(models.Chat, {
        foreignKey: 'roomKey',
        sourceKey: 'roomKey',
      });
      this.hasMany(models.Participant, {
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
      max: DataTypes.INTEGER,
      hashTag: DataTypes.JSON,
    },
    {
      timestamp: true,
      sequelize,
      modelName: 'Room',
    }
  );
  return Room;
};
