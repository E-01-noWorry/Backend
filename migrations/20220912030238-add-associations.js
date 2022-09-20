'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Recomments', 'userKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Recomments', 'commentKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Comments',
        key: 'commentKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'Recomments', // name of Source model
      'userKey' // key we want to remove
    );

    await queryInterface.removeColumn(
      'Recomments', // name of Source model
      'commentKey' // key we want to remove
    );
  },
};
