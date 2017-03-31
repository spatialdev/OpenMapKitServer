/**
 * Created by renerodriguez on 2/27/16.
 */

var dialog;

var formDialog;

var deleteFormDialog;

var deleteUserDialog;

new Vue({
    el: '#usersPage',
    name: 'UsersPage',
    delimiters: ['[{', '}]'],
    mixins: [headerMixin],
    data() {
        return {
            auth: auth,
            userAdded: false,
            usersList: [],
            user: auth.getUser(),
            searchQuery: '',
            tableHeader: [],
            newUser: {
                username: null,
                password: null,
                first_name: null,
                last_name: null,
                email: null,
                role: "admin"
            },
            activeUser: null,
            cachedActiveUser: null,
            editMode: false,
            isFocused: false,
            formAdded: false,
            formList: [],
            selectedForm: {},
            selectedFormRole: 'write',
            selectedUser: null,
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
    watch: {
        'activeUser': function () {
                setTimeout(function () {

                    dialog = document.querySelector('#addUser-dialog');

                    formDialog = document.querySelector('#addForm-dialog');

                    deleteFormDialog = document.querySelector('#deleteForm-dialog');

                    deleteUserDialog = document.querySelector('#deleteUser-dialog');
                    // componentHandler.upgradeAllRegistered();
                    componentHandler.upgradeDom();

                    console.log("componentHandler.upgradeDom();")
                }, 500);
        },
        'editMode': function () {
                setTimeout(function () {
                    componentHandler.upgradeDom();
                    console.log("componentHandler.upgradeDom();")
                }, 500);
        }
    },
    computed: {

        orderedFormPermissions: function () {

            if(this.activeUser){
                return _.orderBy(this.activeUser.formPermissions, 'id')
            }

          },

        validateUserFrom: function () {
            if (this.newUser.username !== null && this.newUser.password !== null) {
                return true
            }else{
                return false
            }
        },

        filteredData: function () {
              var filterKey = this.searchQuery && this.searchQuery.toLowerCase()
              var data = this.usersList
              if (filterKey) {
                data = data.filter(function (row) {
                  return Object.keys(row).some(function (key) {
                    return String(row[key]).toLowerCase().indexOf(filterKey) > -1
                  })
                })
              }
              return data
        }
    },
    mounted: function () {

        //Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }

        dialog = document.querySelector('dialog');

        this.getUsersList();
        this.getFormList();

    },
    methods: {
        ifNullReturnEmptyString: function (value) {
            if(value === null || typeof value == "undefined"){
                return ''
            }else{
                return value
            }

        },
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
        formatHeader: function (string) {

            var removeChar = string.replace("_", " ");



            // var formattedString = removeChar.charAt(0).toUpperCase() + removeChar.slice(1);

            var formattedString = removeChar.charAt(0).toUpperCase() + removeChar.slice(1);

            return formattedString;

        },
        createNewUser: function () {

            var vm = this;


            var newUser = {
                username: this.newUser.username,
                password: this.newUser.password,
                first_name: this.newUser.first_name,
                last_name: this.newUser.last_name,
                email: this.newUser.email,
                role: this.selectedFormRole
            }


            var params = {
                headers: auth.getAuthHeader()
            }

            // POST TO CREATE A USER
            this.$http.post(this.auth.user.url + "/custom/users/user", newUser, params).then(function (response) {

                console.log("create new user", response);
                vm.userAdded = true;
                vm.clearUserMeta();

                vm.getUsersList();

            }, function (response) {

                console.log("ERROR new user", response);

            });


        },
        createTabHeaders: function () {

            //If tab headers have been created already, DONT CREATE AGAIN.
            if(this.tableHeader.length > 0){
                return;
            }

            var headersToShow = ["created_by", "updated_date", "updated_by", "created_date", "id"]

            if(this.usersList.length > 0){

                function headers(value) {
                    if (headersToShow.indexOf(value) === -1) {
                            // element doesn't exist in array
                        return value
                    }
                }

                this.tableHeader =  Object.keys(this.usersList[0]).filter(headers)

                this.tableHeader.push("     ");

            }

        },
        getUsersList: function(){

            var url = this.auth.user.url

            var params = {
                headers: auth.getAuthHeader()
            }
            // GET request
            this.$http.get(url + '/custom/tables/vw_omk_users', params).then(function (response) {

                console.log(response);

                this.usersList = response.data;

                this.createTabHeaders();

                console.log("LIST OF USERS: ", response.data);

            }, function (response) {

                console.log("error: ", response);

            });

        },
        addUser: function () {

            // show dialog
            if(!dialog){
                dialog = document.querySelector('#addUser-dialog');
            }
            dialog.showModal();


        },
        closeDialog: function () {
            var vm = this;
            if (dialog) {
                        vm.userAdded = false;
                        vm.formAdded = false;
                    dialog.close();
            }
        },
        clearUserMeta: function () {

            var  resetUser = {
                                usernam: null,
                                password: null,
                                first_name: null,
                                last_name: null,
                                email: null,
                                role: "admin"
                            }

            this.newUser = resetUser;

        },
        closeDeleteUserDialog: function () {
            if (deleteUserDialog) {
                    deleteUserDialog.close();
                    this.editMode = false;
            }
        },
        deleteUserDialog: function (userID) {

            this.selectedUser = userID;



            if(!deleteUserDialog){
                deleteUserDialog = document.querySelector('#deleteUser-dialog');
            }


            // show dialog
            deleteUserDialog.showModal();

            setTimeout(function () {
                    // componentHandler.upgradeAllRegistered();
                    componentHandler.upgradeDom();

                    console.log("componentHandler.upgradeDom();")
                }, 500);

        },
        deleteUser: function () {

            var vm = this;

            var data = {
                    user_id: this.selectedUser
                }

            var params = {
                headers: auth.getAuthHeader()
            }

            this.$http.delete(this.auth.user.url + "/custom/users/user/" + this.selectedUser, params).then(function (response) {

                console.log("DELETED USER", response);

                vm.selectedUser = null;

                vm.getUsersList();

                vm.closeDeleteUserDialog();

            }, function (response) {

                console.log("ERROR new user", response);

            });

        },

        /*
            ACTIVE USER METHODS
        */
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
                    user_id: this.activeUser.id,
                    role: type
                }

            var params = {
                headers: auth.getAuthHeader()
            }
            this.$http.patch(this.auth.user.url + "/custom/users/user/" + this.activeUser.id + "/form/" + id, newFormAssignment, params).then(function (response) {

                console.log("UPDATED createNewFormAssignment", response);

                vm.getUserDetails(vm.activeUser.id);


            }, function (response) {

                console.log("ERROR new user", response);

            });

        },
        deleteFormAssigment: function () {

            var vm = this;

            function formID(form) {
                return form.form_id === vm.selectedForm;
            }

            var id = this.formList.find(formID)
            if(!id){
                return;
            }

            var newFormAssignment = {
                    form_id: id.id,
                    user_id: this.activeUser.id
                }

            var params = {
                headers: auth.getAuthHeader()
            }

            this.$http.delete(this.auth.user.url + "/custom/users/user/" + this.activeUser.id + "/form/" + id.id, params).then(function (response) {

                console.log("DELETED createNewFormAssignment", response);

                vm.selectedForm = {};

                vm.getUserDetails(vm.activeUser.id);

                vm.closeDeleteDialog();

            }, function (response) {

                console.log("ERROR new user", response);

            });

        },
        createNewFormAssignment: function () {

            var vm = this;

            var newFormAssignment = {
                    form_id: this.selectedForm.id,
                    user_id: this.activeUser.id,
                    role: this.selectedFormRole
                }

            var params = {
                headers: auth.getAuthHeader()
            }

            this.$http.post(this.auth.user.url + "/custom/users/user/" + this.activeUser.id + "/form/" + this.selectedForm.id, newFormAssignment, params).then(function (response) {

                console.log("create createNewFormAssignment", response);
                vm.selectedForm = {};
                vm.selectedFormRole = "write";

                vm.getUserDetails(vm.activeUser.id);

                vm.formAdded = true;

            }, function (response) {

                console.log("ERROR new user", response);

            });





        },
        selectedFormItem: function (form) {

            this.selectedForm = form.form_id

        },
        getFormList: function(){

            var url = this.auth.user.url

            var params = {
                headers: auth.getAuthHeader()
            }
            // GET request
            this.$http.get(url + '/custom/tables/omk_forms', params).then(function (response) {

                console.log("FormList: ", response);

                this.formList = response.data;

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

                    console.log("componentHandler.upgradeDom();")
                }, 500);

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
            if(_.isEqual(this.activeUser, this.cachedActiveUser)){
                vm.editMode = false;
                return;
            }

            var params = {
                headers: auth.getAuthHeader()
            }

            var editedUser = {
                id: this.activeUser.id,
                edit_username: this.activeUser.username,
                edit_first_name: this.activeUser.first_name,
                edit_last_name: this.activeUser.last_name,
                edit_email: this.activeUser.email,
                edit_role: this.activeUser.role
            }

            // GET request
            this.$http.patch(this.auth.user.url + '/custom/users/user/' + this.activeUser.id, editedUser,params).then(response => {
                    console.log(response.body);

                    vm.getUserDetails(vm.activeUser.id);
                    vm.editMode = false;

                    componentHandler.upgradeDom();

                  }, response => {
                    // error callback
                    console.log("error: ", response);
                  });

        },
        getUserDetails: function(id){

            var url = this.auth.user.url

            var params = {
                headers: auth.getAuthHeader()
            }
            // GET request
            this.$http.get(url + '/custom/tables/vw_omk_user_details/' + id, params).then(response => {
                    console.log(response.body);

                    this.activeUser = response.body;

                    this.cachedActiveUser = _.cloneDeep(response.body)

                    componentHandler.upgradeDom();

                  }, response => {
                    // error callback
                    console.log("error: ", response);
                  });
        }





    }
})
