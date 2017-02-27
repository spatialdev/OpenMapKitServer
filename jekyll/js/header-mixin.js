// inject a handler for `myOption` custom option
var headerMixin ={

	  delimiters: ['[{', '}]'],

	  created: function () {

	      console.log("Mixin installed")

	  },
	  data () {
	        return {
	            sayWhat: true
	        }
	    },
	  methods: {
	  	logOut: function () {
	  		auth.logout();
	  	}
	  }
}