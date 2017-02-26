var settings = require('../../../settings');
var util = {};
var jsonwebtoken = require('jsonwebtoken');

/**
 * Check if user has access to single formId
 * @param formid
 * @param user
 */
util.hasAccessToForm = function(user, formid){
    var formids = user.formPermissions.map(function(f){return f.form_id});

    // return true if formids contains formid OR if user is an admin
    return formids.indexOf(formid) > -1 || user.role === "admin";
};

util.isAuthEnabled = function () {
    return typeof settings.formAuth === "object" && settings.formAuth.enabled === true
};

util.isCustomRoute = function (table) {
    var customRoutes = settings.customRoutes;

    var filter = customRoutes.filter(function(item){
        return (item === table)
    });

    return filter.length == 1
};

/**
 * Get token from header cookie
 * @param headers
 * @returns {*}
 */

util.getCookieToken = function (headers) {
    var token;

    if(typeof headers.cookie === "string") {

        headers.cookie.split(";").forEach(function (s) {
            if (s.indexOf("token") > -1) {
                token = s.slice(s.indexOf("=") + 1, s.length)
            }
        })
    }

    console.log(token)

    return token;
};

module.exports = util;