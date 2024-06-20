const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Three functions for authentication

// 1. setTokenCookie
//setting the JWT cookie after a user is logged in or signed up; this function will be used in the login and signup routes 
const setTokenCookie = (res, user) => {
    // create the token
    const safeUser = {
        id: user.id,
        email:user.email,
        username: user.username,
    };
    const token = jwt.sign(
        {data: safeUser},
        secret,
        {expiresIn: parseInt(expiresIn)}
    );

    const isProduction = process.env.NODE_ENV === 'production';

    // set the token cookie
    res.cookie('token', token, {
        maxAge: expiresIn * 1000, // maxAge in milliseconds
        httpOnly: true,
        secure: isProduction,
        sameSite:isProduction && 'Lax'
    });

    return token;
}

// 2. restoreUser: this middleware will be connected to the API router 
//so that all API route handlers will check if there is a current user logged in or not.
const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const {token} = req.cookies;
    req.user = null;

    return jwt.verify(token, secret, null, async (err, jwtPayload)=> {
        if(err){
            return next();
        }

        try {
            const {id} = jwtPayload.data;
            req.user = await User.findByPk(id, {
                attributes:{
                    include:['email','createdAt','updatedAt']
                }
            })
        } catch (e) {
            res.clearCookie('token');
            return next();
        }
        if(!req.user) res.clearCookie('token');
        return next();
    })
}

// 3. requireAuth: this mw is for requiring a session user to be authenticated before accessing a route;
//will be connected directly to route handlers where there needs to be a current user logged in for the actions in those route handlers.
/*
Define this middleware as an array with the restoreUser middleware function you just created as the first element in the array. 
This will ensure that if a valid JWT cookie exists, the session user will be loaded into the req.user attribute. 
The second middleware will check req.user and will go to the next middleware if there is a session user present there. 
If there is no session user, then an error will be created and passed along to the error-handling middlewares.
*/
const requireAuth = function (req, res, next) {
    if(req.user) return next();
    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = {message: 'Authentication required'};
    err.status = 401;
    return next(err);
}


module.exports = { setTokenCookie, restoreUser, requireAuth };