var settings = require('../settings');
var CustomError = require('./error');
var pgbinding = require('./pg-binding');
var jsonwebtoken = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // let 'em through if no auth is specified in settings...
    if (!settings.formAuth || typeof settings.formAuth.secret !== 'string') {
        throw new CustomError('Missing authentication settings', 500);
    }

    // authentication request requires username & password
    if (typeof req.body.username === "string" && typeof req.body.password === "string") {

        // Check creds against database
        var db = pgbinding.getDatabase();
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
        throw new CustomError('Missing authentication settings', 500);
    }
};