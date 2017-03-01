/**
 * Created by renerodriguez on 2/27/16.
 */

// Vue.config.debug = true;

new Vue({
    el: '#usersPage',
    name: 'UsersPage',
    delimiters: ['[{', '}]'],
    mixins: [headerMixin],
    data() {
        return {
            auth: auth,
            user: auth.getUser()
        }

    },
    mounted: function () {

        //Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }


    },
    methods: {

        addUser: function () {

            console.log("click")
            // dialog with link to enketo-express URL
            var dialog = document.querySelector('dialog');


            // if (dialog) {
                // close dialog
                dialog.querySelector('.close').addEventListener('click', function () {
                    dialog.close();
                });
            // }

            // show dialog
            dialog.showModal();

            dialog.querySelector('#addUser').addEventListener('click', function () {
                dialog.close();
            });

        }

    }
})
