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
            user: auth.getUser()
        }

    },
    mounted: function () {

        //Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }


        this.getFormListData();

    },
    methods: {
        formPermissionUserLevel: function (formName) {
            var formPermission = _.find(this.user.formPermissions, function(o) { return o.form_id === formName; });
            if(formPermission){
                return formPermission.admin
            }else if (this.user.role === 'admin'){
                return true
            }else{
                return false
            }
        },
        getHrefForm: function (id, ext) {
            return '/omk/data/forms/' + id + "." + ext;
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

                this.formList = response.data;

                //register the mdl menus on each card
                setTimeout(function () {
                    componentHandler.upgradeAllRegistered();
                }, 500);


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

        }
    }
})
