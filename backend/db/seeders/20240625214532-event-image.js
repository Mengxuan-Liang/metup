"use strict";

/** @type {import('sequelize-cli').Migration} */
const { EventImage } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define schema in options object
}
module.exports = {
  async up(queryInterface, Sequelize) {
    await EventImage.bulkCreate(
      [
        {
          eventId: 1,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          eventId: 2,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          eventId: 3,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          eventId: 4,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          eventId: 5,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          eventId: 6,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          eventId: 7,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          eventId: 8,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "EventImages";
    return queryInterface.dropTable(options);
  },
};
