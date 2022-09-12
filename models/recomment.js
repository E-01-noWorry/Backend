'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recomment extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userKey',
        targetKey: 'userKey',
      });
      this.belongsTo(models.Comment, {
        foreignKey: 'commentKey',
        targetKey: 'commentKey',
      });
    }
  }
  Recomment.init(
    {
      recommentKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      comment: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Recomment',
    }
  );
  return Recomment;
};
