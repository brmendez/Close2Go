var express = require('express');
var router = express.Router();
var oauthsig = require('oauth-signature');
var commons = require('../commons/commons.js');

/* GET home page. */

//router.get('/path/filename?id=123&option=456', function(request, response) {
//    var query = require('url').parse(req.url,true).query;
//    var id = query.id;
//    var option = query.option;
//    //where the URL for get should be
//
//
//});

router.get('/', function(req, res, next) {


//Generates a nonce . inline function
    var nonce = new (function() {
        this.generate = function() {
            var now = Date.now();
            this.counter = (now === this.last? this.counter + 1 : 0);
            this.last    = now;
            // add padding to nonce
            var padding =
                this.counter < 10 ? '000' :
                    this.counter < 100 ? '00' :
                        this.counter < 1000 ?  '0' : '';
            return now+padding+this.counter;
        };
    })();

    var consumerKey = process.env['CONSUMER_KEY'] = configData['consumer_key'];



    var httpMethod = 'GET',
        url = 'https://www.car2go.com/api/reqtoken',

    //   oauth_token : 'nnch734d00sl2jdk',
        parameters = {

            oauth_consumer_key : consumerKey,
            oauth_nonce :  nonce.generate(),
            oauth_timestamp : Date.now().toString().substring(0, 10),
            oauth_signature_method : 'HMAC-SHA1',
            oauth_version : '1.0',
            oauth_callback : 'oob'
        },
        consumerSecret = 'Y)WDQe9(]C5Q}uFGAj7A',
        //tokenSecret = 'pfkkdhi9sl3r4s00',
    // generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash


        encodedSignature = oauthsig.generate(httpMethod, url, parameters, consumerSecret);

    // generates a BASE64 encode HMAC-SHA1 hash
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

    /* *****************  HTTP code  *************************************************************************** */


    /* Make synchronous web request with cross platform support.
     Calls car2go and WAITS for the response. */
    var request = require('sync-request');
    // var getSecretAndTokenResponse = request('GET', finalURL);
    // console.log(requesres.redirect("http://localhost:3000/getVerifier.html?" + responseParams[0] + "&" + responseParams[1] );t('GET', finalURL).body.toString('utf-8'));

    var responseParams = request('GET', finalURL).body.toString('utf-8').split("&");

    /**********************************************************************************************/
    // From Car2Go API
    //https://www.car2go.com/api/authorize	Pass request token as parameter, e.g. "?oauth_token=[token]"


    res.redirect("http://localhost:3000/getVerifier.html?" + responseParams[0] + "&" + responseParams[1]);

    res.end(responseParams[0]);

    // res.render('index', { title: encodedSignature });
});


module.exports = router;