'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rooms', {
      roomKey: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      max: {
        type: Sequelize.INTEGER,
      },
      hashTag: {
        type: Sequelize.JSON,
      },
      roomUserKeys: {
        type: Sequelize.JSON,
      },
      roomUserNickname: {
        type: Sequelize.JSON,
      },
      roomUserNum: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Rooms');
  },
};
