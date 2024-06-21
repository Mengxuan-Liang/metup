// This file will hold the resources for the route paths beginning with /api/session
const express = require('express')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();

// LOG IN
router.post(
    '/',
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




module.exports = router;