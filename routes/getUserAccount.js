var express = require('express');
var router = express.Router();
var oauthsig = require('oauth-signature');
var commons = require('../commons/commons.js');

router.get('/', function(req, res, next) {

    // Parse incoming req
    var query = require('url').parse(req.url,true).query;
    var oauthToken = query.oauth_token;
    var tokenSecret = query.oauth_token_secret;

    var consumerSecret = commons.consumerSecret();

    var format = 'json';

    parameters = commons.getParams(); //pass object with params
    parameters.oauth_token = oauthToken;
    parameters.oauth_callback = 'oob';
    parameters.loc = 'Seattle';
    parameters.format = format;

    // -Chris Socrata
    //parameters = commons.getParams({oauth_token: oauthToken, oauth_callback: 'oob', loc: 'Seattle', format: format}); //lodash extend, merge, underscore

    //> {
    //  default: true,
    //  otherDefault: false,
    //        oauth_token: oauthToken
    //}
    //
    //function getParams(options) {
    //    var params {
    //        default: true,
    //        otherDefault: false
    //    }
    //
    //    for (var key in options) {
    //        params[key] = options[key]
    //    }
    //
    //    return params;
    //}

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

    //var responseParams;
    //var responseToJSON;
    //var accountId;

    var responseParams = request('GET', finalURL).body.toString('utf-8').split("&"); //try catch. hasOwnProperty('body'), is array, has object?
    var responseToJSON = JSON.parse(responseParams[0]);
    var accountId = responseToJSON.account[0].accountId;
    //try {
    //
    //    responseParams = request('GET', finalURL).body.toString('utf-8').split("&"); //try catch. hasOwnProperty('body'), is array, has object?
    //    responseToJSON = JSON.parse(responseParams[0]);
    //    accountId = responseToJSON.account[0].accountId;
    //} catch (e) {
    //    console.log(JSON.stringify(e));
    //}

    //if vars not defined, handle error

    process.env["ACCOUNT_ID"] = accountId;
    console.log("accountId obtained!: " + accountId);
    res.redirect('/index.html');

});

module.exports = router;