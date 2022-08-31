'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      // this.belongsTo(models.User, {
      //   foreignKey: 'userKey',
      //   targetKey: 'userKey',
      // });
      // this.hasMany(models.Chat, {
      //   foreignKey: 'roomKey',
      //   sourceKey: 'roomKey',
      // });
    }
  }
  Rooms.init(
    {
      roomKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: DataTypes.STRING,
      hostId: DataTypes.STRING,
      hostNickname: DataTypes.STRING,
      hostImg: DataTypes.STRING,
      max: DataTypes.STRING,
      hashTag: DataTypes.JSON,
      roomUserId: DataTypes.JSON,
      roomUserNickname: DataTypes.JSON,
      roomUserNum: DataTypes.INTEGER,
      roomUserImg: DataTypes.JSON,
    },
    {
      timestamp: true,
      sequelize,
      modelName: "Rooms",
    }
  );
  return Rooms;
};
