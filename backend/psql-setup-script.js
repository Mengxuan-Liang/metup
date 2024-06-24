/*
Ensures that a specific database schema (process.env.SCHEMA) exists before any operations are performed that depend on it.
Useful in applications where different schemas are used for different purposes (e.g., multi-tenant applications).
*/

const { sequelize } = require('./db/models');

sequelize.showAllSchemas({ logging: false }).then(async (data) => {
  if (!data.includes(process.env.SCHEMA)) {
    await sequelize.createSchema(process.env.SCHEMA);
  }
});