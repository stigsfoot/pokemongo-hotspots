
var firebase = new Firebase("https://lit-pokestops.firebaseio.com/");

// Initialize the map
function initMap() {

    var styleArray = [{
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [{
            "saturation": 36
        }, {
            "color": "#000000"
        }, {
            "lightness": 40
        }]
    }, {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [{
            "visibility": "on"
        }, {
            "color": "#000000"
        }, {
            "lightness": 16
        }]
    }, {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 20
        }]
    }, {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 17
        }, {
            "weight": 1.2
        }]
    }, {
        "featureType": "administrative.locality",
        "elementType": "all",
        "stylers": [{
            "visibility": "off"
        }, {
            "invert_lightness": true
        }]
    }, {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 20
        }]
    }, {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 21
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 17
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 29
        }, {
            "weight": 0.2
        }]
    }, {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 18
        }]
    }, {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 16
        }]
    }, {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 19
        }]
    }, {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{
            "color": "#000000"
        }, {
            "lightness": 17
        }]
    }];


    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 38.8067193,
            lng: -77.0420541
        },
        zoom: 12,
        styles: styleArray,
        mapTypeControl: false,
        disableDoubleClickZoom: true
    });

    // Add "marker" (heatmap) on user click & push to database
    map.addListener('click', function(e) {
      firebase.push({lat: e.latLng.lat(), lng: e.latLng.lng()});
    });

    // Currently not being used but will dynamically populate eventually
    var image = {
      url: 'http://i1.wp.com/nintendo-papercraft.com/wp-content/uploads/2014/04/pokeball.png?resize=50%2C50',
      // This marker is 50 pixels wide by 50 pixels high.
      size: new google.maps.Size(50, 50),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 32)
    };


    // Create a heatmap.
    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: [],
      map: map,
      radius: 25
    });


    firebase.on("child_added", function(snapshot, prevChildKey) {
    // Get latitude and longitude from Firebase.
      var newPosition = snapshot.val();

      // Create a google.maps.LatLng object for the position of the marker.
      // A LatLng object literal (as above) could be used, but the heatmap
      // in the next step requires a google.maps.LatLng object.
      var latLng = new google.maps.LatLng(newPosition.lat, newPosition.lng);

      heatmap.getData().push(latLng);
    });


}