var pg = require('pg-promise')();
var Q = require('q');
var settings = require('../settings');

// Application connection object
var connectionObject = {
    host: settings.database.readServer,
    port: settings.database.port,
    database: settings.database.database,
    user: settings.database.username,
    password: settings.database.password
};

// set connection
var db = pg(connectionObject);

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