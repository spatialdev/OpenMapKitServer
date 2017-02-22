var router = require('express').Router({ mergeParams: true });
var getSubmissionsList = require('./controllers/get-submissionslist');
var getJsonSubmissions = require('./controllers/get-json-submissions');
var getCsvSubmissions = require('./controllers/get-csv-submissions');
var getOsmSubmissions = require('./controllers/get-osm-submissions');
var patchSubmissions = require('./controllers/patch-submissions');
var uploadForm = require('./controllers/upload-form');
var submitChangesets = require('./controllers/submit-changesets');
var visstaMiddleware = require('./middlewares/vissta-auth-middleware');

/**
 * Aggregate End Points
 */

router.route('/submissions').all(visstaMiddleware()).post(getSubmissionsList);
router.route('/submissions/:formName.json').all(visstaMiddleware()).post(getJsonSubmissions);
router.route('/submissions/:formName.csv').all(visstaMiddleware()).post(getCsvSubmissions);
router.route('/submissions/:formName.osm')
                .get(getOsmSubmissions)
                .patch(patchSubmissions);

/**
 * XLSForm Upload Endpoint
 */
router.route('/upload-form').all(visstaMiddleware()).post(uploadForm);

/**
 * Creates changesets for submissions and submits to
 * an OSM Editing API
 */
router.route('/submit-changesets/:formName')
                .get(submitChangesets)
                .put(submitChangesets);

module.exports = router;
