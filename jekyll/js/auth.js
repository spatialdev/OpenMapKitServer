var auth =  {
  //initial state
  user: {
    authenticated: false,
    token: null,
    user: null,
    tokenExpiration: null,
    invalid: false,
    required: true,
    url: "http://52.14.154.36:3210"
  },
  //call to the API and check against the credentials
  login(context, creds) {

        return context.$http.post(this.user.url +  "/custom/users/authenticate", creds).then(response => {

        //if there's a token property, then its valid
          if(response.body.token){

            localStorage.setItem('id_token', response.body.token)

            localStorage.setItem('user', JSON.stringify(response.body.user))

            localStorage.setItem('tokenExpiration', JSON.stringify(response.body.tokenExpiration))

            this.user.authenticated = true;
            this.user.token = response.body.token;
            this.user.user = response.body.user;
            this.user.tokenExpiration = response.body.tokenExpiration

            return response.body;
          }

        // get body data
        console.log(response.body);

      }, response => {
        // error callback
        console.log(response);
      });

  },
  //logging out will remove the token from local storage and auth as false
  logout() {
    localStorage.removeItem('id_token')
    localStorage.removeItem('user')
    this.user.authenticated = false;
  },
  //Method to check if the local storage contains token
  checkAuth() {

    // this.checkIfTokenIsValid();

    var jwt = localStorage.getItem('id_token')
    if(jwt) {
      this.user.authenticated = true;
      this.user.token = jwt;
    }
    else {
      this.user.authenticated = false;
      window.location = '/omk/pages/login';
    }
  },
  //Method to return the token from local storage
  getAuthHeader() {
    return {
      'Authorization': 'Bearer ' + localStorage.getItem('id_token')
    }
  },
  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null')
  },
  checkIfTokenIsValid () {

    var tokenExpiration = localStorage.getItem('id_token')


    if( Date.now() > tokenExpiration){
      localStorage.removeItem('id_token')
      localStorage.removeItem('user')
      this.user.authenticated = false;
      this.user.expiredDate = null
      this.user.authenticated = false;
      this.user.token = null;

      window.location = '/omk/pages/login';
    }


  }
}