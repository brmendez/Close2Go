var express = require('express');
var router = express.Router();
var oauthsig = require('oauth-signature');
var keys = require('../config.json');
var commons = require('../commons/commons.js');


// createBooking is a HTTP POST request
// needs the cars VIN # as well as the users Account ID
// test - http://localhost:3000/createBooking?vin=WMEEJ3BA5FK791926

router.post('/', function(req, res) {
    // Parse vin fom req
    var vin = req.body.vin;

    var account = keys.account_id;
    var format = 'json';
    var test = 1;

    parameters = commons.parameters;
    parameters.oauth_token = keys.oauth_access_token;
    parameters.account = account;
    parameters.vin = vin;
    parameters.format = format;
    parameters.test = test;

    var consumerSecret = keys.consumer_secret;
    var tokenSecret = keys.oauth_access_token_secret;

    var httpMethod = 'POST',
        url = 'https://www.car2go.com/api/v2.1/bookings',
        parameters,
        consumerSecret,
        tokenSecret,

        encodedSignature = oauthsig.generate(httpMethod, url, parameters, consumerSecret, tokenSecret);

    // Make headers for POST request
    var headerParams = commons.makeHeaderParams();

    // Append signature to params
    // In header params the '&' need to be ',' and the key values need to be in (") quotes
    headerParams = headerParams + ",oauth_signature=" + '"' + encodedSignature + '"';

    // Make synchronous web request
    // Calls car2go and WAITS for the response
    var request = require('sync-request');
    var bookCarURL = url + '?account=' + account + '&format=' + format + '&vin=' + vin + '&test=' + test;
    var createBookingRes = request('POST', bookCarURL, {
        // EXAMPLE AUTHORIZATION HEADERS BELOW
        headers: { Authorization: headerParams }
    });

    //bookingId
    var response = createBookingRes.getBody('utf8');
    var responseToJSON = JSON.parse(response);
    //bookingId, Lat, Lng
    var bookingId = responseToJSON.booking[0].bookingId;
    var reserveLat = responseToJSON.booking[0].bookingposition.latitude;
    var reserveLng = responseToJSON.booking[0].bookingposition.longitude;

    var currentReservationCreds = {
        bookingId: bookingId,
        lat: reserveLat,
        lng: reserveLng
    };

    res.json(currentReservationCreds);
    console.log("end createBooking");

});

module.exports = router;

// *************************************************** END CODE *************************************************** //

// AUTHORIZATION HEADERS EXAMPLE
// headers: {
// Authorization: 'OAuth oauth_consumer_key="TheKey",
// oauth_token="8UjdIjhdkaiOUhdjK",
// oauth_signature_method="HMAC-SHA1",
// oauth_timestamp="1451787558",
// oauth_nonce="vqrLH8",
// oauth_version="1.0",
// oauth_signature="HtdCgUClJkdkH%3D"'
// }


// XML STRING PARSING EXAMPLE
//var startString = body.indexOf('<description>') + 13; //offsets the index of '<bookingId>' (which is 11 indices)
//var endstring = body.indexOf('</description>');
//var description = body.substring(startString, endstring) + " Booking Cancelled."; //extracts substring between the startString/endString index points