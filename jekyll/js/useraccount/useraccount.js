/**
 * Created by renerodriguez on 2/27/16.
 */

// Vue.config.debug = true;

var dialog;

var deleteFormDialog;

new Vue({
    el: '#useraccountPage',
    name: 'UserAccountPage',
    delimiters: ['[{', '}]'],
    mixins: [headerMixin],
    data() {
        return {
            auth: auth,
            user: auth.getUser(),
            userAdded: false,
            userDetails: null,
            cachedUserDetails: null,
            user: auth.getUser(),
            editMode: false,
            isFocused: false,

            formAdded: false,
            formList: [],
            selectedForm: {},
            selectedFormRole: "write",
            formOptions: [
                    {
                        label: 'System admin',
                        value: 'admin'
                    },
                    {
                        label: 'Read & edit',
                        value: 'write'
                    },
                    {
                        label: 'Read only',
                        value: 'read'
                    }
                ]
        }

    },
    computed: {

        orderedFormPermissions: function () {

            if(this.userDetails){
                return _.orderBy(this.userDetails.formPermissions, 'id')
            }

          }

    },
    watch: {
        'editMode': function () {
                setTimeout(function () {
                    // componentHandler.upgradeAllRegistered();
                    componentHandler.upgradeDom();

                    console.log("componentHandler.upgradeDom();")
                }, 500);
        }
    },
    mounted: function () {

        //Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }

        dialog = document.querySelector('dialog');

        deleteFormDialog = document.querySelector('#deleteForm-dialog');


        this.getFormList();

        componentHandler.upgradeDom();


    },
    created() {
        this.getUserDetails();
        componentHandler.upgradeDom();
    },
    methods: {
        ifNullReturnEmptyString: function (value) {
            if(value === null){
                return ''
            }else{
                return value
            }
        },
        toggleEditMode: function () {
            this.editMode = !this.editMode;
            this.focusingAllInputs();
            componentHandler.upgradeDom();
        },
        focusingAllInputs: function () {
            var vm = this;

            if(this.editMode){

                componentHandler.upgradeDom();
                this.isFocused = true;
                componentHandler.upgradeDom();
                //register the mdl menus on each card
                setTimeout(function () {
                    vm.isFocused = false;
                    componentHandler.upgradeDom();
                }, 1000);

            }
        },
        updateUserDetails: function () {
            var vm = this;

            //check if there was really a user change
            if(_.isEqual(this.userDetails, this.cachedUserDetails)){
                vm.editMode = false;
                return;
            }

            var params = {
                headers: auth.getAuthHeader()
            }

            var editedUser = {
                id: this.userDetails.id,
                edit_username: this.userDetails.username,
                edit_first_name: this.userDetails.first_name,
                edit_last_name: this.userDetails.last_name,
                edit_email: this.userDetails.email,
                edit_role: this.userDetails.role
            }

            // GET request
            this.$http.patch(this.auth.user.url + '/custom/users/user/' + this.user.id, editedUser,params).then(response => {
                    // console.log(response.body);

                    vm.getUserDetails();
                    vm.editMode = false;

                    componentHandler.upgradeDom();

                  }, response => {
                    // error callback
                    console.log("error: ", response);
                  });

        },
        getUserDetails: function(){

            var url = this.auth.user.url

            var params = {
                headers: auth.getAuthHeader()
            }
            // GET request
            this.$http.get(url + '/custom/tables/vw_omk_user_details/' + this.user.id, params).then(response => {
                    // console.log(response.body);
                    this.userDetails = response.body;

                    this.cachedUserDetails = _.cloneDeep(response.body);

                    componentHandler.upgradeDom();

                  }, response => {
                    // error callback
                    console.log("error: ", response);
                  });
        },
        addUser: function () {
            // show dialog
            dialog.showModal();
        },
        closeDialog: function () {

            var vm = this;
            if (dialog) {
                    dialog.close();
                    vm.userAdded = false;
            }
        },

        /*

        */

        /*
            ACTIVE USER METHODS
        */
        setOthersToFalse: function (form, type) {

            var vm = this;

            form[type] = true;

            setTimeout(function () {
                var orale = ["admin", "write", "read"]

                    if(type === "admin"){
                        orale.forEach(function(t) {
                            form[t] = true;
                        });
                    }else{
                        orale.forEach(function(t) {
                          if (t != type ) {
                            form[t] = false;
                          }
                        });
                    }
                    componentHandler.upgradeDom();

                    vm.updateFormAssignment(form.id, type);

            }, 100);
        },
        closeDeleteDialog: function () {
            if (deleteFormDialog) {
                    deleteFormDialog.close();
            }
        },
        deleteDialog: function (selectForm) {

            this.selectedForm = selectForm;



            if(!deleteFormDialog){
                deleteFormDialog = document.querySelector('#deleteForm-dialog');
            }


            // show dialog
            deleteFormDialog.showModal();

            setTimeout(function () {
                    // componentHandler.upgradeAllRegistered();
                    componentHandler.upgradeDom();

                    console.log("componentHandler.upgradeDom();")
                }, 500);

        },
        updateFormAssignment: function (id, type) {

            var vm = this;

            var newFormAssignment = {
                    form_id: id,
                    user_id: this.userDetails.id,
                    role: type
                }

            var params = {
                headers: auth.getAuthHeader()
            }
            this.$http.patch(this.auth.user.url + "/custom/users/user/" + this.userDetails.id + "/form/" + id, newFormAssignment, params).then(function (response) {

                console.log("UPDATED createNewFormAssignment", response);

                vm.getUserDetails(vm.userDetails.id);


            }, function (response) {

                console.log("ERROR new user", response);

            });

        },
        deleteFormAssigment: function () {

            var vm = this;

            var newFormAssignment = {
                    form_id: this.selectedForm.id,
                    user_id: this.userDetails.id
                }

            var params = {
                headers: auth.getAuthHeader()
            }

            this.$http.delete(this.auth.user.url + "/custom/users/user/" + this.userDetails.id + "/form/" + this.selectedForm.id, params).then(function (response) {

                // console.log("DELETED createNewFormAssignment", response);

                vm.selectedForm = {};

                vm.getUserDetails(vm.userDetails.id);

                vm.editMode = false;

                vm.closeDeleteDialog();

            }, function (response) {

                console.log("ERROR new user", response);

            });

        },
        createNewFormAssignment: function () {

            var vm = this;

            // function formID(form) {
            //     return form.form_id === vm.selectedForm;
            // }

            // var id = this.formList.find(formID)

            var newFormAssignment = {
                    form_id: this.selectedForm.id,
                    user_id: this.userDetails.id,
                    role: this.selectedFormRole
                }

            var params = {
                headers: auth.getAuthHeader()
            }

            this.$http.post(this.auth.user.url + "/custom/users/user/" + this.userDetails.id + "/form/" + this.selectedForm.id, newFormAssignment, params).then(function (response) {

                // console.log("create createNewFormAssignment", response);
                vm.selectedForm = {};
                vm.selectedFormRole = "write";

                vm.getUserDetails(vm.userDetails.id);

                vm.formAdded = true;

            }, function (response) {

                console.log("ERROR new user", response);

            });
        },
        selectedFormItem: function (form) {

            this.selectedForm = form.form_id

        },
        getFormList: function(){

            if(this.user.role !== 'Admin'){
                return;
            }

            var url = this.auth.user.url

            var params = {
                headers: auth.getAuthHeader()
            }
            // GET request
            this.$http.get(url + '/custom/tables/omk_forms', params).then(function (response) {

                this.formList = _.orderBy(response.data, 'id')

            }, function (response) {

                console.log("error: ", response);

            });

        },
        addForm: function () {

            if(!formDialog){
                formDialog = document.querySelector('#addForm-dialog');
            }


            // show dialog
            formDialog.showModal();

            setTimeout(function () {
                    // componentHandler.upgradeAllRegistered();
                    componentHandler.upgradeDom();

                    // console.log("componentHandler.upgradeDom();")
                }, 500);

        },




    }
})
