'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vote extends Model {
    static associate(models) {
      this.belongsTo(models.Users, {
        foreignKey: 'userKey',
        targetKey: 'userKey',
      });
      this.belongsTo(models.Selects, {
        foreignKey: 'selectKey',
        targetKey: 'selectKey',
      });
    }
  }
  Vote.init(
    {
      voteKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      choice: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Vote',
    }
  );
  return Vote;
};
