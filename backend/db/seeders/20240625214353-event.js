'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Event } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
   await Event.bulkCreate([
    {
      venueId: 1,
      groupId: 1,
      name:'The Genesis Bitcoin Meetup',
      descirption: "Come be a part of the very first Societal Hardfork Bitcoin Meetup! Where the plan is to just hang out tell our stories and get feedback and ideas about future meetups.",
      type:'In person',
      capacity:10,
      price: 10,
      startDate: '2024-07-01',
      endDate: '2024-07-03'
    },
    {
      venueId: 2,
      groupId: 2,
      name:'Tech Meetup',
      descirption: "A meetup for tech enthusiasts.",
      type:'Online',
      capacity:20,
      price: 5,
      startDate: '2024-08-01',
      endDate: '2024-08-05'
    },
   ],{validate: true})
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Events';
    return queryInterface.bulkDelete(options, null, {})
  }
};

