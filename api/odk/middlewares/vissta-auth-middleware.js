var jsonwebtoken = require('jsonwebtoken');
var settings = require ('../../../settings');
var CustomError = require('../../../util/error');

module.exports = function() {
    return function(req, res, next) {

        // decode token
        jsonwebtoken.verify(req.token, new Buffer(settings.formAuth.secret, 'base64') ,function(err, decoded) {
            if (err) throw new CustomError("The authorization credentials provided for the request are invalid");
            req.user = decoded;
            next();
        })
    };
};