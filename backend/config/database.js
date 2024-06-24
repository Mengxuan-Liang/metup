//This will allow you to load the database configuration environment variables from the .env file into the config/index.js, 
//as well as define the global schema for the project.

/*
When start the project, the environment variables in the .env file will be loaded and applied in config/index.js, 
and then config/index.js will provide these variables for database.js to use.
1.Loading the .env file:
When the project starts, the dotenv library is used to load environment variables from the .env file into process.env.
2.Using config/index.js:
The config/index.js file reads these environment variables from process.env and structures them into a configuration object. This can include any necessary validation or default values.
3.Providing configuration to database.js:
The database.js file imports the configuration object from config/index.js and uses it to configure the database settings.
*/

const config = require('./index');

module.exports = {
  development: {
    storage: config.dbFile,
    dialect: "sqlite",
    seederStorage: "sequelize",
    logQueryParameters: true,
    typeValidation: true
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    seederStorage: 'sequelize',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      schema: process.env.SCHEMA
    }
  }
};
