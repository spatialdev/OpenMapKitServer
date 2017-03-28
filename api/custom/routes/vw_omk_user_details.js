var pgb = require('../../../util/pg-binding');
var vwUserDetails = {};

vwUserDetails.init = function (req, res, next) {

    // custom endpoint
    var table = req.params.table;
    var recordId = req.params.id;
    var columns = req.query.columns || null;
    var user = req.user;

    var db = pgb.getDatabase();
    var sql = "SELECT * FROM ___select_one($1, $2, $3)";

    // Request data from the database
    db.manyOrNone(sql, [table, columns, recordId])
        .then(function (results) {
            var returnObj = JSON.parse(results[0].___select_one);
            res.status(200).json(returnObj);
        })
        .catch(function (error) {
            return next(error)
        });

};

module.exports = vwUserDetails;