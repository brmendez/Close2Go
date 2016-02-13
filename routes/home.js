var express = require('express');
var router = express.Router();
var oauthsig = require('oauth-signature');
var keys = require('../config.json');
var commons = require('../commons/commons.js');


router.get('/', function(req, res, next) {

    parameters = commons.parameters;
    parameters.oauth_callback = 'oob';

    var consumerSecret = keys.consumer_secret;

    var httpMethod = 'GET',
        url = 'https://www.car2go.com/api/reqtoken',
        parameters,
        consumerSecret,
        encodedSignature = oauthsig.generate(httpMethod, url, parameters, consumerSecret);

    var finalURL = commons.makeURLForRequest(url);

    finalURL = finalURL + "&oauth_signature=" + encodedSignature;

    /*

     This is the sample of the first request we have to make.
     https://www.car2go.com/api/reqtoken
     ?oauth_consumer_key=TheKey
     &oauth_signature_method=HMAC-SHA1
     &oauth_timestamp=1450484877
     &oauth_nonce=Tj5JvNUtCXaVu16dwVn6tXENDlytiCTg
     &oauth_callback=oob
     &oauth_version=1.0
     &oauth_signature=inY%2BET%2BvSqDVFRSYqg3Tfsm2gAQ%3D

     */

    // Issued oauth_token and oauth_token_secret
    var request = require('sync-request');
    var responseParams = request('GET', finalURL).body.toString('utf-8').split("&");
    var oauthToken = responseParams[0];
    var oauthTokenSecret = responseParams[1];

    /**********************************************************************************************/
    // From Car2Go API
    //https://www.car2go.com/api/authorize	Pass request token as parameter, e.g. "?oauth_token=[token]"

    // Send client to getVerifier with oauth_token and oauth_token_secret
    res.redirect("http://localhost:3000/getVerifier.html?" + oauthToken + "&" + oauthTokenSecret);

});
module.exports = router;