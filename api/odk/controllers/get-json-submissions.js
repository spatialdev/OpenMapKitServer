var aggregate = require('../helpers/aggregate-submissions');
var visstaUtil = require('../../../util/vissta-auth-util');
var CustomError = require('../../../util/error');

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

    if (visstaUtil.isAuthEnabled()) {

        // check if user is authorized to access form
        if (typeof req.user === "object" && !visstaUtil.hasAccessToForm(req.user, opts.formName)) {
            throw new CustomError("The user is not authorized to make the request.", 401)
        } else {
            aggregate(opts, aggregateCallback);
        }

    } else {
        aggregate(opts, aggregateCallback);
    }

    function aggregateCallback (err, aggregate) {
        if (err) {
            res.status(err.status).json(err);
            return;
        }
        res.status(200).json(aggregate);
    }
};
