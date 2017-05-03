var router = require('express').Router({ mergeParams: true });
var getSubmissionsList = require('./controllers/get-submissionslist');
var getJsonSubmissions = require('./controllers/get-json-submissions');
var getCsvSubmissions = require('./controllers/get-csv-submissions');
var getOsmSubmissions = require('./controllers/get-osm-submissions');
var patchSubmissions = require('./controllers/patch-submissions');
var uploadForm = require('./controllers/upload-form');
var submitChangesets = require('./controllers/submit-changesets');
var visstaMiddleware = require('./../custom/middlewares/vissta-auth-middleware');
var getXmlSubmissions = require('./controllers/get-xml-submissions');
var deleteSubmissions = require('./controllers/delete-submissions');

/**
 * Aggregate End Points
 */

router.route('/submissions').all(visstaMiddleware()).get(getSubmissionsList);
router.route('/submissions/:formName.json').all(visstaMiddleware()).get(getJsonSubmissions);
router.route('/submissions/:formName.csv').all(visstaMiddleware()).get(getCsvSubmissions);
router.route('/submissions/:formName.osm')
                .get(getOsmSubmissions)
                .patch(patchSubmissions);
router.route('/submissions/:formName.xml').all(visstaMiddleware()).get(getXmlSubmissions);

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

/**
 * Custom submission endpoints
 */

router.route('/submissions/:submissionID/:formName').all(visstaMiddleware()).delete(deleteSubmissions)

module.exports = router;
