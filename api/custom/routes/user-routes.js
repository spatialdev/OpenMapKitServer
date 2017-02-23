var router = require('express').Router({ mergeParams: true });
var visstaAuth = require('./../middlewares/vissta-auth-middleware');
var CustomError = require('../../../util/error');
var settings = require('../../../settings');
var pgb = require('../../../util/pg-binding');
var jsonwebtoken = require('jsonwebtoken');

/**
 * Authenticate user
 */
router.post('/authenticate', function (req, res, next) {

    // check for authentication settings
    if (!settings.formAuth || typeof settings.formAuth.secret !== 'string') {
        throw new CustomError('Missing authentication settings', 500);
    }

    // authentication request requires username & password
    if (typeof req.body.username === "string" && typeof req.body.password === "string") {

        // Check creds against database
        var db = pgb.getDatabase();
        var sql = 'SELECT ___authenticate_user($1, $2)';

        // Request data from the database
        db.one(sql, [req.body.username, req.body.password])
            .then(function (results) {
                // save user info
                var user = JSON.parse(results["___authenticate_user"])[0];

                // create token
                var token = jsonwebtoken.sign(user, new Buffer(settings.formAuth.secret, 'base64') , {
                    expiresIn : settings.formAuth.expiresIn
                });

                res.set('Authorization', token)
                    .set('Access-Control-Expose-Headers', 'Authorization')
                    .json({token:token, user:user});

            })
            .catch(function (error) {
                // send back error
                return next(new CustomError(error.message, 401));
            });

    } else {
        next(new CustomError('Missing authentication settings', 500));
    }
});

module.exports = router;