'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Group } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    await Group.bulkCreate([
      {
        organizerId: 1,
        name:'Tennis',
        about: "Enjoy rounds of tennis with a tight-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.",
        type: 'In person',
        private: true,
        city:'New York',
        state: 'NY'
      },
      {
        organizerId: 2,
        name:'Hiking',
        about: "Enjoy hiking",
        type: 'In person',
        private: false,
        city:'Boston',
        state: 'MA'
      },
      {
        organizerId: 2,
        name:'Swimming',
        about: "Enjoying",
        type: 'In person',
        private: false,
        city:'Boston',
        state: 'MA'
      },
    ], {validate: true})
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Groups';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: {
        [Op.in]:['Tennis','Hiking']
      }
    },{})
  }
};
