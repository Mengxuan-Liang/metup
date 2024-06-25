'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Attendance } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    await Attendance.bulkCreate([
      {
        eventId: 1,
        userId: 1,
        status: 'In person'
      },
      {
        eventId: 2,
        userId: 2,
        status: 'Online'
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Attendances';
    return queryInterface.dropTable(options);
  }
};
