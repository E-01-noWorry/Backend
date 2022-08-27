'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.Selects, {
        foreignKey: 'userKey',
        sourceKey: 'userKey',
      });
      this.hasMany(models.Comments, {
        foreignKey: 'userKey',
        sourceKey: 'userKey',
      });
      this.hasMany(models.Votes, {
        foreignKey: 'userKey',
        sourceKey: 'userKey',
      });
      this.hasMany(models.Rooms, {
        foreignKey: 'userKey',
        sourceKey: 'userKey',
      });
      this.hasMany(models.Chats, {
        foreignKey: 'userKey',
        sourceKey: 'userKey',
      });
    }
  }
  User.init(
    {
      userKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: DataTypes.STRING,
      snsId: DataTypes.STRING,
      provider: DataTypes.STRING,
      nickname: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
