// inject a handler for `myOption` custom option

menuOptions = [
    {
        href: "/omk/pages/useraccount/",
        label: 'My Account',
    },
    {
        href: "/omk/pages/users/",
        label: 'User Management',
    },
    {
        type: 'divider'
    },
    {
    	href: "logout",
        label: 'Sign Out',
    }
];
var headerMixin ={

	  delimiters: ['[{', '}]'],

	  data() {
	  	return {
	  		menuOptions
	  	}
	  },

	  mounted: function () {

	  	//Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }

	  	//remove User Management link for non Admin users
	  	if(this.user.role !== 'admin'){
	  		_.remove(this.menuOptions, {label: 'User Management'});
	  	}

	  },
	  methods: {
	  	selectedMenuOption: function (e) {
	  		console.log("e: ", e);
	  		if(e.href == "logout"){
	  			this.logOut();
	  			return;
	  		}
	  		window.location = e.href;
	  	},
	  	logOut: function () {
	  		document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
	  		auth.logout();
	  		window.location = '/omk/pages/login';

	  	}
	  }
}