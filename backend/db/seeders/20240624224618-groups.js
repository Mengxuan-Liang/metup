"use strict";

/** @type {import('sequelize-cli').Migration} */
const { Group } = require("../models");
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define schema in options object
}
module.exports = {
  async up(queryInterface, Sequelize) {
    await Group.bulkCreate(
      [
        {
          organizerId: 1,
          name: "Dog Lovers Meetup",
          about:
            "A group for people who love dogs and want to meet other dog owners.",
          type: "In person",
          private: true,
          city: "New York",
          state: "NY",
        },
        {
          organizerId: 2,
          name: "Tech Enthusiasts",
          about: "Discuss the latest trends in technology and programming.",
          type: "In person",
          private: false,
          city: "Boston",
          state: "MA",
        },
        {
          organizerId: 2,
          name: "Fitness Fanatics",
          about: "Join us for group workouts and fitness challenges.",
          type: "In person",
          private: false,
          city: "Boston",
          state: "MA",
        },
        {
          organizerId: 3,
          name: "Book Club",
          about: "A monthly book club meeting for avid readers.",
          type: "In person",
          private: true,
          city: "New York",
          state: "NY",
        },
        {
          organizerId: 1,
          name: "Cooking Class",
          about: "Learn new recipes and cooking techniques in our classes.",
          type: "In person",
          private: false,
          city: "Boston",
          state: "MA",
        },
        {
          organizerId: 2,
          name: "Travel Buddies",
          about: "Connect with fellow travelers and share your adventures.",
          type: "In person",
          private: false,
          city: "Boston",
          state: "MA",
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Groups";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        name: {
          [Op.in]: ["Tennis", "Hiking"],
        },
      },
      {}
    );
  },
};
