"use strict";

/** @type {import('sequelize-cli').Migration} */
const { GroupImage } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define schema in options object
}
module.exports = {
  async up(queryInterface, Sequelize) {
    await GroupImage.bulkCreate(
      [
        {
          groupId: 1,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          groupId: 2,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          groupId: 3,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          groupId: 4,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          groupId: 5,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
        {
          groupId: 6,
          url: "https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg",
          preview: true,
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "GroupImages";
    return queryInterface.dropTable(options);
  },
};
