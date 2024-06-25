// This file will hold the resources for the route paths beginning with /api/users
const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();
// VALIDATING signup req.body
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { where } = require('sequelize');
const validateSignup = [
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Invalid email'),
    check('username')
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage('Please provide a username with at least 4 characters'),
    check('username')
        .not()
        .isEmail()
        .withMessage('Username cannot be an email.'),
    check('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    check('firstName')
        .exists({checkFalsy: true})
        .withMessage('First Name is required'),
    check('lastName')
        .exists({checkFalsy: true})
        .withMessage('Last Name is required'),
    handleValidationErrors
];

// SIGNUP
router.post(
    '/',
    validateSignup,
    async (req, res) => {
        const { email, password, username, firstName, lastName } = req.body; //In the route handler, deconstruct the request body
        const emailExist = await User.findOne({ where: { email } });
        if (emailExist) {
            res.status(500).json({
                "message": "User already exists",
                "errors": {
                    "email": "User with that email already exists"
                }
            })
        }
        const usernameExist = await User.findOne({ where: { username } });
        if (usernameExist) {
            res.status(500).json({
                "message": "User already exists",
                "errors": {
                    "username": "User with that username already exists"
                }
            })
        }
        const hashedPassword = bcrypt.hashSync(password);//use bcrypt's hashSync function to hash the user's provided password to be saved as the user's hashedPassword in the database.
        const user = await User.create({ email, username, hashedPassword, firstName, lastName });//Create a new User in the database with the username and email from the request body and the hashedPassword generated from bcryptjs.
        //use setTokenCookie to log in the user by creating a JWT cookie with the user's non-sensitive information as its payload.
        const safeUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        };
        await setTokenCookie(res, safeUser);
        //send a JSON response containing the user's non-sensitive information.
        return res.json({
            user: safeUser
        });
    }
)


module.exports = router;