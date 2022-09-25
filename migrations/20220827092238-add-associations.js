'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Selects', 'userKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Comments', 'userKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Votes', 'userKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Rooms', 'userKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Chats', 'userKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Participants', 'userKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Comments', 'selectKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Selects',
        key: 'selectKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

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

    await queryInterface.addColumn('Votes', 'selectKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Selects',
        key: 'selectKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Chats', 'roomKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Rooms',
        key: 'roomKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Participants', 'roomKey', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Rooms',
        key: 'roomKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'Selects', // name of Source model
      'userKey' // key we want to remove
    );

    await queryInterface.removeColumn(
      'Comments', // name of Source model
      'userKey' // key we want to remove
    );

    await queryInterface.removeColumn(
      'Recomments', // name of Source model
      'userKey' // key we want to remove
    );

    await queryInterface.removeColumn(
      'Votes', // name of Source model
      'userKey' // key we want to remove
    );

    await queryInterface.removeColumn(
      'Rooms', // name of Source model
      'userKey' // key we want to remove
    );

    await queryInterface.removeColumn(
      'Chats', // name of Source model
      'userKey' // key we want to remove
    );

    await queryInterface.removeColumn(
      'Comments', // name of Source model
      'selectKey' // key we want to remove
    );

    await queryInterface.removeColumn(
      'Recomments', // name of Source model
      'commentKey' // key we want to remove
    );

    await queryInterface.removeColumn(
      'Votes', // name of Source model
      'selectKey' // key we want to remove
    );

    await queryInterface.removeColumn(
      'Chats', // name of Source model
      'roomKey' // key we want to remove
    );
  },
};
