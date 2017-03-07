var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var settings = require('../../../settings.js');
var mv = require('mv');
var rmdir = require('rmdir');

module.exports = function (req, res, next) {
    var submission = req.submission;
    var ext = submission.geojson ? '.geojson' : '.json';
    var json = JSON.stringify(submission.json, null, '  ');
    var xml = submission.xml; // Original XML for debug purposes is nice.

    var dir = settings.dataDir + '/submissions/' + submission.formId + '/' + submission.instanceId;
    var jsonFileName = dir + '/data' + ext;
    var xmlFileName = dir + '/data' + '.xml';

    mkdirp(path.dirname(jsonFileName), function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({status: 500, err: err});
            return;
        }
        fs.writeFile(xmlFileName, xml, function(err) {
            if (err) console.error(err);
        });
        fs.writeFile(jsonFileName, json, function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({status: 500, err: err});
                return;
            }
            res.status(201).json({saved: jsonFileName});
        });

        // remove old submission if EDIT object exists on request.submission
        if (typeof req.submission["EDIT"] === "object") {

            // get everything after "uuid:"
            var deprecatedID = req.submission["EDIT"]["deprecatedID"].slice(5, req.submission["EDIT"]["deprecatedID"].length);
            var sourceDir = settings.dataDir + '/submissions/' + submission.formId + '/' + deprecatedID;

            // move all files external files from previous submission folder
            fs.readdir(sourceDir,  function(err, files){

                if(err) next(err);

                // loop through dir, find external files
                files.forEach(function(name, i){
                    console.log(name);
                    if(name !== "data.json" && name !== "data.xml") {
                        mv(sourceDir + '/' + name, dir + '/' + name, function (err) {
                            if (err) return next(err);
                            console.log("Successfully moved objects")
                        })
                    }
                });

                // remove old submission directory
                rmdir(sourceDir, function (err, dirs, files) {
                    if (err) next(err);
                    console.log('all files are removed');
                });

            });

        }
    });
};
