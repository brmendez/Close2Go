var express = require('express');
var router = express.Router();
var oauthsig = require('oauth-signature');
var keys = require('../config.json');
var commons = require('../commons/commons.js');

// the code exists in commons.js
// cancelBooking is an HTTP 'DELETE' Request
// Cancel's a current reservation. URL requires 'bookingId.' Test Id is '321'
// *** bookingId must be appended in url prior to signing 'https://www.car2go.com/api/v2.1/booking/[bookingId]' as shown below

router.get('/', function(req, res, next) {

    var bookingId = '321';
    var test = 1;
    var format = 'json';
    parameters = commons.parameters;
    parameters.oauth_token = keys.oauth_access_token;
    parameters.format = format;
    parameters.test = test;

    var consumerSecret = keys.consumer_secret;
    var tokenSecret = keys.oauth_access_token_secret;

    var httpMethod = 'DELETE',
        url = 'https://www.car2go.com/api/v2.1/booking/' + bookingId, //bookingId goes here
        parameters,
        consumerSecret,
        tokenSecret,
        // generate signature
        encodedSignature = oauthsig.generate(httpMethod, url, parameters, consumerSecret, tokenSecret);

    // make headers for DELETE request
    var headerParams = commons.makeHeaderParams();

    // Append sig to header
    // In header params the '&' need to be ',' and the key values need to be in (") quotes
    headerParams = headerParams + ',oauth_signature="' + encodedSignature + '"';

    // Makes synchronous web request
    // Calls car2go and WAITS for the response
    var request = require('sync-request');
    var cancelBookingURL = url  + '?' + 'format=' + format + '&test=' + test;
    var cancelBookingResponse = request('DELETE', cancelBookingURL, {
        headers: { Authorization: headerParams }
    });

    var response = cancelBookingResponse.getBody('utf8');
    var responseToJSON = JSON.parse(response);
    var cancelConfirmed = responseToJSON.returnValue.description + " Your booking has been Cancelled.";
    // for xml string parsing example, see below

    console.log(cancelConfirmed);
    console.log("end cancelBooking");

});
module.exports = router;