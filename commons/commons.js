var keys = require('../config.json');

// OAUTH BUILDER

//these are pulling from my environment variables in config.json
var configData = require('../config.json');

var consumerKey = process.env['CONSUMER_KEY'] = configData['consumer_key']; // function not needed since this value is always required

// Made the choice to use function because values werent in my routes when I needed them
// So I just call these methods from my routes to get the values
var consumerSecret = function () {
    var consumerSecret = process.env['CONSUMER_SECRET'] = configData['consumer_secret'];
    return consumerSecret;
}
module.exports.consumerSecret = consumerSecret;

var accessToken = function() {
    var accessToken = process.env['OAUTH_ACCESS_TOKEN'];
    return accessToken;
}
module.exports.accessToken = accessToken;

var accessTokenSecret = function() {
    var accessTokenSecret = process.env['OAUTH_ACCESS_TOKEN_SECRET'] = configData['oauth_access_token_secret'];
    return accessTokenSecret;
}
module.exports.accessTokenSecret = accessTokenSecret;

var accountId = function() {
    var accountId = process.env['ACCOUNT_ID'] = configData['account_id'];
    return accountId;
}
module.exports.accountId = accountId;

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
module.exports.nonce = nonce;

// See mainPage.js
// Function was made to obtain new instance of params because accountId trickled down from first ajax call '/createBooking' down to 3rd ajax call when '/cancelBooking' fired
var getParams = function() {
parameters = {
    oauth_consumer_key : consumerKey,
    oauth_nonce :  nonce.generate(),
    oauth_timestamp : Date.now().toString().substring(0, 10),
    oauth_signature_method : 'HMAC-SHA1',
    oauth_version : '1.0'
}
    return parameters;
}
module.exports.getParams = getParams;

// Requirements for oauth and routes
// reqtoken (home.js) - issues oauth_token, oauth_token_secret
// authorizeToken (verifier.js) -
// getAccessToken - verifier, token
// getUserAccounts - location, token
// createBooking - vin, accountId, token
// cancelBooking - bookingId, token

////home.js ('requestToken') - gives back oauth_token and oauth_token_secret
//parameters = {
//
//    oauth_consumer_key : 'TheKey',
//    oauth_nonce :  nonce.generate(),
//    oauth_timestamp : Date.now().toString().substring(0, 10),
//    oauth_signature_method : 'HMAC-SHA1',
//    oauth_version : '1.0',
//    oauth_callback : 'oob'
//}


////getAccessToken
//parameters = {
//
//    oauth_consumer_key : 'TheKey',
//    oauth_nonce :  nonce.generate(),
//    oauth_timestamp : Date.now().toString().substring(0, 10),
//    oauth_signature_method : 'HMAC-SHA1',
//    oauth_version : '1.0',
//    oauth_callback : 'oob',
//    oauth_token : oauthToken,
//    oauth_verifier : verifier
//}


////getUserAccount
//parameters = {
//
//    oauth_consumer_key : 'TheKey',
//    oauth_nonce :  nonce.generate(),
//    oauth_timestamp : Date.now().toString().substring(0, 10),
//    oauth_signature_method : 'HMAC-SHA1',
//    oauth_version : '1.0',
//    oauth_callback : 'oob',
//    oauth_token : accessToken,
//    loc : 'Seattle'
//}


////createBooking
////account, vin, format
//parameters = {
//    oauth_consumer_key : process.env['CONSUMER_KEY'],
//    oauth_nonce :  nonce.generate(),
//    oauth_timestamp : Date.now().toString().substring(0, 10),
//    oauth_signature_method : 'HMAC-SHA1',
//    oauth_version : '1.0',
//    oauth_token : accessToken,
//    account : account,
//    vin : vin,
//    test : test,
//    format : 'json'
//}


//cancelBooking



// Make finalURL
var makeURLForRequest = function(url) {
    url = url + '?' ;
    var x = 0;
    for ( var key in parameters)
    {
        // if first iteration (x == 0), add 'key=value'
        if ( x == 0)
        {
            url = url + key + "=" + parameters[key];
        }
        // else everything following, add '&key=value'
        else
        {
            url = url + "&" + key + "=" + parameters[key];
        }
        //console.log("key: " + key);
        //console.log("value: " + parameters[key]);
        // increment counter
        x = x + 1;
    }
    return url;
}
module.exports.makeURLForRequest = makeURLForRequest;



// create request headers for create/cancelBooking
var makeHeaderParams = function () {
    var headerParams = 'OAuth ' ;
    var x = 0;
    for (var key in parameters)
    {
        // if first iteration (x == 0), add 'key=value'
        if ( x == 0)
        {
            headerParams = headerParams + key + '="' + parameters[key] + '"';
        }
        // else everything following, add ',key="value"'
        else
        {
            //we are using parameters var at 2 places, sig gen method also needs account and vin, so skip it.
            //we dont need these params in the header.
            if (key != 'account' && key !='vin' && key != 'test' && key != 'format') {

                headerParams = headerParams + ',' + key + '="' + parameters[key] + '"';
            }

        }
        // increment counter
        x = x + 1;
    }
    return headerParams;
}
module.exports.makeHeaderParams = makeHeaderParams;




// MY FUNCTIONS

//Web request to Car2Go to retrieve all available cars
getCarsFromCar2Go = function() {

    var consumerKey = process.env['CONSUMER_KEY'];
    var finalURL = "https://www.car2go.com/api/v2.1/vehicles?loc=seattle&oauth_consumer_key=" + consumerKey + "&format=json";
    var request = require('sync-request');
    var responseParams = request('GET', finalURL).body.toString('utf-8').split("&");

    return responseParams[0];
}

//takes users lat/lng and array of cars.
  var getNearestCar = function(userLatLng, cars) {

        var minIndex;
        var minDistance;
        var currentDistance;

        for (var i = 0; i < cars.length; i++) {
            //extracts car one by one to compare distance in calcDistBtwnPnts
            var carToCompare = {lat: cars[i].coordinates[1], lng: cars[i].coordinates[0]};

            // currentDistance holds square root of user lat/long & car lat/long
            currentDistance = calcDistBtwnPnts(userLatLng, carToCompare);

            /*
             first iteration is ALWAYS undefined,so minDistance will be populated with first value.
             The index at first iteration will also be captured
             */

            if (minDistance == undefined) {
                minDistance = currentDistance;
                //minIndex = i;
            } else {

                if (currentDistance < minDistance) {
                    minDistance = currentDistance; //keep setting if finding smaller values
                    minIndex = i; //as well as index
                    var theCar = cars[i];
                };
            }
        }
        ;
        return theCar;
    };

//Pythagorean theorem to calculate distance
    function calcDistBtwnPnts(pt1, pt2) {

        var a = pt1.lat - pt2.lat; //usr lat - car lat
        var b = pt1.lng - pt2.lng; //usr lng - car lng

//obtains difference between my lat/long and car lat/long
        var x = a * a;
        var y = b * b;

        // distance = a2 + b2
        distance = x + y;

        // = c2
        var squareRoot = Math.sqrt(distance)

        return squareRoot;

    }
module.exports.getCarsFromCar2Go = getCarsFromCar2Go;
module.exports.getNearestCar = getNearestCar;
module.exports.calcDistBtwnPnts = calcDistBtwnPnts;