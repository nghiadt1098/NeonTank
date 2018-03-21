//Traditional login

function login(type, authObj) {
    console.log(authObj);
    if (type == 'guest') {
        authObj = document.getElementById('username').value;

    }
    var element = document.getElementById('main');
    element.parentNode.removeChild(element);

    socket = io().connect('https://neontankbeta.herokuapp.com/');
    socket.emit('login', type, authObj);
    initSocketEventHandler();
}

//Facebook login api
window.fbAsyncInit = function () {
    FB.init({
        appId: '1635636883182760',
        cookie: true,
        xfbml: true,
        version: 'v2.12'
    });

    FB.AppEvents.logPageView();

};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));




function checkLoginState() {
    var loginStatus;
    FB.getLoginStatus(function (response) {
        loginStatus = response;
    });
    FB.api('/me', function (response) {
        document.getElementById('username').value = response.name;
        authObj = {
            fid: response.id,
            name: response.name,
            accessToken : loginStatus.authResponse.accessToken,
            expiresIn : loginStatus.authResponse.expiresIn,
            signedRequest : loginStatus.authResponse.signedRequest
        }
        login('facebook', authObj);
        // console.log(JSON.stringify(response));
    });
}
//Google Login Api

function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    document.getElementById('username').value = profile.getName();

    //   console.log("ID: " + profile.getId()); // Don't send this directly to your server!
    //   console.log('Full Name: ' + profile.getName());
    //   console.log('Given Name: ' + profile.getGivenName());
    //   console.log('Family Name: ' + profile.getFamilyName());
    //   console.log("Image URL: " + profile.getImageUrl());
    //   console.log("Email: " + profile.getEmail());

    // The ID token you need to pass to your backend:
    //   var id_token = googleUser.getAuthResponse().id_token;
    //   console.log("ID Token: " + id_token);
    var authObj = {
        gid: profile.getId(),
        fullname :profile.getName(),
        familyname : profile.getGivenName(),
        givenname :  profile.getFamilyName(),
        avatarurl:profile.getImageUrl(),
        email:  profile.getEmail(),
        tokenid : googleUser.getAuthResponse().id_token
    }
    login('google', authObj);
};