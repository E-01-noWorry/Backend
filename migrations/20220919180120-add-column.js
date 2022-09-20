'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'refreshToken', {
      type: Sequelize.STRING,
      defaultValue: '',
    });
    await queryInterface.addColumn('Users', 'deviceToken', {
      type: Sequelize.STRING,
      defaultValue: '',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'refreshToken');
    await queryInterface.removeColumn('Users', 'deviceToken');
  },
};
