var AUTH = auth;

function getParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
        v_getParam = results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
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

    v_tableHeaders = rows[0];
    // console.log("rows: ", rows);

    var formid = getParam('form');

    // Add slot for edit AND delete button IF user is authorized
    if(OMK.isUserAuthorizedToEdit(formid)){
        header = addTableHeader(header, "");
        header = addTableHeader(header, "");
    }

    for (field in header) {
        var th = document.createElement("th");
        $(th).html(header[field]);
        tr.appendChild(th);
    }
    thead.appendChild(tr);

    // render body of table
    var tbody = document.createElement("tbody");

    for (var i = 1; i < rows.length; i++) {
        // add table body for edit & delete columns
        rows[i] = addTableData(rows[i]);
        rows[i] = addTableData(rows[i]);

        tr = document.createElement("tr");
        for (field in rows[i]) {
            var td = document.createElement("td");
            var cell = createHyperLinkIfNeeded(rows[i][field], objects[i - 1]);
            var uuid = getSubmissionUUID(rows[i]);

            // skip first two columns
            if(field !== "0" && field !== "1") {
                $(td)
                    .html(cell)
                    .attr("title", rows[i][field])
                tr.appendChild(td);

                // create delete button and ajax to endpoint
            } else if (OMK.isUserAuthorizedToEdit(formid) && (field === "0")) {

                var button = document.createElement("div");
                button.innerHTML = '<i class="material-icons">delete</i>';

                $(button)
                    .attr("uuid", uuid)
                    .attr("class", "deleteButton")
                    .click(function(e){
                        var uuid = $(e.currentTarget).attr("uuid");

                        // remove leading "uuid:"
                        uuid = uuid.slice(uuid.indexOf(":")+1, uuid.length);

                        // show delete confirmation dialog
                        // Confirmation Dialog
                        var dialog = document.querySelector('dialog');

                        // hide spinner
                        $("#enketo-dialog-submission .mdl-spinner.mdl-js-spinner.is-active").hide();

                        // enable button
                        dialog.querySelector('#dialog-confirm button.confirm').removeAttribute('disabled');

                        // update dialog copy
                        dialog.querySelector('.mdl-dialog__title').innerHTML = "Delete Form Submission";
                        dialog.querySelector('.mdl-dialog__content p').innerHTML = "Are you sure you want to Delete this submission? This action is <span class='font-important'>permanent</span> and cannot be undone!"

                        dialog.querySelector('.mdl-dialog__actions button.confirm').innerHTML = "Confirm";
                        dialog.querySelector('.mdl-dialog__actions button.cancel').innerHTML = "Cancel";

                        // remove target attribute
                        dialog.querySelector('#dialog-confirm').removeAttribute('target');

                        // remove href link
                        document.querySelector('#dialog-confirm').href = '#';

                        // show dialog
                        dialog.showModal();

                        dialog.querySelector('.mdl-dialog__actions button.cancel').addEventListener('click', function () {
                            dialog.close();
                        });

                        dialog.querySelector('.mdl-dialog__actions button.confirm').addEventListener('click', function () {
                            // show spinner
                            $("#enketo-dialog-submission .mdl-spinner.mdl-js-spinner.is-active").show();

                            deleteSubmission(uuid, function() {
                                dialog.close();
                                // hide spinner
                                $("#enketo-dialog-submission .mdl-spinner.mdl-js-spinner.is-active").hide();

                                // destroy data table
                                $('#submission-table').DataTable().destroy();

                                // clear html
                                clearTable();

                                // show page spinner
                                $("#submissionPagespinner").show();

                                // get form name & number of submission
                                OMK.fetch(function () {
                                    $("#submissionPagespinner").hide();
                                });

                            })
                        });

                    });

                $(td)
                    .html(button)
                    .attr("title", rows[i][field])
                    .attr("class", "deleteColumn");
                tr.appendChild(td);

                // create edit button and ajax to endpoint
            } else if (OMK.isUserAuthorizedToEdit(formid) && (field === "1")) {

                var button = document.createElement("span");
                button.innerHTML = "Edit";
                $(button)
                    .attr("uuid", uuid)
                    .attr("class", "editButton")
                    .click(function(e){
                        var uuid = $(e.currentTarget).attr("uuid");
                        var formid = getParam('form');

                        // hide spinner
                        $("#enketo-dialog-submission .mdl-spinner.mdl-js-spinner.is-active").hide();

                        // get submission XML
                        fetchXML(AUTH.user.url + '/omk/odk/submissions/' + formid + '.xml' + '?submissionId=' + uuid, function(xml){

                            var options = {};
                            options.server_url = AUTH.enketo.omk_url;
                            options.form_id = formid;
                            options.instance_id = uuid;
                            options.return_url = AUTH.enketo.omk_url + "/omk/pages/submissions/?form="+formid;
                            options.instance = cleanUpXML(xml);

                            fetchEketoEditURL(AUTH.enketo.url + '/instance', options, function (d) {

                                // Confirmation Dialog
                                var dialog = document.querySelector('dialog');

                                // add target attribute
                                dialog.querySelector('#dialog-confirm').setAttribute('target', '_blank');

                                // update dialog copy
                                dialog.querySelector('.mdl-dialog__title').innerHTML = "Enketo Express";
                                dialog.querySelector('.mdl-dialog__content p').innerHTML = "Edit form with Enketo Express";

                                dialog.querySelector('.mdl-dialog__actions button.confirm').innerHTML = "Open";
                                dialog.querySelector('.mdl-dialog__actions button.cancel').innerHTML = "Close";

                                if (dialog) {
                                    // close dialog
                                    dialog.querySelector('.mdl-dialog__actions button.cancel').addEventListener('click', function () {
                                        dialog.close();
                                    });
                                }

                                if (d.hasOwnProperty("edit_url")) {

                                    var enketoButton = document.querySelector('#dialog-confirm');
                                    enketoButton.href = d.edit_url;

                                    // show dialog
                                    dialog.showModal();

                                    dialog.querySelector('.mdl-dialog__actions button.confirm').addEventListener('click', function () {
                                        dialog.close();
                                    });
                                } else {
                                    dialog.close();
                                }

                            })

                        })

                    });

                $(td)
                    .html(button)
                    .attr("title", rows[i][field]);
                tr.appendChild(td);
            }
        }
        tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    try {
        OMK._dataTable = $('#submission-table').DataTable({
            "deferRender": true
        });
    } catch (e) {
        var form = getParam('form');
        $("#submissionPagespinner").hide();
        $("#alert").text("No data has been submitted for " + form + '.').show();
        $("#submissionCard").html("")
        $(".csv").html("")
        $("#downloads").hide();
        console.error (e)
    }
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

    v_tableData = flatObjects

    showCSV(true);

    if(flatObjects.length < 10){
        $("#submission-table_paginate").hide();
        $("#submission-table_info").hide();
    }else{
        $("#submission-table_paginate").show();
        $("#submission-table_info").show();
    }

    
    // show raw data if people really want it
    $(".csv textarea").val(csv);


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

    // $("#logOut").click(function () {
    //         document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    //         auth.logout();
    //         window.location = '/omk/pages/login';
    // });

    // if there's no CSV to download, don't download anything
    $(".csv a.download").click(function () {
        return !!$(".csv textarea").val();
    });

    // go away
    // $("body").click(function () {
    //     $(".drop").hide();
    // });

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
            OMK.downloadCSV(url);
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

function addTableHeader (rows, title) {
    var header = [title];

    rows.forEach(function(r){
        header.push(r);
    })

    return header
}

function addTableData (row) {
    var body = [""];

    row.forEach(function(r){
        body.push(r);
    })

    return body
}

function getSubmissionUUID (row) {
    var id;

    row.forEach(function(r){
        if(r.toString().indexOf("uuid") !== -1){
            id = r;
        }
    })

    return id;
}

function fetchXML(url, cb) {
    if (!url) return;

    $.ajax({
        url: url,
        type: 'get',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('id_token')
        },
        dataType: 'xml',
        success: function (data){
            if(cb) cb(xmlToString(data))


        },
        error: function (data){
            // console.log("Outlet Creation Failed, please try again.");
            var form = getParam('form');
            $("#submissionPagespinner").hide();
            // $("#backLink").show();
            console.log("Error fetching Submission xml");
            console.log(data);
        }

    });
}

