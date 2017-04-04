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
        filteredData: function () {
              var filterKey = this.searchQuery && this.searchQuery.toLowerCase()
              var data = this.tableData
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
        var vm = this;
        //Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }


        //wait till data is processed from omk.js
        setTimeout(function(){
            vm.tableHeaders = v_tableHeaders
            console.log("setTimeout:")
            vm.tableData = v_tableData;
            vm.getParam = v_getParam
            vm.dataShowedUp = true;
         }, 5000);

        console.log("mounted:")
    },
    methods: {
        isUserAuthorizedToEdit: function (formid) {

            // var user = AUTH.getUser();
            var authorized, result = [];
            // var formid = getParam('form');

            // check if app level admin
            if (this.user.role === "admin"){
                authorized = true;
            } else if (this.user.formPermissions.length > 0) {
                this.user.formPermissions.forEach(function(f){
                    // ONLY form level admin is authorized
                    if (f.form_id === formid && f.role === "admin") result.push(f)
                });

                authorized = result.length > 0;
            }
            console.log("authorized: ", authorized)
            return authorized
        }
    }
})
