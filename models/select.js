'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Select extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userKey',
        targetKey: 'userKey',
      });
      this.hasMany(models.Comment, {
        foreignKey: 'selectKey',
        sourceKey: 'selectKey',
      });
      this.hasMany(models.Vote, {
        foreignKey: 'selectKey',
        sourceKey: 'selectKey',
      });
    }
  }
  Select.init(
    {
      selectKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: DataTypes.STRING,
      category: DataTypes.STRING,
      deadLine: DataTypes.DATE,
      options: DataTypes.JSON,
      image: DataTypes.JSON,
      compeltion: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Select',
    }
  );
  return Select;
};
