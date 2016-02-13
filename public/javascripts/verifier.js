
function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

window.onload = function () {
        //alert(getParameterByName("oauth_token"))
        var token = getParameterByName("oauth_token");
        var tokenSecret = getParameterByName("oauth_token_secret");
        window.open("https://www.car2go.com/api/authorize?oauth_token=" + token, "", "_blank, width=350, height=300, top=270, left=450" );
        // pass token to getVerifier.html
        document.getElementById("oauthTokenHidden").value = token;
        document.getElementById("oauthTokenSecretHidden").value = tokenSecret;
};