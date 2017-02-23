function getParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// adapted from csvkit's recursive JSON flattening mechanism:
// https://github.com/onyxfish/csvkit/blob/61b9c208b7665c20e9a8e95ba6eee811d04705f0/csvkit/convert/js.py#L15-L34
// depends on jquery and jquery-csv (for now)
function parseObject(obj, path) {
    if (path == undefined) {
        path = "";
    }

    var type = $.type(obj);
    var scalar = (type == "number" || type == "string" || type == "boolean" || type == "null");

    if (type == "array" || type == "object") {
        var d = {};
        for (var i in obj) {
            var newD = parseObject(obj[i], path + i + ".");
            $.extend(d, newD);
        }
        return d;
    }
    else if (scalar) {
        var d = {};
        var endPath = path.substr(0, path.length - 1);
        d[endPath] = obj;
        return d;
    }
    else return {};
}


// otherwise, just find the first one
function arrayFrom(json) {
    var queue = [], next = json;
    while (next !== undefined) {
        if ($.type(next) == "array")
            return next;
        if ($.type(next) == "object") {
            for (var key in next)
                queue.push(next[key]);
        }
        next = queue.shift();
    }
    // none found, consider the whole object a row
    return [json];
}

function showCSV(rendered) {
    if (rendered) {
        if ($(".csv table").html()) {
            $(".csv .rendered").show();
            $(".csv .editing").hide();
        }
    } else {
        $(".csv .rendered").hide();
        $(".csv .editing").show().focus();
    }
}

// takes an array of flat JSON objects, converts them to arrays
// renders them into a small table as an example
function renderCSV(objects) {
    var rows = $.csv.fromObjects(objects, {justArrays: true});
    if (rows.length < 1) return;

    // find CSV table
    var table = $(".csv table")[0];
    $(table).html("");


    // render header row
    var thead = document.createElement("thead");
    var tr = document.createElement("tr");
    var header = rows[0];
    for (field in header) {
        var th = document.createElement("th");
        $(th).html(header[field]);
        tr.appendChild(th);
    }
    thead.appendChild(tr);

    // render body of table
    var tbody = document.createElement("tbody");
    for (var i = 1; i < rows.length; i++) {
        tr = document.createElement("tr");
        for (field in rows[i]) {
            var td = document.createElement("td");
            var cell = createHyperLinkIfNeeded(rows[i][field], objects[i - 1]);
            $(td)
                .html(cell)
                .attr("title", rows[i][field]);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    OMK._dataTable = $('#submission-table').DataTable({
        "deferRender": true
    });
}

function createFlatObjects(json) {
    var inArray = arrayFrom(json);

    var outArray = [];
    for (var row in inArray) {
        outArray[outArray.length] = parseObject(inArray[row]);
    }
    return outArray;
}

function doCSV(json) {
    var flatObjects = createFlatObjects(json);

    var csv = $.csv.fromObjects(flatObjects);
    // excerpt and render first 10 rows
    renderCSV(flatObjects);
    showCSV(true);

    // show raw data if people really want it
    $(".csv textarea").val(csv);

    // $("#downloadCsv").attr("href", OMK.csvUrl()).attr("download", getParam('form') + ".csv");
    // $("#downloadJson").attr("href", OMK.jsonUrl()).attr("download", getParam('form') + ".json");
    $("#downloadCsv").attr("href", "#");
    $("#downloadJson").attr("href", "#");
}

$(function () {

    //Check if authenticated, if not go to log in page
    if(auth.user.required){
        auth.checkAuth();
    }

    var formId = getParam('form');

    $(".areas").hide();
    $("#submissionPagespinner").show();

    $(".csv textarea").blur(function () {
        showCSV(true);
    }).click(function () {
        // highlight csv on click
        $(this).focus().select();
    });

    $(".showRawCSV").click(function () {
        showCSV(false);
        $(".csv textarea").focus().select();
        return false;
    });

    // if there's no CSV to download, don't download anything
    $(".csv a.download").click(function () {
        return !!$(".csv textarea").val();
    });

    // go away
    $("body").click(function () {
        $(".drop").hide();
    });

    // add href to submit changeset button
    $("#submit-OSM-changesets")
        .prop("href", "/omk/odk/submit-changesets/" + formId)
        // submit changeset click event
        .click(function (e) {
            e.preventDefault();
            OMK.submitChangeset();
        });
    // add href to submit changeset button
    $("#downloadCsv")
        .click(function (e) {
            e.preventDefault();
            var url = OMK.csvUrl()
            OMK.downloadJSONCSV(url);
        });
    $("#downloadJson")
        .click(function (e) {
            e.preventDefault();
            var url = OMK.jsonUrl();
            OMK.downloadJSON(url);
        });

    // process osm downloads
    $("#osm-options-list a")
        .click(function (e) {
            var url = $(this).prop("href");
            OMK.downloadOSM(url, this)
        })
        .each(function (i, o) {
            var filter = $(o).prop("name");
            // get all
            if (filter == "") {
                $(o).prop("href", "/omk/odk/submissions/" + formId + ".osm");
                $(o).prop("download", "/omk/odk/submissions/" + formId + ".osm");
                // get unsubmitted
            } else if (filter == "unsumbitted") {
                $(o).prop("href", "/omk/odk/submissions/" + formId + ".osm?unsubmitted=true");
                $(o).prop("download", "/omk/odk/submissions/" + formId + ".osm?unsubmitted=true");
                // get conflicting
            } else if (filter == "conflicting") {
                $(o).prop("href", "/omk/odk/submissions/" + formId + ".osm?conflicting=true");
                $(o).prop("download", "/omk/odk/submissions/" + formId + ".osm?conflicting=true");
            }
        });

    $("#osm-options-list a")
        .click(function (e) {
            var url = $(this).prop("href");
            OMK.downloadOSM(url, this)
        });

    // get form name & number of submission
    OMK.fetch(function () {
        $("#submissionPagespinner").hide();
        $(".areas").show();
        $(".csv").show();
        $("#submissionCard").show();
    });
});

function createHyperLinkIfNeeded(field, object) {
    if (typeof field === 'string') {
        // a hyperlink
        if (field.indexOf('http') === 0) {
            return '<a target="_blank" href="' + field + '">' + field + '</a>';
        }
        if (typeof object === 'object') {
            // a file with an extension, discern a link
            var metaInstanceId = object['meta/instanceId'];
            var formId = object['meta/formId'];
            if (typeof metaInstanceId === 'string'
                && typeof formId === 'string'
                && field[field.length - 4] === '.') {
                var uuid = metaInstanceId.replace('uuid:', '');
                var href = OMK.omkServerUrl() + '/omk/data/submissions/' + formId + '/' + uuid + '/' + field;
                return '<a target="_blank" href="' + href + '">' + field + '</a>';
            }
        }
    }
    return field;
}
