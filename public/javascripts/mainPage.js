
var map; //maps is created in initMap func
var freeCars; //called in httpGetAsync();
var myLatLng; //location is generated in getUserGeoLocation() which is called from initMap
var domain = 'https://www.car2go.com/api/authorize';
var currentVin = -1;
var reserveCarLocation; // object{lat:, lng:}

//nearest car
var closestCar;

function initMap() {
  //Renders in ID 'map' div
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: myLatLng
  });

  var marker = new google.maps.Marker ({
    position: myLatLng,
    map: map
  });

   getUserGeoLocation(map);
}

function getUserGeoLocation(map){

var infoWindow = new google.maps.InfoWindow({map: map});

  //  HTML5 - get user's geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        myLatLng =
                  {
                   lat: position.coords.latitude,
                   lng: position.coords.longitude
                  };

      infoWindow.setPosition(myLatLng);
      infoWindow.setContent('You are here');
      map.setCenter(myLatLng);

      // Create marker for user
      var meMarker = new google.maps.Marker({
        map: map,
        position: myLatLng
      });

      // Add circle overlay and bind to marker
      var circle = new google.maps.Circle({
        map: map,
        radius: 10,    // in metres
        strokeColor: 'blue',
        fillColor: 'blue'
      });
      circle.bindTo('center', meMarker, 'position');

        httpGetAsync();

        //$.ajax({
        //    url: '/getCarData',
        //    data: {lat: myLatLng.lat, lng: myLatLng.lng},
        //    type: 'GET',
        //    success: function (data) {
        //        freeCars = data;
        //        console.log("response from getCarData: ", freeCars);
        //        plotCars(data);
        //
        //    }
        //});

    // user's latitude and longitude passed to prep for getNearestCar() method
    //  httpGetAsync(myLatLng.lat, myLatLng.lng);

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
  'Error: The Geolocation service failed.' :
  'Error: Your browser doesn\'t support geolocation.');
}


function httpGetAsync() {

    var url = "/getCarData";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            data = $.parseJSON(xmlHttp.responseText);
            plotCars(data);
        }
    };
    xmlHttp.open("GET", url+"?"+"lat="+myLatLng.lat + "&" + "lng="+myLatLng.lng, true); // true for asynchronous
    xmlHttp.send(null);

}


function plotCars(freeCars) {

    var drill = freeCars.cars.placemarks;

    closestCar =
                {
                    lat: freeCars.closest.coordinates[1],
                    lng: freeCars.closest.coordinates[0]
                };

    var closestCarMarker = new google.maps.Marker({
        position: closestCar,
        map: map,
        title: name
    });

    var infowindow = new google.maps.InfoWindow();
    freeCars.closest.name = "The nearest car. Jackpot.";
    infowindow.setContent(freeCars.closest.name);
    infowindow.open(map, closestCarMarker);

    //Drill into/check 'freeCars.placemarks.length'.
    for (var i = 0; i < freeCars.cars.placemarks.length; i++) {

        var carsLatLng = {
            lat: drill[i].coordinates[1],
            lng: drill[i].coordinates[0]
        };

        var name = drill[i].name;

        var marker = new google.maps.Marker({
            position: carsLatLng,
            map: map,
            title: name
        });

        google.maps.event.addListener(marker, 'click', (function(marker,i) {
            return function() {
                currentVin = (drill[i].vin);
                console.log(currentVin);
                // //grab a reference to reservation
                reserveCarLocation = [
                    drill[i]
                ];
                // //pass in to my function with user location
                // keepCheckingForCloserCars(mylocation, reserveCarLocation)

                if(closestCar) {
                    infowindow.setContent(freeCars.closest.name = "The nearest car. Jackpot.");
                    infowindow.open(map, closestCarMarker);
                }

                infowindow.setContent(freeCars.cars.placemarks[i].name);
                infowindow.open(map, marker);


            }
        })(marker,i));
    }

}


    $('#reserveCarForm').off('click').click(function () { // need to call '.off('click') since ajax was firing x += 1 times on each reserve
        document.forms["reserveCarForm"]["vin"].value = currentVin; //assigning ?vin=vinNumber
        var x = currentVin;

        if (x == null || x == "" || x == -1  )  {
            alert("Please select a Car2Go");
            return false;
        }
        else {
            $.ajax({
                url: '/createBooking', //changed from intervalCheck
                data: {vin: currentVin},
                type: 'POST',
                success: function(data) {
                    console.log("THIS IS IT! SUCCESS: ", data);

                    $.ajax({
                        url: '/intervalCheck',
                        data: {
                            bookingId: data.bookingId,
                            reserveLat: data.lat,
                            reserveLng: data.lng,
                            userLat: myLatLng.lat,
                            userLng: myLatLng.lng
                        },
                        type: 'POST',
                        success: function(data) {
                            console.log("WooHoo, Made it!", data);
                            var userResponse = confirm(data.message + " " + data.address);
                            if (userResponse === true) {
                                alert("Reservation Made!");
                            } else {
                                alert("No reservation made.");
                            }
                        }
                    });
                }
            });
        }
        return false;
    });





//dummy function , which will be eventually created in the oauth service.
 function oauth_getAccesToken() {


  return "1F1kz9XHDJdwmcBQSnPudu9F";
 }


//pythagoras theorem to calculate distance
function calcDistBtwnPnts(pt1,pt2) {

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

//takes single point and array of car locations.
function getNearestCar(myLoc, cars) {

  var minIndex;
  var minDistance;
  var currentDistance;

  for (var i = 0; i < cars.length; i++) {
    //extracts car one by one to compare distance in calcDistBtwnPnts
    var carToCompare = {lat: cars[i].coordinates[1], lng: cars[i].coordinates[0]};

    // currentDistance holds square root of user lat/long & car lat/long
    currentDistance = calcDistBtwnPnts(myLoc,carToCompare);
    /*
    first iteration is ALWAYS undefined,so minDistance will be populated with first value.
    The index at first iteration will also be captured
    */
    if (minDistance == undefined) {
      minDistance = currentDistance;
      minIndex = i;
    } else {
      if (currentDistance < minDistance) {
          minDistance = currentDistance; //keep setting if finding smaller values
          minIndex = i; //as well as index
      };
    }

   };
    return minIndex;
};

//dummy location for testing
// me =
//          {
//            lat: 47.6532537,
//            lng: -122.34816690000001
//          };

//An example of a car object
// var freeCars = {
//   placemarks: [
// {
//     address: "Sturtevant Ave S 9279, 98118 Seattle",
//     coordinates: [
//     -122.34841,
//     47.65109,
//     0
//     ],
//     engineType: "CE",
//     exterior: "GOOD",
//     fuel: 48,
//     interior: "GOOD",
//     name: "AXG5026",
//     smartPhoneRequired: false,
//     vin: "WMEEJ3BA5EK780004"
//   }]
// };
