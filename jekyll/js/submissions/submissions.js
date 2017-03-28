/**
 * Created by renerodriguez on 2/27/16.
 */

// Vue.config.debug = true;

new Vue({
    el: '#submissionsPage',
    name: 'SubmissionsPage',
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
    }
})
