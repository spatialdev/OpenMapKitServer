var settings = require('../../../settings');
var util = {};

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

module.exports = util;