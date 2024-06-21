/*
VALIDATE req using validationResult from the express-validator package passing in the request. 
define an Express middleware called handleValidationErrors that will call validationResult 
from the express-validator package passing in the request. 
If there are no validation errors returned from the validationResult function, 
invoke the next middleware. If there are validation errors, create an error
with all the validation error messages and invoke the next error-handling middleware.

error obj might look like:
{
  errors: [
    {
      value: 'not-an-email',
      msg: 'Invalid value',
      param: 'email', // represents the name of the parameter that failed validation.
      location: 'body'
    },
    {
      value: '123',
      msg: 'Invalid value',
      param: 'password',
      location: 'body'
    }
  ]
}
*/

const {validationResult} = require('express-validator');
// mw for formatting errors from express-validator mw
const handleValidationErrors = (req, res, next) => {
    const ValidationErrors = validationResult(req); // this method returns an instance of 'Result', which is a class provided by 'express-validator'. 
    if(!ValidationErrors.isEmpty()){ //This 'Result' obj has methods:.isEmpty() returns True/False; .array() returns an array of error obj, each obj has properties like 'value','msg','param','location'.
        const errors = {};
        ValidationErrors.array().forEach(error => errors[error.path] = error.msg);

        const err = Error('Bad request.');
        err.errors = errors;
        err.status =  400;
        err.title = 'Bad request.';
        next(err);
    }
    next()
}

module.exports = {handleValidationErrors};