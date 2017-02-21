var util = {};


/**
 * Check if user has access to single formId
 * @param formid
 * @param user
 */
util.hasAccessToForm = function(user, formid){
    var formids = user.formPermissions.map(function(f){return f.form_id});

    return formids.indexOf(formid) > -1;
};

module.exports = util;