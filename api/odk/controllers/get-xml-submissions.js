var aggregate = require('../helpers/aggregate-submissions');
var json2csv = require('json2csv');
var visstaUtil = require('../../custom/util/vissta-auth-util');
var CustomError = require ('../../../util/error');
var xml2js = require('xml2js');

/**
 * Aggregates together all of the survey submissions
 * that have been written to the file system together
 * as one JSON response.
 */
module.exports = function (req, res, next) {

    var opts = {
        formName: req.params.formName,
        limit: req.query.limit,
        offset: req.query.offset
    };

    var submissionId = req.query.submissionId;

    if(visstaUtil.isAuthEnabled()) {

        // check if user is authorized to access form
        if(typeof req.user === "object" && !visstaUtil.hasAccessToForm(req.user, opts.formName)){
            throw new CustomError("The user is not authorized to make the request.",401)
        } else {
            aggregate(opts, aggregateCallback);
        }

    } else {
        aggregate(opts, aggregateCallback)
    }

    function aggregateCallback (err, aggregate) {
        if (err) {
            res.status(err.status).json(err);
            return;
        }
        try {

            if(submissionId) {
                // Get the correct submission
                aggregate = aggregate.filter(function(s){return s.meta.instanceId === submissionId;});

                if (aggregate.length === 1) {

                    // Convert JSON to XML
                    var formName = aggregate[0].meta.instanceName;
                    var builder = new xml2js.Builder({rootName: formName});
                    var xml = builder.buildObject(aggregate[0]);
                    // remove root <xml> tag with metadata
                    xml = xml.slice(xml.indexOf("\n") + 1, xml.length);

                    // Set XML headers and send back to user
                    res.set('content-type', 'text/xml; charset=utf-8');
                    res.status(200).send(xml);
                }
                 else {
                    return next(new CustomError("Submission does not exist.", 400));
                }
            } else {
                return next(new CustomError("Missing submissionId query parameter.", 400));
            }

        } catch (err) {
            res.status(500).json({
                status: 500,
                msg: 'We had a problem with returning the XML form.',
                err: err
            });
        }
    }
};

