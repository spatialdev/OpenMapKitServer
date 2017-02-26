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

        // reset cookie
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";

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

                        var date = new Date();
                        var in3hours = new Date(date.getFullYear() , date.getMonth() , date.getDate() , date.getHours()+3 , date.getMinutes() , date.getSeconds())

                        // add token to cookie for enketo-express
                        document.cookie = 'token='+response.data.token + ';path=/' + ';expires=' + in3hours.toGMTString();

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
