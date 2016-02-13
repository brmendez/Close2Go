var express = require('express');
var router = express.Router();
var commons = require('../commons/commons.js');

router.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, application/json'); //tell client what they are getting back.
    next();
});

router.post('/', function (req, res) {

    var freeCars;
    var body = req.body;

    var bookingId = Number(body.bookingId);

    var reservedCar = {
        lat: Number(body.reserveLat),
        lng: Number(body.reserveLng)
    }

    var user = {
        lat: Number(body.userLat),
        lng: Number(body.userLng)
    }

    var reserveSquareRoot = commons.calcDistBtwnPnts(user, reservedCar);
    var newestCarSquareRoot;

    var x = 0;
    var storedCar;
    var closerCar;

    var counter = 0;
    function keepGoing() {
        counter += 1;
        console.log("Checking for closer Car2Go! ", counter);
        freeCars = commons.getCarsFromCar2Go();
        var carsJSON = JSON.parse(freeCars);

        closestCar = commons.getNearestCar(user, carsJSON.placemarks);

        //store the first car
        if (x == 0) {

            storedCar = closestCar;
            closerCar = closestCar;
            x += 1;

        }  else { //if (closestCar.vin != storedCar.vin) { //if vins do not match, then yahtzee, store the new car

            closerCar = closestCar;
        }

        //set newest cars coordinates
        var newestCar = {
            lat: closestCar.coordinates[1],
            lng: closestCar.coordinates[0]
        }

        //check newest cars coordinates against user
        newestCarSquareRoot = commons.calcDistBtwnPnts(user, newestCar);

        startCheckingForCloserCars();
    }

    //each interval gets a unique ID so that I can tell it when to stop by calling clearInterval()
    var intervalId = setInterval(startCheckingForCloserCars, 5000);

    function startCheckingForCloserCars() {
        // magic happens here
        // if newest search yields a car w/ smaller square root and different vin numbers, cancel, then reserve!


        if (newestCarSquareRoot < reserveSquareRoot) { //} && storedCar.vin != closerCar.vin) {    <----uncomment!-----

              console.log("There is a closer car!", closerCar.vin);
              clearInterval(intervalId);

        } else {
            keepGoing();
        }
    }

    keepGoing();

    var myObject = {message: "There is a closer car! Would you like to reserve it? ", vin: closerCar.vin, address: closerCar.address};
    console.log("Interval Check!! ");

    res.json(myObject);

});

module.exports = router;