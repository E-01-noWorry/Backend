'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Selects', {
      selectKey: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      category: {
        type: Sequelize.STRING,
      },
      deadLine: {
        type: Sequelize.DATE,
      },
      options: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      image: {
        type: Sequelize.JSON,
        defaultValue: [],
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
    await queryInterface.dropTable('Selects');
  },
};