function fetchEketoEditURL (url, body, cb) {
    $.ajax({
        url: url,
        type: 'post',
        headers: {
            'Authorization': 'Basic ' + btoa(AUTH.enketo.api_key + ":"),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: body,
        dataType: 'json',
        success: function (data){
            if(cb) cb(data)


        },
        error: function (data){
            // console.log("Outlet Creation Failed, please try again.");
            var form = getParam('form');
            $("#submissionPagespinner").hide();

            // Confirmation Dialog
            var dialog = document.querySelector('dialog');

            // return error
            dialog.querySelector('.mdl-dialog__title').innerHTML = "Error";
            dialog.querySelector('.mdl-dialog__content p').innerHTML = data.responseJSON.message || "Error fetching Enketo URL, make sure enketo is properly enabled in the config.";
            // disable button
            dialog.querySelector('#dialog-confirm button').setAttribute('disabled', '');
            // show dialog
            dialog.showModal();

            dialog.querySelector('.mdl-dialog__actions button.cancel').addEventListener('click', function () {
                dialog.close();
            });

            // $("#backLink").show();
            console.log("Error fetching Submission xml");
            // console.log(data);
        }

    });
}

function deleteSubmission (submissionID, cb) {
    var formName = getParam('form');

    $.ajax({
        url: AUTH.user.url + '/omk/odk/submissions/' + submissionID + '/' + formName,
        type: 'delete',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        dataType: 'json',
        success: function (data){
            if(cb) cb(data)
        },
        error: function (data){
            // console.log("Outlet Creation Failed, please try again.");
            var form = getParam('form');
            $("#enketo-dialog-submission .mdl-spinner.mdl-js-spinner.is-active").hide();

            // Confirmation Dialog
            var dialog = document.querySelector('dialog');

            // return error
            dialog.querySelector('.mdl-dialog__title').innerHTML = "Error";
            dialog.querySelector('.mdl-dialog__content p').innerHTML = data.responseJSON.message || "Error deleting form submission.";

            // disable button
            dialog.querySelector('#dialog-confirm button').setAttribute('disabled', '');
            // show dialog
            dialog.showModal();

            dialog.querySelector('.mdl-dialog__actions button.cancel').addEventListener('click', function () {
                dialog.close();
            });

            console.log("Error deleting submission");
        }

    });
}

//http://www.mail-archive.com/jquery-en@googlegroups.com/msg27059.html
function xmlToString(xmlData) {

    var xmlString;
    //IE
    if (window.ActiveXObject){
        xmlString = xmlData.xml;
    }
    // code for Mozilla, Firefox, Opera, etc.
    else{
        xmlString = (new XMLSerializer()).serializeToString(xmlData);
    }
    return xmlString;
}

//http://www.textfixer.com/tools/remove-line-breaks.php
function cleanUpXML (xml){

    var re1 = /<1br \/><1br \/>/gi,
    re1a = /<1br \/><1br \/><1br \/>/gi, re2, re3, re4;

    xml = xml.replace(/(\r\n|\n|\r)/gm,"<1br />");

    xml = xml.replace(re1a,"<1br /><2br />");
    xml = xml.replace(re1,"<2br />");

    re2 = /\<1br \/>/gi;
    xml = xml.replace(re2, " ");

    re3 = /\s+/g;
    xml = xml.replace(re3," ");

    re4 = /<2br \/>/gi;
    xml = xml.replace(re4,"\n\n");

    return xml
}

// check if user is authorzed to edit submissions
function isUserAuthorizedToEdit () {

    var user = AUTH.getUser();
    var authorized, result = [];
    var formid = getParam('form');

    // check if app level admin
    if (user.role === "admin"){
        authorized = true;
    } else if (user.formPermissions.length > 0) {
        user.formPermissions.forEach(function(f){
            // ONLY form level admin is authorized
            if (f.form_id === formid && f.role === "admin") result.push(f)
        });

        authorized = result.length > 0;
    }

    return authorized
}

function clearTable () {
    $("#submission-table").html("");
}