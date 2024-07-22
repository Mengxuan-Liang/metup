"use strict";

/** @type {import('sequelize-cli').Migration} */
const { Event } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define schema in options object
}
module.exports = {
  async up(queryInterface, Sequelize) {
    await Event.bulkCreate(
      [
        {
          venueId: 1,
          groupId: 1,
          name: "The Genesis Bitcoin Meetup",
          description:
            "Come be a part of the very first Societal Hardfork Bitcoin Meetup! Where the plan is to just hang out tell our stories and get feedback and ideas about future meetups.",
          type: "In person",
          capacity: 10,
          price: 10,
          startDate: "2024-07-01",
          endDate: "2024-07-03",
        },
        {
          venueId: 2,
          groupId: 2,
          name: "Tech Meetup",
          description: "A meetup for tech enthusiasts.",
          type: "Online",
          capacity: 20,
          price: 5,
          startDate: "2024-08-01",
          endDate: "2024-08-05",
        },
        {
          venueId: 1,
          groupId: 2,
          name: "Photography Workshop",
          description:
            "A workshop for amateur photographers looking to enhance their skills. Bring your camera and join us for a day of learning and practice.",
          type: "Online",
          capacity: 20,
          price: 5,
          startDate: "2024-09-01",
          endDate: "2024-09-05",
        },
        {
          venueId: 2,
          groupId: 1,
          name: "Summer 5K Fun Run",
          description:
            "Participate in our annual 5K run! A perfect event for fitness lovers and those looking to challenge themselves in the summer heat.",
          type: "Online",
          capacity: 20,
          price: 5,
          startDate: "2024-09-01",
          endDate: "2024-09-05",
        },
        {
          venueId: 2,
          groupId: 3,
          name: "Book Lovers Meet & Greet",
          description:
            "An informal gathering for book enthusiasts to discuss their favorite reads and meet fellow bibliophiles.",
          type: "In person",
          capacity: 15,
          price: 5,
          startDate: "2024-08-15",
          endDate: "2024-08-15",
        },
        {
          venueId: 1,
          groupId: 4,
          name: "Digital Marketing Workshop",
          description:
            "Join us for a comprehensive workshop on digital marketing strategies and techniques to boost your business online.",
          type: "Online",
          capacity: 100,
          price: 15,
          startDate: "2024-1-01",
          endDate: "2024-1-02",
        },
        {
          venueId: 2,
          groupId: 5,
          name: "Yoga Retreat Weekend",
          description:
            "A relaxing weekend retreat focused on yoga, mindfulness, and wellness. Perfect for beginners and experienced yogis alike.",
          type: "In person",
          capacity: 20,
          price: 150,
          startDate: "2024-10-10",
          endDate: "2024-10-12",
        },
        {
          venueId: 2,
          groupId: 6,
          name: "Creative Writing Workshop",
          description:
            "Enhance your writing skills with our creative writing workshop. Perfect for aspiring writers and storytellers.",
          type: "In person",
          capacity: 15,
          price: 40,
          startDate: "2024-11-05",
          endDate: "2024-11-05",
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Events";
    return queryInterface.bulkDelete(options, null, {});
  },
};
