'use strict';

/** @type {import('sequelize-cli').Migration} */
const { GroupImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
   await GroupImage.bulkCreate([
    {
      groupId: 1,
      url: 'img1.url',
      preview: true
    },
    {
      groupId: 2,
      url: 'img2.url',
      preview: true
    },
   
   ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'GroupImages';
    return queryInterface.dropTable(options);
  }
};
