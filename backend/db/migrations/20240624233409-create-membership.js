'use strict';
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define schema in options object
}
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Memberships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        reference: {
          model: 'Users'
        },
        onDelete:'CASCADE'
      },
      groupId: {
        type: Sequelize.INTEGER,
        references: {
          model:'Groups'
        },
        onDelete:'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('co-host', 'member','pending'),
        // values:['co-host', 'member','pending']
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    },options);
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Memberships';
    await queryInterface.dropTable(options);
    // This is needed to drop the ENUM type in PostgreSQL
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Memberships_status";');
  }
};