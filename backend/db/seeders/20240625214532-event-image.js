'use strict';

/** @type {import('sequelize-cli').Migration} */
const { EventImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    await EventImage.bulkCreate([
      {
        eventId: 1,
        url: 'www.img1.com',
        preview: true
      },
      {
        eventId: 2,
        url: 'www.img2.com',
        preview: true
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'EventImages';
    return queryInterface.dropTable(options);
  }
};
