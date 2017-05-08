/**
 * Created by DBaah on 5/4/17.
 */

var router = require('express').Router({ mergeParams: true });
var pgb = require('../../../util/pg-binding');
var rmdir = require('rmdir');
var path = require('path');
var settings = require('../../../settings');
var visstaAuth = require('../middlewares/vissta-auth-middleware');
var CustomError = require('../../../util/error');
var exec = require('child_process').exec;
var visstaUtil = require('../../custom/util/vissta-auth-util');
var fs = require('fs');

router.delete('/omk_forms/:id', [visstaAuth()], function (req, res, next) {

    if (req.user.role === "admin") {

        if (typeof req.body.formFilename === "string") {

            // custom endpoint
            var recordId = req.params.id;
            var user = req.user;
            var formFilename = req.body.formFilename;
            var FORM_DIR = path.join(settings.dataDir, 'forms');

            var db = pgb.getDatabase();
            var sql = "SELECT * FROM ___delete_form($1, $2);";

            // before we remove form from database, make sure formFilename exists in directory
            fs.readdir(FORM_DIR, function(err, files){
                if(err) next(err);

                var filename = files.filter(function(f) {return f === formFilename + '.xml'})[0];

                if (typeof filename === "string") {

                    // Get form id from formFilename.xml file
                    visstaUtil.getFormId(path.join(settings.dataDir, 'forms', filename), formFilename, function (err, formId){
                        if (err) next(err);

                        // check for record in database
                        db.one('SELECT * FROM omk_forms WHERE id = $1', [recordId])
                            .then(function(results){

                                // now make sure the formFilename matches the file.
                                if(results.form_id === formId){

                                    var SUBMISSION_DIR = path.join(settings.dataDir, 'submissions', formId + '/');

                                    // run function to delete form from database
                                    db.manyOrNone(sql, [user.id, recordId])
                                        .then(function (results) {

                                            FORM_DIR = path.join(settings.dataDir, 'forms', formFilename + '.*');

                                            // remove files from directory
                                            exec('rm -r ' + FORM_DIR, function (err, stdout, stderr) {
                                                if (err) next(new CustomError(err.stderr, 400));

                                                exec('rm -r ' + SUBMISSION_DIR, function (err, stdout, stderr) {
                                                    // form may not have any submissions, causing error
                                                    if (err) console.log(err);
                                                    // your callback goes here
                                                    res.status(200).json({status: 200, message: "Success"});
                                                });

                                            });
                                        })
                                        .catch(function (error) {
                                            return next(error)
                                        });


                                } else {
                                    next(new CustomError("Unable to find provided form record in Database.", 400));
                                }

                            })
                            .catch(function (error) {
                                next(new CustomError("From record with provided id does not exist.", 500));
                            })
                    })

                } else {
                    next(new CustomError("Unable to locate form with provided filename", 400));
                }

            });

        } else {
            next(new CustomError('formFilename body param is required.', 400));
        }

    } else {
        next(new CustomError("The user is not authorized to make the request.", 401));
    }

});

module.exports = router;