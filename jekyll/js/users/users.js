/**
 * Created by renerodriguez on 2/27/16.
 */

// Vue.config.debug = true;

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
        }

    },
    computed: {

        tableHeader: function () {

            if(this.usersList.length > 0){

                return Object.keys(this.usersList[0])

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
        getUsersList: function(){

            var url = this.auth.user.url

            var params = {
                headers: auth.getAuthHeader()
            }
            // GET request
            this.$http.get(url + '/custom/tables/omk_users', params).then(function (response) {

                console.log(response);

                this.usersList = response.data;

                //register the mdl menus on each card
                // setTimeout(function () {
                //     componentHandler.upgradeAllRegistered();
                // }, 500);


            }, function (response) {

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


        }

    }
})
