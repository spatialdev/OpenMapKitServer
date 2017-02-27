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
	  		document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
	  		auth.logout();
	  		window.location = '/omk/pages/login';

	  	}
	  }
}