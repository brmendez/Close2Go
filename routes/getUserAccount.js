var express = require('express');
var router = express.Router();
var oauthsig = require('oauth-signature');
var commons = require('../commons/commons.js');


router.get('/', function(req, res, next) {

    // Parse incoming req
    var query = require('url').parse(req.url,true).query;
    var oauthToken = query.oauth_token;
    var oauthTokenSecret = query.oauth_token_secret;
    var verifier = query.oauth_verifier;

    //oauth_token=2iY5Q1mHcR3fSgNHKpJpswzx&oauth_token_secret=tPMebSHlmddzVgukjBe9TQOy
    //var accessToken = "2iY5Q1mHcR3fSgNHKpJpswzx";
    //var accessTokenSecret = "tPMebSHlmddzVgukjBe9TQOy";

    var accessToken = commons.accessToken();

    var consumerSecret = commons.consumerSecret();
    var tokenSecret = commons.accessTokenSecret();

    var format = 'json';

    parameters = commons.parameters;
    parameters.oauth_token = accessToken;
    parameters.oauth_callback = 'oob';
    parameters.loc = 'Seattle';
    parameters.format = format;

    var httpMethod = 'GET',
        url = 'https://www.car2go.com/api/v2.1/accounts',
        parameters,
        consumerSecret,
        tokenSecret,
        encodedSignature = oauthsig.generate(httpMethod, url, parameters, consumerSecret, tokenSecret);

    var finalURL = commons.makeURLForRequest(url);

    finalURL = finalURL + "&oauth_signature=" + encodedSignature;

    /* Make synchronous web request with cross platform support.
     Calls car2go and WAITS for the response. */
    var request = require('sync-request');

    var responseParams = request('GET', finalURL).body.toString('utf-8').split("&");
    var responseToJSON = JSON.parse(responseParams[0]);
    var accountId = responseToJSON.account[0].accountId;
    console.log("accountId: " + accountId);

    //res.end(responseParams[0]);

    // res.render('index', { title: encodedSignature });
    //res.render('getAccessToken', { message : "Reached!!!" });

});

module.exports = router;