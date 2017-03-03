/**
 * Created by renerodriguez on 2/27/16.
 */

// Vue.config.debug = true;

var dialog;

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
            user: auth.getUser(),
            editMode: false,
            isFocused: false
        }

    },
    mounted: function () {

        //Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }

        dialog = document.querySelector('dialog');

        // this.getUsersList();


        componentHandler.upgradeDom();


    },
    created() {
        this.getUsersList();
    },
    methods: {
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
        getUsersList: function(){

            var url = this.auth.user.url

            var params = {
                headers: auth.getAuthHeader()
            }
            // GET request
            this.$http.get(url + '/custom/tables/vw_omk_user_details/' + this.user.id, params).then(response => {
                    console.log(response.body);
                    this.userDetails = response.body;

                    componentHandler.upgradeDom();

                  }, response => {
                    // error callback
                    console.log(err);
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
