/**
 * Created by renerodriguez on 2/27/16.
 */

// Vue.config.debug = true;

new Vue({
    el: '#formsPage',
    name: 'FormsPage',
    delimiters: ['[{', '}]'],
    mixins: [headerMixin],
    data() {
        return {
            formList: null,
            enketo: auth.enketo,
            auth: auth,
            user: auth.getUser(),
            formListTable: null
        }

    },
    mounted: function () {

        var vm = this;

        //Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }

        // get list of forms from database
        vm.getFormTableData(function() {
            // get openRosa formList
            vm.getFormListData();
        });


    },
    methods: {
        formPermissionUserLevel: function (formName) {
            var formPermission = _.find(this.user.formPermissions, function(o) { return o.form_id === formName; });

            if(formPermission){
                if (this.user.role !== 'admin'){
                    // write users should return true as well...
                    return formPermission.admin || formPermission.write
                }else{
                    return true
                }
            }else if (this.user.role === 'admin'){
                return true
            }else{
                return false
            }


        },
        getHrefForm: function (url, ext) {
            var filename = url.slice(url.lastIndexOf("/"), url.lastIndexOf("xml")) + ext;
            return '/omk/data/forms/' + filename;
        },
        getHrefSubmissions: function (id) {
            return "/omk/pages/submissions/?form=" + id
        },
        getUrlSubmissions: function (id) {

            return "/omk/pages/submissions/?form=" + id

        },
        getFormListData: function(){

            var url = this.auth.user.url

            var params = {
                headers: auth.getAuthHeader()
            }
            // GET request
            this.$http.post(this.$data.auth.user.url + "/formList?json=true", null, params).then(function (response) {

                // filter openRosa formList by formids returned by database...
                // this adds another level of syncronization between database and file system
                var formids = this.formListTable.map(function(t){return t.form_id})

                response.body.xforms.xform= response.body.xforms.xform.filter(function(o){
                    return o.formID.indexOf(formids) !== -1
                });

                this.formList = response.data;

                //register the mdl menus on each card
                setTimeout(function () {
                    componentHandler.upgradeAllRegistered();
                }, 500);


            }, function (response) {

                // error c

            });

        },
        getFormTableData: function (cb){
            var url = this.auth.user.url

            var params = {
                headers: auth.getAuthHeader()
            }
            // GET request
            this.$http.get(this.$data.auth.user.url + "/custom/tables/omk_forms", null, params).then(function (response) {

                this.formListTable = response.data;

                if (cb) cb()

            }, function (response) {

                // error c

            });
        },
        getEnketoURL: function (formId) {

            var data = {form_id: formId, server_url: this.$data.enketo.omk_url};
            var options = {
                headers: {
                    // base-64 encoded api key
                    'Authorization': 'Basic ' + btoa(this.$data.enketo.api_key + ":"),
                    'Content-Type': 'application/json'
                }
            };

            // dialog with link to enketo-express URL
            var dialog = document.querySelector('dialog');

            // update dialog copy
            dialog.querySelector('.mdl-dialog__title').innerHTML = 'Enketo Express';
            dialog.querySelector('.mdl-dialog__content p').innerHTML = "Fill out survey online with Enketo Express";
            dialog.querySelector('.mdl-dialog__actions button.confirm').innerHTML = "Open";

            dialog.setAttribute("href", "#");
            dialog.setAttribute("target", "_blank");

            // hide dialog spinner
            dialog.querySelector("#formDialogSpinner").style.display = 'none';

            if (dialog) {
                // close dialog
                dialog.querySelector('.close').addEventListener('click', function () {
                    dialog.close();
                });
            }

            // Get enketo-express URL
            this.$http.post(this.$data.enketo.url + '/survey/offline', data, options).then(function (response) {

                if (response.data.hasOwnProperty("offline_url")) {

                    if (!dialog.showModal) {
                        dialogPolyfill.registerDialog(dialog);
                    }

                    // add url to modal Button
                    var enketoButton = document.querySelector('#open-enketo-url');
                    enketoButton.href = response.data.offline_url;

                    // show dialog
                    dialog.showModal();

                    dialog.querySelector('#open-enketo-url').addEventListener('click', function () {
                        dialog.close();
                    });

                } else {
                    // close dialog
                    dialog.close();
                }


            }, function (response) {

                // return error
                dialog.querySelector('.mdl-dialog__title').innerHTML = "Error";
                dialog.querySelector('.mdl-dialog__content p').innerHTML = response.data.message || "Error fetching Enketo URL, make sure enketo is properly enabled in the config.";
                // disable button
                dialog.querySelector('#open-enketo-url button').setAttribute('disabled', '');
                // show dialog
                dialog.showModal();

            });

        },
        deleteForm: function (form) {

            var vm = this;

            // show dialog
            var dialog = document.querySelector('dialog');

            dialog.querySelector("#formDialogSpinner").style.display = 'none';

            if (dialog) {
                // close dialog
                dialog.querySelector('.close').addEventListener('click', function () {
                    dialog.close();
                });
            }

            // update dialog copy
            dialog.querySelector('.mdl-dialog__title').innerHTML = 'Delete Form';
            dialog.querySelector('.mdl-dialog__content p').innerHTML = "Are you sure you want to delete form: " + form.name +" ? This action is <span class='font-important'>permanent</span> and cannot be undone!"
            dialog.querySelector('.mdl-dialog__actions button.confirm').innerHTML = "Delete";

            // remove target attribute
            dialog.querySelector('#open-enketo-url').removeAttribute('target');
            dialog.querySelector('#open-enketo-url').removeAttribute('href');

            // combine openRosa and database form metadata
            var completeFormObj = this.formListTable.filter(function (o) {
                return o.form_id == form.formID
            })[0];

            dialog.showModal();

            completeFormObj.downloadUrl = form.downloadUrl;
            completeFormObj.filename = form.downloadUrl.slice(form.downloadUrl.lastIndexOf("/")+1, form.downloadUrl.lastIndexOf(".xml"));

            dialog.querySelector('.mdl-dialog__actions button.confirm').addEventListener('click', function () {

                // start spinner
                dialog.querySelector("#formDialogSpinner").style.display = 'block';

                if (typeof completeFormObj.id === "number") {

                    var options = {
                        headers: auth.getAuthHeader(),
                        body: {formFilename: completeFormObj.filename }
                    };

                    // DELETE request
                    vm.$http.delete(vm.$data.auth.user.url + "/custom/tables/omk_forms/" + completeFormObj.id, options).then(function (response) {

                        // refresh formList
                        this.getFormListData();

                        //register the mdl menus on each card
                        setTimeout(function () {
                            componentHandler.upgradeAllRegistered();
                        }, 500);

                        dialog.close();

                    }, function (response) {

                        dialog.querySelector("#formDialogSpinner").style.display = 'none';

                        // return error
                        dialog.querySelector('.mdl-dialog__title').innerHTML = "Error";
                        dialog.querySelector('.mdl-dialog__content p').innerHTML = response.data.message || "Error deleting form from database.";
                        // disable button
                        dialog.querySelector('.mdl-dialog__actions button.confirm').setAttribute('disabled', '');

                    });
                }
            })
        }
    }
})
