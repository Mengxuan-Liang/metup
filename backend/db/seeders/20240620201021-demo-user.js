'use strict';

/** @type {import('sequelize-cli').Migration} */
const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        email: 'baloo@user.io',
        username: 'Baloo',
        firstName: 'Baloo',
        lastName: 'Liang',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email:'nana@user.io',
        username:'Nana',
        firstName: 'Nana',
        lastName:'Gao',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email: 'niuniu@user.io',
        username:'Niuniu',
        firstName:'Niuniu',
        lastName:'Liang',
        hashedPassword:bcrypt.hashSync('password')
      }
    ], {validate: true}) // 'validate' comes from Sequelize library, this validation is based on the validation rules defined in models; it tells Sequelize to run these validations on each record being created.
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: {
        [Op.in]:['Baloo','Nana','Niuniu']
      }
    },{}) // Empty object as placeholder for additional options
  }
};
