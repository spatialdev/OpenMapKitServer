var router = require('express').Router({ mergeParams: true });
var pgb = require('../../../util/pg-binding');
var visstaUtil = require('../util/vissta-auth-util');
var CustomError = require('../../../util/error');
var visstaAuth = require('./../middlewares/vissta-auth-middleware');

router.post('/:table', [visstaAuth()], function (req, res, next) {

    var table = req.params.table;
    var columns = req.query.columns || null;
    var user = req.user;

    if (req.user.role === "admin") {

        // Check if table/view is listen under "customRoutes"
        if (!visstaUtil.isCustomRoute(table)) {

            var db = pgb.getDatabase();
            var sql = "SELECT * FROM ___select_all($1, $2)";

            // Request data from the database
            db.manyOrNone(sql, [table, columns])
                .then(function (results) {
                    var returnObj = JSON.parse(results[0].___select_all);
                    res.status(200).json(returnObj);
                })
                .catch(function (error) {
                    return next(error)
                });

        } else {
            // it is, so require the endpoint file
            require('./' + table).init(req, res, next);
        }
    } else {
        next(new CustomError("The user is not authorized to make the request.", 401));
    }

});

module.exports = router;