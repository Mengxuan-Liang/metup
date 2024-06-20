// This file will hold the resources for the route paths beginning with /api/users
const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// SIGNUP
router.post(
    '/',
    async (req, res) => {
        const {email, password, username} = req.body; //In the route handler, deconstruct the request body
        const hashedPassword = bcrypt.hashSync(password);//use bcrypt's hashSync function to hash the user's provided password to be saved as the user's hashedPassword in the database.
        const user = await User.create({email, username, hashedPassword});//Create a new User in the database with the username and email from the request body and the hashedPassword generated from bcryptjs.
//use setTokenCookie to log in the user by creating a JWT cookie with the user's non-sensitive information as its payload.
        const safeUser = {
            id: user.id,
            email: user.email,
            username: user.username,
        };
        await setTokenCookie(res, safeUser);
//send a JSON response containing the user's non-sensitive information.
        return res.json({
            user: safeUser
        });
    }
)


module.exports = router;