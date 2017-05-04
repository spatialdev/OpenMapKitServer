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

/**
 * Take user and form id & return user's permission to form, or null if no access
 * @param user
 * @param formid
 */
util.getFormPermission = function (user, formid) {
    var form = user.formPermissions.filter(function(f){return f.form_id === formid})[0];

    if (user.role === "admin"){
        return "admin";
    } else if (typeof form === "object"){
        return form.role;
    } else {
        return null
    }
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
    
    return token;
};

module.exports = util;