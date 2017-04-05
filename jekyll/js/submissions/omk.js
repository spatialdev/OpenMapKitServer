window.OMK = {};

OMK._paginationOffset = 0;
OMK._PAGINATION_LIMIT = 5000;

OMK._Auth = auth;

OMK.fetch = function (cb) {
    OMK.getFormMetaData(function(metadata) {

        var url = OMK.jsonUrl();

        OMK.fetchJSON(url + '?offset=0&limit=' + OMK._PAGINATION_LIMIT, function() {
            cb();
            // pagination too slow
            // OMK.paginate(metadata.total);

            if (OMK._PAGINATION_LIMIT < metadata.total) {
                var toastOptions = {
                    style: {
                        main: {
                            background: "#f2dede",
                            color: "#a94442",
                            'box-shadow': '0 0 0px'
                        }
                    }
                };
                iqwerty.toast.Toast('The data set is large. We have loaded ' + OMK._PAGINATION_LIMIT +
                    ' of ' + metadata.total + ' submissions. Download the ODK CSV or JSON data to get the rest.', toastOptions);
            }
        });
    });
};

OMK.jsonUrl = function () {
    var json = getParam('json');
    if (!json) {
        var form = getParam('form');
        if (form) {
            json = OMK.omkServerUrl() + '/omk/odk/submissions/' + form + '.json';
        }
    }
    return json;
};

OMK.csvUrl = function () {
    var form = getParam('form');
    return OMK.omkServerUrl() + '/omk/odk/submissions/' + form + '.csv';
};

//Function to capitalise first character for strings
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

OMK.fetchJSON = function (url,cb) {
    if (!url) return;

    $.ajax({
        url: url,
        type: 'get',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('id_token')
        },
        dataType: 'json',
        success: function (data){
            console.log("Success submissions", data);
            doCSV(data);
            if(cb) cb()
        },
        error: function (data){
            // console.log("Outlet Creation Failed, please try again.");
            var form = getParam('form');
            $("#submissionPagespinner").hide();
            $("#alert").text("No data has been submitted for " + form + '.').show();
            // $("#backLink").show();
            $("#downloads").hide();
            console.log("Error fetching ODK submissions!");
            console.log(data);
        }

    });
};

OMK.jsonPaginationUrl = function() {
    return OMK.jsonUrl() + '?offset=' + OMK._paginationOffset + '&limit=' + OMK._PAGINATION_LIMIT;
};

/**
 * Doing recursive loads of pagination of data is quite slow and halts the UI.
 * We're going to disable this for now...
 *
 * @param total
 */
OMK.paginate = function (total) {
    setTimeout(function() { // timeouts dont completely fix the UI from halting...
        OMK._paginationOffset += OMK._PAGINATION_LIMIT;
        if (OMK._paginationOffset < total) {
            $.get(OMK.jsonPaginationUrl(), function (data, status, xhr) {
                OMK.addPaginationData(data);
                OMK.paginate(total);
            });
        }
    }, 1000);
};

OMK.addPaginationData = function (data) {
    var flatObjects = createFlatObjects(data);
    var rows = $.csv.fromObjects(flatObjects, {justArrays: true});
    for (var i = 1, len = rows.length; i < len; i++) {
        var row = rows[i];
        OMK._dataTable.row.add(row).draw(false);
    }
};

/**
 * Determines the OMK Server endpoint.
 *
 * @returns {*}
 */
OMK.omkServerUrl = function () {
    // var omkServer = getParam('omk_server');
    // return (omkServer ? omkServer : window.location.origin);
    var url = OMK._Auth.user.url;

    return url;
};

OMK.getFormMetaData = function (cb) {
    var formId = getParam('form');


    $.ajax({
        url: OMK.omkServerUrl() + '/formList?json=true&formid=' + formId,
        type: 'post',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('id_token')
        },
        dataType: 'json',
        success: function (data){
            console.log("success");

            // get title and total submissions
            var title = data.xforms.xform[0].name;
            var total = data.xforms.xform[0].totalSubmissions;
            $("h2.rows.count").text(title);
            cb({
                title: title,
                total: total
            });
        },
        error: function (data){
            var form = getParam('form');
            console.log("Error fetching ODK form metadata!");
            console.log(data);

        }

    });
};

OMK.downloadCSV = function (url) {

    $.ajax({
        url: url,
        type: 'post',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('id_token')
        },
        success: function (data){
            console.log("success");
            console.log(data);

            var downloadLink = document.createElement("a");
            var blob = new Blob(["\ufeff", data]);
            var url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download = "data.csv";

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

        },
        error: function (data){
            console.log("Error fetching ODK form metadata!");
            console.log(data);
        }

    });
};

OMK.downloadJSON = function (url) {

    $.ajax({
        url: url,
        type: 'post',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('id_token')
        },
        success: function (data){
            console.log("success");
            console.log(data);

            var downloadLink = document.createElement("a");
            // var blob = new Blob(["\ufeff", data]);
            // var url = URL.createObjectURL(blob);
            var url = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
            downloadLink.href = url;
            downloadLink.download = "data.json";

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

        },
        error: function (data){
            console.log("Error fetching ODK form metadata!");
            console.log(data);
        }

    });
};

/*
NOT IN USE ANYMORE
*/

OMK.submitChangeset = function () {
    var formId = getParam('form');

    $.get('/omk/odk/submit-changesets/' + formId, function(data, status, xhr) {
        // snackbar
        var notification = document.querySelector('.mdl-js-snackbar');
        notification.MaterialSnackbar.showSnackbar(
            {
                message: data.msg
            }
        );
    }).fail(function(xhr, status, errorThrown) {
        // snackbar
    });

};

/*
NOT IN USE ANYMORE
*/

OMK.downloadOSM = function (url, element) {
    $.get(url, function(data, status, xhr) {

    }).fail(function(xhr, status, errorThrown) {
        // notify user if download fails
        var notification = document.querySelector('.mdl-js-snackbar');
        notification.MaterialSnackbar.showSnackbar(
            {
                message: xhr.responseJSON.msg
            }
        )
    });
};

// check if user is authorized to edit a specific form
OMK.isUserAuthorizedToEdit  = function (formid) {

    var user = AUTH.getUser();
    var authorized, result = [];

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
