const express = require('express');
const router = express.Router();
const apiRouter = require('./api');

router.use('/api', apiRouter);
// test route
// router.get('/hello/world', function(req, res) {
//   res.cookie('XSRF-TOKEN', req.csrfToken());
//   res.send('Hello World!');
// });

// Add a XSRF-TOKEN cookie; this endpoint is designed to provide a CSRF token to the client
router.get("/api/csrf/restore", (req, res) => {
    // generate a CSRF token using the 'req.csrfToken()' method provided by the 'csurf' mw
    const csrfToken = req.csrfToken();
    // this cookie will be stored by the client/browser
    res.cookie("XSRF-TOKEN", csrfToken);
    res.status(200).json({
        'XSRF-Token': csrfToken
    });
});


module.exports = router;