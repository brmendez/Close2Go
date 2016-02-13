var express = require('express');
var router = express.Router();
var oauthsig = require('oauth-signature');
var commons = require('../commons/commons.js');

/* GET home page. */

// user is routed here via server after the first request is made

router.get('/', function(req, res, next) {

    var query = require('url').parse(req.url,true).query;
    var oauthToken = query.oauth_token;
    var oauthTokenSecret = query.oauth_token_secret;
    var verifier = query.oauth_verifier;

    var consumerKey = process.env['CONSUMER_KEY'] = configData['consumer_key'];

    var httpMethod = 'GET',
        url = 'https://www.car2go.com/api/accesstoken',

    //   oauth_token : 'nnch734d00sl2jdk',
        parameters = {

            oauth_consumer_key : consumerKey,
            oauth_nonce :  commons.nonce.generate(),
            oauth_timestamp : Date.now().toString().substring(0, 10),
            oauth_signature_method : 'HMAC-SHA1',
            oauth_version : '1.0',
            oauth_callback : 'oob',
            oauth_token : oauthToken,
            oauth_verifier : verifier
        },
        consumerSecret = 'Y)WDQe9(]C5Q}uFGAj7A',

        encodedSignature = oauthsig.generate(httpMethod, url, parameters, consumerSecret, oauthTokenSecret);

    //  signature = oauthsig.generate(httpMethod, url, parameters, consumerSecret,{ encodeSignature: false});

    var finalURL = url + '?' ;
    var x = 0;
    for ( var key in parameters)
    {
        // if first iteration (x == 0), add 'key=value'
        if ( x == 0)
        {
            finalURL = finalURL + key + "=" + parameters[key];
        }
        // else everything following, add '&key=value'
        else
        {
            finalURL = finalURL + "&" + key + "=" + parameters[key];
        }
        console.log("key: " + key);
        console.log("value: " + parameters[key]);
        // increment counter
        x = x + 1;
    }

    finalURL = finalURL + "&oauth_signature=" + encodedSignature;

    /* Make synchronous web request with cross platform support.
     Calls car2go and WAITS for the response. */
    var request = require('sync-request');
    // var getSecretAndTokenResponse = request('GET', finalURL);
    // console.log(requesres.redirect("http://localhost:3000/getVerifier.html?" + responseParams[0] + "&" + responseParams[1] );t('GET', finalURL).body.toString('utf-8'));

    var responseParams = request('GET', finalURL).body.toString('utf-8').split("&");

    /**********************************************************************************************/
    // From Car2Go API
    //https://www.car2go.com/api/authorize	Pass request token as parameter, e.g. "?oauth_token=[token]"

    res.render('getAccessToken', { message : "Reached!!!" });
});

module.exports = router;
