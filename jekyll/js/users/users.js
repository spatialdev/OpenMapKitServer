/**
 * Created by renerodriguez on 2/27/16.
 */

var dialog;

new Vue({
    el: '#usersPage',
    name: 'UsersPage',
    delimiters: ['[{', '}]'],
    mixins: [headerMixin],
    data() {
        return {
            auth: auth,
            user: auth.getUser(),
            userAdded: false,
            usersList: [],
            user: auth.getUser(),
            searchQuery: '',
            tableHeader: [],
            newUser: {
                usernam: null,
                password: null,
                first_name: null,
                last_name: null,
                email: null,
                role: "admin"
            },
            activeUser: null,
            editMode: false,
            isFocused: false
        }

    },
    watch: {
        'activeUser': function () {

            // if (this.activeUser == null) {
                setTimeout(function () {
                    dialog = document.querySelector('dialog');
                    // componentHandler.upgradeAllRegistered();
                    componentHandler.upgradeDom();
                }, 500);

            // }



        }
    },
    computed: {

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

    },
    methods: {
        formatHeader: function (string) {

            var removeChar = string.replace("_", " ");



            // var formattedString = removeChar.charAt(0).toUpperCase() + removeChar.slice(1);

            var formattedString = removeChar.charAt(0).toUpperCase() + removeChar.slice(1);

            return formattedString;

        },
        createNewUser: function () {

            var vm = this;


            var params = {
                headers: auth.getAuthHeader()
            }

            // Get enketo-express URL
            this.$http.post(this.auth.user.url + "/custom/users/user", this.newUser, params).then(function (response) {

                console.log("create new user", response);
                vm.userAdded = true;
                vm.clearUserMeta();

                vm.getUsersList();

            }, function (response) {

                console.log("ERROR new user", response);

            });


        },
        createTabHeaders: function () {

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

                //register the mdl menus on each card
                // setTimeout(function () {
                //     componentHandler.upgradeAllRegistered();
                // }, 500);


            }, function (response) {

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

        /*
            ACTIVE USER METHODS
        */
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

                    componentHandler.upgradeDom();

                  }, response => {
                    // error callback
                    console.log("error: ", response);
                  });
        }





    }
})
