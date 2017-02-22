/**
 * Created by renerodriguez on 2/27/16.
 */

// Vue.config.debug = true;

new Vue({
    el: '#loginPage',
    name: 'LoginPage',
    delimiters: ['[{', '}]'],
    data() {
        return {
            credentials: {
                email: 'peter@klaven',
                password: 'cityslicka'
            },
            error: '',
            invalid: false,
            loading: false,
            auth: auth
        }
    },
    computed: {
        authUser: function (){
            return auth.user
        }
    },
    mounted: function () {

    },
    methods: {

        submit() {
            this.loading = true;
            var vm = this;
              var credentials = {
                email: this.credentials.email,
                password: this.credentials.password
              }
              //this takes the object, credentials and if valid the route it should go
              auth.login(this, credentials)
              .then(function (response) {
                console.log(response);
                if (!response.data.token){
                    vm.invalid = true;
                    vm.loading = false;
                }else{
                    setTimeout(function () {
                        window.location = '/omk/pages/forms';
                    }, 100);
                }
              })
              .catch(function (error) {
                console.log(error);
              });
            }
        
    }
})
