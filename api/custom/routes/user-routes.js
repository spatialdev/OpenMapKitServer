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
        next(new CustomError('Missing authentication settings', 500));
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

                // get the token expiration
                var date = new Date();
                var in3hours = new Date(date.getFullYear() , date.getMonth() , date.getDate() , date.getHours() + parseInt(settings.formAuth.expiresIn.charAt(0)) , date.getMinutes() , date.getSeconds())

                res.set('Authorization', token)
                    .set('Access-Control-Expose-Headers', 'Authorization')
                    .json({token:token, tokenExpiration: in3hours, user:user});

            })
            .catch(function (error) {
                // send back error
                return next(new CustomError(error.message, 401));
            });

    } else {
        next(new CustomError('Username and password required', 400));
    }
});

/**
 * Create user form role
 */
router.post('/user/:user_id/form/:form_id', function (req, res, next){

    // check for authentication settings
    if (!settings.formAuth || typeof settings.formAuth.secret !== 'string') {
        next(new CustomError('Missing authentication settings', 500));
    }

    // must be an admin
    if (req.user.role === "admin"){
        var sql, sqlParams, undefinedBodyPars, db;

        // Make sure all body parameters are defined; if not throw error
        undefinedBodyPars = [req.body.role]
            .some(function(bodyPar, key){
                return typeof bodyPar === 'undefined';
            });

        if(undefinedBodyPars) {
            return next(new CustomError('Missing required parameters', 400));
        }

        var validationErrors = req.validationErrors();
        if(validationErrors.length > 0) {
            return next(new CustomError(validationErrors[0].msg, 400));
        }

        db = pgb.getDatabase();
        sql = "SELECT ___assign_user_form ($1,$2,$3,$4)";

        // Request data from the database
        db.one(sql, [req.user.id, req.params.user_id, req.params.form_id, req.body.role])
            .then(function (results) {
                // return new form role info
                var form_role = JSON.parse(results["___assign_user_form"])[0];
                res.status(200).json({message:"success", status:200});

            })
            .catch(function (error) {
                // send back error
                return next(new CustomError(error.message, 400));
            });   
    } else {
        next(new CustomError("The user is not authorized to make the request.", 401));
    }

});

/**
 * Delete user form role
 */
router.delete('/user/:user_id/form/:form_id', function (req, res, next){

    // check for authentication settings
    if (!settings.formAuth || typeof settings.formAuth.secret !== 'string') {
        next(new CustomError('Missing authentication settings', 500));
    }

    // must be an admin
    if (req.user.role === "admin"){
        var sql, sqlParams, undefinedBodyPars, db;

        db = pgb.getDatabase();
        sql = "SELECT ___delete_user_form_role ($1,$2,$3)";

        // Request data from the database
        db.one(sql, [req.user.id, req.params.user_id, req.params.form_id])
            .then(function (results) {
                // return new form role info
                res.status(200).json({message:"success", status:200});
            })
            .catch(function (error) {
                // send back error
                return next(new CustomError(error.message, 400));
            });
    } else {
        next(new CustomError("The user is not authorized to make the request.", 401));
    }

});

/**
 * Patch user form role
 */
router.patch('/user/:user_id/form/:form_id', function (req, res, next){

    // check for authentication settings
    if (!settings.formAuth || typeof settings.formAuth.secret !== 'string') {
        next(new CustomError('Missing authentication settings', 500));
    }

    // must be an admin
    if (req.user.role === "admin"){
        var sql, sqlParams, undefinedBodyPars, db;

        // Make sure all body parameters are defined; if not throw error
        undefinedBodyPars = [req.body.role]
            .some(function(bodyPar, key){
                return typeof bodyPar === 'undefined';
            });

        if(undefinedBodyPars) {
            return next(new CustomError('Missing required parameters', 400));
        }

        db = pgb.getDatabase();
        sql = "SELECT ___edit_user_form_role ($1,$2,$3,$4)";

        // Request data from the database
        db.one(sql, [req.user.id, req.params.user_id, req.params.form_id, req.body.role])
            .then(function (results) {
                // return new form role info
                res.status(200).json({message:"success", status:200});
            })
            .catch(function (error) {
                // send back error
                return next(new CustomError(error.message, 400));
            });
    } else {
        next(new CustomError("The user is not authorized to make the request.", 401));
    }

});

