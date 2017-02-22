var fs = require('fs');
var mv = require('mv');
var multiparty = require('multiparty');
var PythonShell = require('python-shell');

var settings = require('../../../settings');
var formsDir = settings.dataDir + '/forms/';
var visstaUtil = require('../../../util/vissta-auth-util');
var CustomError = require('../../../util/error');

/**
 * User uploads an XLSForm (Excel ODK Form).
 * XLSForms are converted to XForm with pyxform, and both
 * the XLS and XForm files are written to the forms directory.
 *
 * The XLS file should be in the `xls_file` field of the form-data.
 */
module.exports = function (req, res, next) {

    var form = new multiparty.Form();

    // check if auth is enabled
    if (visstaUtil.isAuthEnabled()) {

        // only only admins can upload forms
        if(req.user.role === "admin") {
            form.parse(req, parseCallback);
        } else {
            next(new CustomError("The user is not authorized to make the request.",401));
        }

    } else {
        // not auth enabled, let user pass through
        form.parse(req, parseCallback);
    }

    // centralized parse callback
    function parseCallback (err, fields, files) {
        var file = files.xls_file;
        if (!file) {
            res.status(400).json({
                status: 400,
                msg: 'You must POST form-data with a key of "xls_file" and a value of an XLSX Excel file.'
            });
            return;
        }

        // We move the XLSForm from temp to the forms directory.
        var xlsFilename = file[0].originalFilename;
        if (xlsFilename.indexOf('.xlsx') < 0) {
            res.status(400).json({
                status: 400,
                msg: 'Only xlsx format is supported. Older XLS formats, and as well as other spreadsheet formats are not supported by pyxform. Please save your spreadsheet as .xlsx in your spreadsheet application.'
            });
            return;
        }
        var xlsPath = formsDir + xlsFilename;
        mv(file[0].path, xlsPath, function (err) {
            if (err) {
                res.status(400).json({
                    status: 400,
                    err: err,
                    msg: 'Unable to move ' + xlsFilename + ' to the forms directory.'
                });
                return;
            }

            // Convert XLS to XForm with pyxform
            var xFormFilename = xlsFilename.replace('.xlsx', '.xml');
            var xFormPath = formsDir + xFormFilename;
            var options = {
                scriptPath: __dirname + '/../pyxform/pyxform/',
                args: [xlsPath, xFormPath],
                mode: "text"
            };
            PythonShell.run('xls2xform.py', options, function (err, results) {
                if (err) {
                    res.status(400).json({
                        status: 400,
                        err: err,
                        msg: 'Unable to convert ' + xlsFilename + ' to an XForm.'
                    });
                    return;
                }
                res.status(201).json({
                    status: 201,
                    msg: 'Converted ' + file[0].originalFilename + ' to an XForm and saved both to the forms directory.',
                    xFormUrl: req.protocol + '://' + req.headers.host + '/omk/data/forms/' + xFormFilename,
                    xlsFormUrl: req.protocol + '://' + req.headers.host + '/omk/data/forms/' + xlsFilename
                });
            });
        });
    }

};
