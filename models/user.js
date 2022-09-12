'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.Select, {
        foreignKey: 'userKey',
        sourceKey: 'userKey',
      });
      this.hasMany(models.Comment, {
        foreignKey: 'userKey',
        sourceKey: 'userKey',
      });
      this.hasMany(models.Recomment, {
        foreignKey: 'userKey',
        sourceKey: 'userKey',
      });
      this.hasMany(models.Vote, {
        foreignKey: 'userKey',
        sourceKey: 'userKey',
      });
      this.hasMany(models.Room, {
        foreignKey: 'userKey',
        sourceKey: 'userKey',
      });
      this.hasMany(models.Chat, {
        foreignKey: 'userKey',
        sourceKey: 'userKey',
      });
      this.hasMany(models.Participant, {
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
      point: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
