var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray: false, attrkey: "attributes"});
var createFormList = require('openrosa-formlist');
var getFormUrls = require('../helpers/get-form-urls');
var settings = require('../../../settings');
var fs = require('fs');
var CustomError = require('../../../util/error');
var visstaUtil = require('../../../util/vissta-auth-util');


/**
 * Searches for XForm XML Files on the file system and
 * returns valid OpenRosa formList XML.
 */
module.exports = function (req, res, next) {
    var options = {
        headers: {
            'User-Agent': 'OpenMapKitServer'
        },
        baseUrl: req.protocol + '://' + req.headers.host + '/omk/data/forms'
    };

    // Look for "json" query param
    var json = req.query.json || false;
    var formId = req.query.formid;

    // throw error if user tries to filter by a form they don't have access
    if(formId && typeof req.user === "object"){
        if (!visstaUtil.hasAccessToForm(req.user,formId) && req.user.role !== "admin"){
            throw new CustomError("The user is not authorized to make the request.",401)
        }
    }

    getFormUrls(options, function (err, formUrls) {
        if (err) return next(err);
        var formListOptions = {
            headers: options.headers
        };
        createFormList(formUrls, formListOptions, function (err, xml) {
            if (err) return next(err);

            // We only want JSON...
            // if (json) {
                parser.parseString(xml, function (err, result) {
                    if (result === undefined) {
                        res.status(200).json(null);
                    } else {
                        if (typeof result.xforms.xform == "object") {
                            // filter results by user role
                            filterFormsByRole(req.user, result.xforms.xform, function(filteredXforms){
                                if(filteredXforms.length > 0){
                                    addSubmissionCount(filteredXforms, function (xformJson) {
                                        if(formId){
                                            result.xforms.xform = xformJson.filter(function(arr){
                                                return arr.formID == formId;
                                            });
                                        } else {
                                            result.xforms.xform = xformJson;
                                        }
                                        res.status(200).json(result);
                                    });
                                } else {
                                    res.status(200).json(null);
                                }
                            })
                        } else {
                            res.status(200).json(null);
                        }
                    }
                });

            // }

            // else {
            //
            //     res.set('content-type', 'text/xml; charset=utf-8');
            //     res.status(200).send(xml);
            // }
        });
    });
};

/**
 * Get list of forms and add totalSubmissions property
 * @param xformJson
 */
function addSubmissionCount(xformJson, cb) {
    // loop through each form
    var count = 0;
    xformJson.forEach(function (form) {
        // add totalSubmission to xformJson object
        form.totalSubmissions = 0;
        // loop thourgh each forms submission directory
        fs.readdir(settings.dataDir + '/submissions/' + form.formID, function (err, files) {
            if (err) {
                console.log('Form: ' + form.formID + ' has no submissions.');
            } else {
                // add number of files as total submissions
                form.totalSubmissions = directoryCount(files);
                // return xformsJson after looping through all forms
            }
            if (++count === xformJson.length) {
                cb(xformJson);
            }
        });
    })
}

/**
 * Get list of forms are returned filtered list by user
 * @param user
 * @param xform
 * @param cb
 */
function filterFormsByRole (user, xform, cb) {
    if(typeof user === "object" && user.role !== "admin") {
        // get form ids
        var formids = user.formPermissions.map(function(f){return f.form_id});
        var filteredForms = [];

        formids.forEach(function(id){
            // true if filter finds a match
            if (xform.filter(function(x){return x.formID === id}).length>0){
                // add to results
                filteredForms.push(xform.filter(function(x){return x.formID === id})[0]);
            }
        });

        // return filtered form
        cb(filteredForms);

    } else {
        // return unfiltered form
        cb(xform)
    }
}

/**
 * The number of submissions is the number of directories in the submission directory.
 * We could be really correct and use fs.stat, but this should suffice.
 *
 * @param files
 */
function directoryCount(files) {
    var count = 0;
    for (var i = 0, len = files.length; i < len; i++) {
        var f = files[i];
        // dont show hidden files like .DS_Store and files with extensions
        if (f.indexOf('.') > -1) continue;
        ++count;
    }
    return count;
}
