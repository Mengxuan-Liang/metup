const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const routes = require('./routes');

const { environment } = require('./config');
const isProduction = environment === 'production';

const { ValidationError } = require('sequelize');

const app = express();
app.use(morgan('dev'));

app.use(cookieParser());
app.use(express.json());

// Security Middleware
if (!isProduction) {
    // enable cors only in development
    app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
    helmet.crossOriginResourcePolicy({
        policy: "cross-origin"
    })
);

// Set the _csrf token, stores it in a cookie and create req.csrfToken method
// app.use() is used to add middleware to Express application, here 'csurf' middleware
// is being added;csurf is a middleware for CSRF protection. It adds a _csrf token to requests and provides a method to generate CSRF tokens.
// the 'csurf' is called with a configuration object for its cookie option
// This mw will create a 'csurf' token and add a 'req.csrfToken()' method to the req obj;
// The token is stored in a cookie and used to verify subsequent requests.
// 'req.csrfToken()' method will generate a new token that can be used in routes
//The XSRF-TOKEN cookie value needs to be sent in the header of any request with all HTTP verbs besides GET.
//This header will be used to validate the _csrf cookie to confirm that the request comes from your site and not an unauthorized site.
/*
The req.csrfToken() method generates a CSRF token using the secret from the _csrf cookie.
*/
app.use(
    csurf({
        cookie: { //cookie: The CSRF token will be stored in a cookie with the following properties:
            secure: isProduction,
            sameSite: isProduction && "Lax",
            httpOnly: true
        }
    })
);

app.use(routes); // Connect all the routes


// error handlers
// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found.");
    err.title = "Resource Not Found";
    err.errors = { message: "The requested resource couldn't be found." };
    err.status = 404;
    next(err);
});

// Process sequelize errors
/*
When Sequelize encounters validation errors while performing operations on models (like creating, updating, or validating instances), it throws instances of ValidationError.
This object contains an array of errors, where each error object represents a specific validation failure.

error.path refers to the field (or attribute) of the model where the validation error occurred.
For example, if you have a User model with a username field that failed validation, error.path would be 'username'.

In Sequelize's ValidationError, the actual path (or attribute name) where the validation error occurred is not directly provided as a separate property like .path.
Instead, you typically need to infer the path from the context in which the error is handled.

After constructing the errors object, the middleware modifies err.title to 'Validation error' and assigns the errors object to err.errors.
This transformation helps standardize how validation errors are communicated back to the client.
*/
app.use((err, _req, _res, next) => {
    // check if error is a Sequelize error:
    if (err instanceof ValidationError) {
      let errors = {};
      for (let error of err.errors) {
        errors[error.path] = error.message;
      }
      err.title = 'Validation error';
      err.errors = errors;
    }
    next(err);
  });

// Error formatter
app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);
    res.json({
      title: err.title || 'Server Error',
      message: err.message,
      errors: err.errors,
      stack: isProduction ? null : err.stack
    });
  });

module.exports = app;
