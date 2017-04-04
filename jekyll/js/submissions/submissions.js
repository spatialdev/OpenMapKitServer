/**
 * Created by renerodriguez on 2/27/16.
 */

// Vue.config.debug = true;

var tableHeaders = []
var tableData = []

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
            searchQuery: ''
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
            vm.tableHeaders = tableHeaders
            console.log("setTimeout:")
            vm.tableData = tableData;
            vm.dataShowedUp = true;
         }, 2000);

        console.log("mounted:")

    }
})
