'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Venue } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    await Venue.bulkCreate([
      {
        groupId: 1,
        address: '123 Elm Street',
        city: 'Boston',
        state:'MA',
        lat:'42.092655',
        lng: '-71.267555'
      },
      {
        groupId: 2,
        address: '3 South Street',
        city: 'Boston',
        state:'MA',
        lat:'62.092655',
        lng: '-91.267555'
      }
    ],{validate: true})
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Venues';
    return queryInterface.dropTable(options);
  }
};
