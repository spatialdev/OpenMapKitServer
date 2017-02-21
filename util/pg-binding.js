'use strict';
const pg = require('pg-promise')();
const Q = require('q');
const settings = require('../settings');

// Application connection object
var connectionObject = {
    host: settings.database.readServer,
    port: settings.database.port,
    database: settings.database.database,
    user: settings.database.username,
    password: settings.database.password
};

// set connection
const db = pg(connectionObject);

module.exports._getConnObj = function(){
    return connectionObject;
};

/**
 *
 * @returns pg-promise db connection {*}
 */
module.exports.getDatabase = function(){
    return db;
};