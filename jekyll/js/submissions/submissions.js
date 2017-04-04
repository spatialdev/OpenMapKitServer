/**
 * Created by renerodriguez on 2/27/16.
 */

// Vue.config.debug = true;

var v_tableHeaders = []
var v_tableData = []
var v_getParam;

new Vue({
    el: '#submissionsPage',
    name: 'SubmissionsPage',
    delimiters: ['[{', '}]'],
    mixins: [headerMixin],
    data() {
        return {
            auth: auth,
            user: auth.getUser(),
            dataShowedUp: false,
            tableHeaders: [],
            tableData:{},
            searchQuery: '',
            getParam: null
        }
    },
    computed: {

    },
    mounted: function () {
        var vm = this;
        //Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }

    },
    methods: {

    }
})
