
var map; //maps is created in initMap func
var freeCars; //called in httpGetAsync();
var myLatLng; //location is generated in getUserGeoLocation() which is called from initMap
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

        // After user location is determined, get all the cars to plot
        getCarsAsync();

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

function getCarsAsync() {

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

    $('#reserveCarForm').off('click').click(function () { // need to call '.off('click')' since ajax was increment binding additional clicks, x += 1
        document.forms["reserveCarForm"]["vin"].value = currentVin; //assigning ?vin=vinNumber

        if (currentVin == null || currentVin == "" || currentVin == -1  )  {
            alert("Please select a Car2Go");
            return false;
        }
        else {
            reserveCar2Go(currentVin);
        }
        return false;
    });

function reserveCar2Go(vinNumber) {
    $.ajax({
        url: '/createBooking', //changed from intervalCheck
        data: {vin: vinNumber},
        type: 'POST',
        success: function(data) {
            console.log("createBooking Success!: ", data);

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
                    console.log(data.message, data);
                    var userResponse = confirm(data.message + " " + data.address);
                    var newVin = data.vin;
                    if (userResponse === true) {

                        reserveCar2Go(newVin);
                        //// Perhaps make a function for this call instead of another ajax call
                        //$.ajax({
                        //    url: '/createBooking', //changed from intervalCheck
                        //    data: {vin: newVin},
                        //    type: 'POST',
                        //    success: function(data) {
                        //        console.log("Reserve Made! ", data);
                        //        alert("Reservation Made!");
                        //    }
                        //});

                    } else {
                        alert("No reservation made.");
                    }
                }
            });
        }
    });
};


// Car Object Example
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
