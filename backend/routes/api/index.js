/*
Make sure to keep the restoreUser middleware connected before any other middleware 
or route handlers are connected to the router. 
This will allow all route handlers connected to this router to retrieve the current 
user on the Request object as req.user. If there is a valid current user session, 
then req.user will be set to the User in the database. 
If there is NO valid current user session, then req.user will be set to null.
*/

const router = require("express").Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const groupsRouter = require('./groups.js');
const venuesRouter = require('./venues.js');
const eventsRouter = require('./events.js');
const eventImgRouter = require('./event-images.js');
const groupImgRouter = require('./group-images.js');
const { restoreUser } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
// If current user session is valid, set req.user to the user in the database
// If current user session is not valid, set req.user to null
router.use(restoreUser);
// connect router exported from session.js
router.use('/session', sessionRouter);
// connect router exported from users.js
router.use('/users', usersRouter);
router.use('/groups', groupsRouter);
router.use('/venues',venuesRouter);
router.use('/events', eventsRouter);
router.use('/event-images',eventImgRouter);
router.use('/group-images', groupImgRouter);

router.post('/test', function (req, res) {
    res.json({ requestBody: req.body });
});

module.exports = router;


// TESTING routes
// const router = require('express').Router();
// const { restoreUser } = require('../../utils/auth.js');

// router.use(restoreUser);

// const { setTokenCookie } = require('../../utils/auth.js');
// const { User } = require('../../db/models');

// // test route: GET /api/restore-user
// router.use(restoreUser);
// router.get(
//   '/restore-user',
//   (req, res) => {
//     return res.json(req.user);
//   }
// );

// // test route: GET /api/set-token-cookie: 
// // test the setTokenCookie function by getting the demo user and calling setTokenCookie.
// router.get('/set-token-cookie', async (_req, res) => {
//     const user = await User.findOne({
//         where: {
//             username: 'Baloo'
//         }
//     });
//     setTokenCookie(res, user);
//     return res.json({ user: user });
// });
// // test route: GET /api/require-auth
// const { requireAuth } = require('../../utils/auth.js');
// router.get(
//   '/require-auth',
//   requireAuth,
//   (req, res) => {
//     return res.json(req.user);
//   }
// );

// module.exports = router;