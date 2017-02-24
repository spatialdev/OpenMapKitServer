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
                username: '',
                password: ''
            },
            error: '',
            invalid: false,
            loading: false,
            auth: auth
        }
    },
    mounted: function () {

    },
    methods: {

        getReturnURL: function () {
            var url = location.href.slice(location.href.indexOf("=")+1, location.href.length);
            return location.href.indexOf("=") > -1 && url.length > 0 ? url : null;
        },

        submit() {
            this.loading = true;
            var vm = this;
              var credentials = {
                username: this.credentials.username,
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
                        if(vm.getReturnURL()){
                            window.location = vm.getReturnURL();
                        } else {
                            window.location = '/omk/pages/forms';
                        }

                    }, 100);
                }
              })
              .catch(function (error) {
                console.log(error);
              });
            }
        
    }
})
