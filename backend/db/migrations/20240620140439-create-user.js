'use strict';
/** @type {import('sequelize-cli').Migration} */

// The 'options' obj in Sequelize migration methods is used for various configurations
// 'options' specigy which schema a table or operation belongs to, scoping the operation within the appropriate
// environments, enable dynamic configuration based on the environment.
let options = {};
if(process.env.NODE_ENV === 'production'){
  options.schema = process.env.SCHEMA; // define schema in options obj
}
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: true
      },
      hashedPassword: {
        type: Sequelize.STRING.BINARY,
        allowNull: false
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
    }, options);
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Users';
    return queryInterface.dropTable(options);
  }
};