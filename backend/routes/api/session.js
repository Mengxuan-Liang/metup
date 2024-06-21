// This file will hold the resources for the route paths beginning with /api/session
const express = require('express')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();

// Validating login req.body
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
/*
The validateLogin middleware is composed of the check and handleValidationErrors middleware. 
'check'mw checks to see whether or not req.body.credential and req.body.password are empty. 
If one of them is empty, then an error will be returned as the response in 'handleValidationErrors' mw.
*/
const validateLogin = [
    check('credential') // either username or email
        .exists({checkFalsy: true})//This method checks if the credential field exists in the request. The option { checkFalsy: true } ensures that the field is not only present but also not falsy (i.e., it can't be false, null, 0, "", etc.).
        .notEmpty()
        .withMessage('Please provide a valid email or username.'),
    check('password')
        .exists({checkFalsy: true})
        .withMessage('Please provide a password.'),
    handleValidationErrors //handles any validation errors that occur, formatting and sending them back to the client if needed.
];


// LOG IN
router.post(
    '/',
    validateLogin, //connect the POST /api/session route to the validateLogin middleware
    async (req, res, next) => {
        const {credential, password} = req.body;

        const user = await User.unscoped().findOne({
            where: {
                [Op.or]: {
                    username: credential,
                    email: credential
                }
            }
        });
        if(!user || !bcrypt.compareSync(password, user.hashedPassword.toString())){
            const err = new Error('Login failed');
            err.status = 401;
            err.title = 'Login failed';
            err.errors = {credential: 'The provided credentials were invalid.'};
            return next(err);
        }

        const safeUser = {
            id:user.id,
            email: user.email,
            username: user.username,
        };
        await setTokenCookie(res, safeUser);
        return res.json({
            user: safeUser
        });
    }
);

// LOG OUT: The DELETE /api/session logout route will remove the token cookie from the response and return a JSON success message.
router.delete(
    '/',
    (req,res)=> {
        res.clearCookie('token');
        return res.json({message: 'success'})
    }
);

// GET SESSION USER
/*
The GET /api/session get session user route will return the session user as JSON under the key of user . 
If there is not a session, it will return a JSON with an empty object. 
req.user should be assigned when the restoreUser middleware is called as it was connected to the router in
the routes/api/index.js file before the routes/api/session.js was connected to the router (router.use(restoreUser)).
*/
router.get(
    '/',
    (req,res)=> {
        const {user} = req;
        if(user){
            const safeUser = {
                id: user.id,
                email: user.email,
                username: user.username,
            };
            return res.json({
                user: safeUser
            });
        }else return res.json({user: null})
    }
);









module.exports = router;