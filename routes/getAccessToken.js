var express = require('express');
var router = express.Router();
var oauthsig = require('oauth-signature');
var configData = require('../config.json');
var commons = require('../commons/commons.js');

/* GET home page. */

// user is routed here via server after the first request is made

router.get('/', function(req, res, next) {

    var query = require('url').parse(req.url,true).query;
    var oauthToken = query.oauth_token;
    var tokenSecret = query.oauth_token_secret;
    var verifier = query.oauth_verifier;

    parameters = commons.getParams();
    parameters.oauth_callback = 'oob';
    parameters.oauth_token = oauthToken;
    parameters.oauth_verifier = verifier;

    var consumerSecret = commons.consumerSecret();

    var httpMethod = 'GET',
        url = 'https://www.car2go.com/api/accesstoken',

    //   oauth_token : 'nnch734d00sl2jdk',
        parameters,
        consumerSecret,
        tokenSecret,
        encodedSignature = oauthsig.generate(httpMethod, url, parameters, consumerSecret, tokenSecret);

    var finalURL = commons.makeURLForRequest(url);
    finalURL = finalURL + "&oauth_signature=" + encodedSignature;

    var request = require('sync-request');

    // New oauth_token and oauth_token_secret are issued
    var responseParams = request('GET', finalURL).body.toString('utf-8').split("&");
    var newOAuthToken = responseParams[0];
    process.env['OAUTH_ACCESS_TOKEN'] = newOAuthToken.split('=')[1];
    var newOAuthTokenSecret = responseParams[1];
    process.env['OAUTH_ACCESS_TOKEN_SECRET'] = newOAuthTokenSecret.split('=')[1];
    console.log("access token ", process.env['OAUTH_ACCESS_TOKEN']);
    console.log("access token secret ", process.env['OAUTH_ACCESS_TOKEN_SECRET']);



    /**********************************************************************************************/
    // From Car2Go API
    //https://www.car2go.com/api/authorize	Pass request token as parameter, e.g. "?oauth_token=[token]"

    //res.render('getUserAccount', { message : "Reached!!!" });

    res.redirect("/getUserAccount" + "?" + newOAuthToken + "&" + newOAuthTokenSecret);
});


module.exports = router;
