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
            usersList: []
        }

    },
    mounted: function () {

        //Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }

        dialog = document.querySelector('dialog');

        this.getFormListData();


    },
    methods: {
        getFormListData: function(){

            var url = this.auth.user.url

            var params = {
                headers: auth.getAuthHeader()
            }
            // GET request
            this.$http.get(url+ '/tables/omk_users', params).then(function (response) {

                console.log(response);

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
