'use strict';
const chai = require('chai');
const testRequest = require('supertest');
const httpRequest = require('request');
const jwt = require('jsonwebtoken');
const expect = require('chai').expect;
chai.use(require('chai-things'));
const settings = require('../../settings');
var apiToken;
var fs = require('fs');

// Get all testFiles from endpointSpecs directory
var testFiles = fs.readdirSync(__dirname + '/test-specs').filter(function (file) {
    return (file.indexOf('Spec.js') !== -1)
});

//Get Read user token from auth0
httpRequest({
    url: 'http://52.14.154.36:' + settings.port + '/custom/users/authenticate',
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    json: {
        "username": "superuser",
        "password": "testsuperuser"
    }
}, function (error, response, body) {

    if (error) {
        throw error;//
    }

    apiToken = body.token;
    // Test that the endpoint exists and responds
    testFiles.forEach(function (file) {
        require('./test-specs/' + file)(apiToken);
    });

    run();

});
