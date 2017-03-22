var xform2json = require('xform-to-json');
var extend = require('xtend');
var parseString = require('xml2js').parseString;

var defaults = {
    geojson: false
};

/**
 * Converts form xml in `req.body` to json, adds meta data, attaches data to
 * `req.submission`
 */
function ProcessSubmission (options) {
    return function (req, res, next) {
        if (!req.body.length) {
            return next(new Error('No form submission found'));
        }

        options = extend(defaults, options);

        options.meta = extend(options.meta, {
            deviceId: req.query.deviceID,
            submissionTime: new Date()
        });

        xform2json(req.body, options, function (err, form) {
            if (err) return next(err);
            var meta = options.geojson ? form.properties.meta : form.meta;

            parseString(req.body, function (err, result) {
                if(err) return next(err);

                req.submission = {
                    json: form,
                    geojson: options.geojson,
                    xml: req.body,
                    formId: meta.formId,
                    instanceId: meta.instanceId.replace(/^uuid:/, '')
                };

                var formId = Object.keys(result)[0];

                // forms with deprecatedID or instanceId are EDITS
                if (typeof result[formId]["meta"][0]["instanceId"] === "object") {
                    req.submission["EDIT"] = {
                        deprecatedID: result[formId]["meta"][0]["instanceId"][0]
                    }
                }

                next();

            });

        });
    }
}

module.exports = ProcessSubmission;
