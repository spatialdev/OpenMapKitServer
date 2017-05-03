var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var settings = require('../../../settings.js');
var mv = require('mv');
var rmdir = require('rmdir');

module.exports = function (req, res, next) {

    var submissionID = req.params.submissionID;
    var formName = req.params.formName;
    var SUBMISSION_DIR = path.join(settings.dataDir, 'submissions', formName, submissionID);

    // make sure submission exists
    fs.readdir(SUBMISSION_DIR, function(err, files){
        if (err) {
            res.status(400).json({
                status: 400,
                err: err,
                message: "Unable to delete submission. Directory doesn't exist."
            });

            return;
        }

        // remove old submission directory
        rmdir(SUBMISSION_DIR, function (err) {
            if (err) next(err);

            res.status(200).json({
                status: 200,
                message: "Complete."
            });
        });

    });

};
