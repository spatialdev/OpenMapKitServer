'use strict';

var settings;

try {
    settings = require('./settings');
} catch (e) {
    console.error("You must have a settings.js file. Take a look at settings.js.example. https://github.com/AmericanRedCross/OpenMapKitServer/blob/master/settings.js.example");
    process.exit();
}

var express = require('express');
var bodyParser = require('body-parser');
var directory = require('serve-index');
var cors = require('cors');
var odkOpenRosa = require('./api/odk/odk-openrosa-routes');
var odkAggregate = require('./api/odk/odk-aggregate-routes');
var deployments = require('./api/deployments/deployment-routes');
var error = require('./api/odk/controllers/error-handler');
var auth = require('./util/auth');
var pkg = require('./package');
var app = express();
var jwt = require('express-jwt');
var unless = require('express-unless');
var jsonwebtoken = require('jsonwebtoken');
var visstaAuth = require('./util/vissta-auth');

// Enable CORS always.
app.use(cors());

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


if(typeof settings.formAuth !== "undefined") {
    jwt.unless = unless;
    // enable jwt token middleware
    app.use(jwt({
            secret: new Buffer(settings.formAuth.secret, 'base64'),
            // https://www.npmjs.com/package/express-jwt#usage
            getToken: function fromHeaderOrQuerystring(req) {
                if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                    req.token = req.headers.authorization.split(' ')[1]
                    return req.headers.authorization.split(' ')[1];
                } else if (req.query && req.query.token) {
                    return req.query.token;
                }
                return null;
            }
        }).unless({
        path: [
            // TODO add paths that don't require authentication
            '/',
            '/favicon.ico',
            '/omk/info',
            // static pages
            new RegExp("\/omk\/pages\/", "g"),
            // '/omk/data/forms',
            new RegExp("\/omk\/data\/forms\/", "g"),  // TODO add middleware to filter these
            '/authenticate'
        ]
    }))
}

// authenticate user credentials route
app.use('/authenticate', visstaAuth);

// Basic Info
app.get('/', redirectToLogin);
app.get('/omk', redirectToLogin);
app.get('/omk/info', info);


// Open Data Kit OpenRosa

// It's better to stay on top level of routes to
// prevent the user from having to add a prefix in ODK Collect
// server path.
app.use('/', odkOpenRosa);


/**
 * Authentication routes.
 *
 * Note that OpenRosa routes pass through without auth.
 * We can't lock down /omk/data/forms route, because that
 * breaks /formList
 */
app.get('/omk/odk');
app.get('/omk/data/submissions');
app.get('/omk/pages');


// Open Data Kit Aggregate

// These are endpoints that are used by iD and other pages.
// They are used to aggregate ODK and OSM data, and they
// do not need to be OpenRosa spec'ed like the endpoints
// interacted with in ODK Collect.
app.use('/omk/odk', odkAggregate);

// Deployments
app.use('/omk/deployments', deployments);

// Public Data & Static Assets
app.use('/omk/data', express.static(settings.dataDir));
app.use('/omk/data', directory(settings.dataDir));
app.use('/omk/pages', express.static(settings.pagesDir));
app.use('/omk/pages', directory(settings.pagesDir));

// Handle errors
// Error Handler
app.use(function (err, req, res, next) {

    var status = err.status || 500;

    res.status(status).json({
        message: err.message,
        status: status
    });

    redirectToLogin()
});

module.exports = app;

function info(req, res) {
    res.status(200).json({
        name: settings.name,
        description: settings.description,
        status: 200,
        service: 'omk-server',
        npm: pkg.name,
        version: pkg.version
    });
}

function redirectToLogin(req, res, next) {
    res.redirect('/omk/pages/login');
}
