var auth =  {
  //initial state
  user: {
    authenticated: false,
    token: null,
    profile:'',
    invalid: false,
    required: true
  },
  //call to the API and check against the credentials
  login(context, creds) {
    return context.$http.post("https://reqres.in/api/login", creds, (data) => {
      //if there's a token property, then its valid
      if(data.token){
        localStorage.setItem('id_token', data.token)

        localStorage.setItem('profile', 'admin')

        this.user.authenticated = true;

        this.user.token = data.token;
    }
    }).catch((err) => {
      console.log(err);
    })

  },
  //logging out will remove the token from local storage and auth as false
  logout() {
    localStorage.removeItem('id_token')
    localStorage.removeItem('profile')
    this.user.authenticated = false;
  },
  //Method to check if the local storage contains token
  checkAuth() {
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
  }
}