/**
 * Create user
 */
router.post('/user', function (req, res, next){

    // check for authentication settings
    if (!settings.formAuth || typeof settings.formAuth.secret !== 'string') {
        next(new CustomError('Missing authentication settings', 500));
    }

    // must be an admin
    if (req.user.role === "admin"){
        var sql, sqlParams, undefinedBodyPars, db;

        // Make sure all body parameters are defined; if not throw error
        undefinedBodyPars = [req.body.username, req.body.password, req.body.role]
            .some(function(bodyPar, key){
                return typeof bodyPar === 'undefined';
            });

        if(undefinedBodyPars) {
            return next(new CustomError('Missing required parameters', 400));
        }

        db = pgb.getDatabase();
        sql = "SELECT ___create_user($1,$2,$3,$4,$5,$6,$7);";

        // create user record
        db.one(sql, [req.user.id, req.body.username, req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.body.role])
            .then(function (results) {
                // return success status
                res.status(200).json({message:"success", status:200, id : parseInt(results["___create_user"])});
            })
            .catch(function (error) {
                // send back error
                return next(new CustomError(error.message, 400));
            });
    } else {
        next(new CustomError("The user is not authorized to make the request.", 401));
    }

});

/**
 * Edit user
 */
router.patch('/user/:id', function (req, res, next){

    // check for authentication settings
    if (!settings.formAuth || typeof settings.formAuth.secret !== 'string') {
        next(new CustomError('Missing authentication settings', 500));
    }

    req.sanitizeParams('id').toInt();

    // must be an admin
    if (req.user.role === "admin" || req.user.id === req.params.id){
        var sql, sqlParams, undefinedBodyPars, invalidRoleType, db, password;

        // Make sure all body parameters are defined; if not throw error
        undefinedBodyPars = [req.params.id, req.body.edit_role, req.body.edit_username]
            .some(function(bodyPar, key){
                return typeof bodyPar === 'undefined';
            });

        invalidRoleType = [req.body.edit_role]
            .some(function(bodyPar, key){
                return bodyPar !== 'read' && bodyPar !== 'write' && bodyPar !== 'admin'
            });

        if(undefinedBodyPars) {
            return next(new CustomError('Missing required parameters', 400));
        }

        if(invalidRoleType) {
            return next(new CustomError('Invalid role type. Accepted types are read, write & admin', 400));
        }

        // if password is missing from body, set to null
        password = req.body.edit_password || null;

        db = pgb.getDatabase();
        sql = "SELECT ___edit_user($1, $2, $3, $4, $5, $6, $7, $8);";

        // create user record
        db.one(sql, [req.user.id, req.params.id, req.body.edit_username, req.body.edit_first_name, req.body.edit_last_name, req.body.edit_email, password, req.body.edit_role.toLowerCase()])
            .then(function (results) {
                // return success status
                res.status(200).json({message:"success", status:200});
            })
            .catch(function (error) {
                // send back error
                return next(new CustomError(error.message, 400));
            });
    } else {
        next(new CustomError("The user is not authorized to make the request.", 401));
    }

});

/**
 * Delete user
 */
router.delete('/user/:user_id', function (req, res, next){

    // check for authentication settings
    if (!settings.formAuth || typeof settings.formAuth.secret !== 'string') {
        next(new CustomError('Missing authentication settings', 500));
    }

    // must be an admin
    if (req.user.role === "admin"){
        var sql, sqlParams, undefinedBodyPars, db;

        db = pgb.getDatabase();
        sql = "SELECT ___delete_user ($1,$2)";

        // Request data from the database
        db.one(sql, [req.user.id, req.params.user_id])
            .then(function (results) {
                // return new form role info
                res.status(200).json({message:"success", status:200});
            })
            .catch(function (error) {
                // send back error
                return next(new CustomError(error.message, 400));
            });
    } else {
        next(new CustomError("The user is not authorized to make the request.", 401));
    }

});

module.exports = router;