'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      userKey: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nickname: {
        type: Sequelize.STRING,
      },
      point: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      refreshToken: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      deviceToken: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      snsId: {
        type: Sequelize.STRING,
      },
      provider: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Users');
  },
};
