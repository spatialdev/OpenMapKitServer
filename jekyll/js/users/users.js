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
            userAdded: false
        }

    },
    mounted: function () {

        //Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }

        dialog = document.querySelector('dialog');


    },
    methods: {

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
