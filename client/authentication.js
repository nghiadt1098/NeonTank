//Traditional login
function login(type, authObj) {
    if (type == 'guest') {
        authObj = document.getElementById('username').value;
    }
    color = document.getElementById('color').value;
    var element = document.getElementById('main');
    element.parentNode.removeChild(element);

    socket = io().connect('https://neontankbeta1.herokuapp.com/');
    socket.emit('login', msgpack5().encode(type), msgpack5().encode(authObj));
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
    FB.getLoginStatus(function (response) {
        FB.api('/me', function (res) {
            var authObj = {
                fid: res.id,
                name: res.name,
                accessToken: response.authResponse.accessToken,
                expiresIn: response.authResponse.expiresIn,
                signedRequest: response.authResponse.signedRequest
            }
            login('facebook', authObj);
        });
    });
}

//Google Login Api


function onSuccess(googleUser) {
    var profile = googleUser.getBasicProfile();
    var authObj = {
        gid: profile.getId(),
        fullname: profile.getName(),
        givenname: profile.getGivenName(),
        familyname: profile.getFamilyName(),
        avatarurl: profile.getImageUrl(),
        email: profile.getEmail(),
        tokenid: googleUser.getAuthResponse().id_token
    }
    login('google', authObj);
}

function onFailure(error) {
    console.log(error);
}

function renderButton() {
    var w=document.getElementById("facebookDiv").offsetWidth;
    var fb=document.getElementById("facebookDiv");
    fb.style.setProperty( 'data-width', '400'+'px', 'important' );
    gapi.signin2.render('my-signin2', {
        'scope': 'profile email',
        'width': 400,
        'height': 40,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}