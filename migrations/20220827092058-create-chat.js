'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rooms', {
      roomId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      hostId: {
        type: Sequelize.STRING,
      },
      hostNickname: {
        type: Sequelize.STRING,
      },
      hostImg: {
        type: Sequelize.STRING,
      },
      max: {
        type: Sequelize.STRING,
      },
      hashTag: {
        type: Sequelize.JSON,
      },
      roomUserId: {
        type: Sequelize.JSON,
      },
      roomUserNickname: {
        type: Sequelize.JSON,
      },
      roomUserNum: {
        type: Sequelize.INTEGER,
      },
      roomUserImg: {
        type: Sequelize.JSON,
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
