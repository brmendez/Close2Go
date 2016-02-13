var express = require('express');
var router = express.Router();
var commons = require('../commons/commons.js');
var query;
var userLocation;

router.get('/', function(req, res, next) {

    // Parse lat and lng from query
    query = req.query;

    //convert lat and lng (string) to Int
    userLocation = {
    lat: Number(query.lat),
    lng: Number(query.lng)

    }

    var freeCars;
    var closestCar;

    freeCars = commons.getCarsFromCar2Go();
    var carsJSON = JSON.parse(freeCars);

    closestCar = commons.getNearestCar(userLocation, carsJSON.placemarks);

    var myObject = {cars: carsJSON, closest: closestCar, userLocation: userLocation};

    res.json(myObject);

});

module.exports = router;