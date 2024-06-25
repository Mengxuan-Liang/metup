'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Membership } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    await Membership.bulkCreate([
      {
        userId: 1,
        groupId: 1,
        status: 'co-host'
      },
      {
        userId: 2,
        groupId: 2,
        status: 'co-host'
      },
    ],{validate: true})
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Memberships';
    return queryInterface.bulkDelete(options, {},{})
  }
};
