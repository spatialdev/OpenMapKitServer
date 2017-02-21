'use strict';

var settings;
var checksumBlacklistHelper = require('./api/odk/helpers/checksum-hash');
var pgbinding = require('./util/pg-binding');

try {
    settings = require('./settings');
} catch (e) {
    console.error("You must have a settings.js file. Take a look at settings.js.example. https://github.com/AmericanRedCross/OpenMapKitServer/blob/master/settings.js.example");
    process.exit();
}

var server = require('./index');
var port = process.env.PORT || settings.port;

// Build checksum blacklists for each form, then start the API
checksumBlacklistHelper.create(function(err){
    if(err) {
        console.error(err);
        return;
    }

    // make sure database is available
    if (typeof settings.database === "object"){
        var db = pgbinding.getDatabase();
        var sql = "SELECT * FROM pg_tables where schemaname = $1";

        // Request data from the database
        db.manyOrNone(sql, [settings.database.schema])
            .then(function (results) {
                server.listen(port, function () {
                    console.log('OpenMapKit Server is listening on port %s.', port);
                });
            })
            .catch(function (error) {
                console.error("Failed to start API:\n" + error);
                process.exit(1);
            });

    } else {
        server.listen(port, function () {
            console.log('OpenMapKit Server is listening on port %s.', port);
        });
    }
});
