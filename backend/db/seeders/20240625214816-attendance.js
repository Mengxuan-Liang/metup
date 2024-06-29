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
        status: 'waitlist'
      },
      {
        eventId: 1,
        userId: 2,
        status: 'pending'
      },
      {
        eventId: 2,
        userId: 2,
        status: 'pending'
      },
      {
        eventId: 2,
        userId: 1,
        status: 'attending'
      },
      {
        eventId: 3,
        userId: 2,
        status: 'attending'
      },
      {
        eventId: 3,
        userId: 2,
        status: 'pending'
      },
    ],{validate: true})
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Attendances';
    return queryInterface.dropTable(options);
  }
};
