/**
 *  Proj 5 : Neighborhood Map Project
 *  Author: Noble Ackerson
 *  map.js Manages Canvas items & Google Maps data
 */
var app = app || {};
var POKEMON_ICON = 'http://i1.wp.com/nintendo-papercraft.com/wp-content/uploads/2014/04/pokeball.png?resize=50%2C50';

var firebase = new Firebase("https://lit-pokestops.firebaseio.com/");




// Default DC region hotspots (pokeHotStops)for Pokemon Users
// TODO: Pull this into it's own data class
app.pokestops = [{
    title: 'Old Town, Alexandria',
    position: {
        lat: 38.8067193,
        lng: -77.0420541
    },
    icon: POKEMON_ICON
}, {
    title: 'Mount Vernon Area',
    position: {
        lat: 38.707982,
        lng: -77.0861753
    },
    icon: POKEMON_ICON
}, {
    title: 'National Harbor',
    position: {
        lat: 38.7890853,
        lng: -77.0213807
    },
    icon: POKEMON_ICON
}, {
    title: 'The White House',
    position: {
        lat: 38.8983312,
        lng: -77.0380863
    },
    icon: POKEMON_ICON
}, {
    title: 'Arlington Area',
    position: {
        lat: 38.8809263,
        lng: -77.1723677
    },
    icon: POKEMON_ICON
}];

// Customize look of canvas (https://goo.gl/NPzjqn)
app.styleArray = [{
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



// Initialize the map
function initMap() {
    'use strict';

    app.center = new google.maps.LatLng(38.8067193, -77.0420541); // Map data in the DC/VA/MD metro area
    app.map = app.getGMapData(document.getElementById('map')); // Setup and bind map to View

    app.addPokeHotStopsToMap();
    ko.applyBindings(app.viewModel); // Apply KnockoutJS model binding.

    // Create a heatmap
    app.heatmap = new google.maps.visualization.HeatmapLayer({
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


// Main KnockoutJS viewModel

app.viewModel = new (function() {
    var self = this;

    self.keyword = ko.observable('');

    // listener for user search inputs
    self.keyword.subscribe(function(result) {
        if (result == '') return;
        var position = app.map.getCenter();

        app.getFoursquareResponse(
            position.lat(), position.lng(),
            result,
            app.processFoursquareResponse
        );
    });
    // List of features to bind to panel.
    self.features = ko.observableArray();
    // Number of foursquare results to bind to input-group-addon.
    self.foursquareCount = ko.observable(0);


    self.zoomTo = function(feature) {
        // Moves/centers map to marker position
        document.getElementById("map").focus();
        app.map.zoomTo(poke.marker.getPosition());
        app.infoWindow(poke);
    };
})();

// Add markers from the list above
app.addPokeHotStopsToMap = function() {
    for (var i = 0; i < app.pokestops.length; i++) {
        app.manageMarker(app.pokestops[i]);
    };
};


// Get Google Map
app.getGMapData = function(mapDiv) {
    // Configure and add map to map div.
    var mapFeatures = {
        center: app.center,
        zoom: 12,
        mapTypeControl: false,
        styles: app.styleArray,
        disableDoubleClickZoom: true
    };
    return new google.maps.Map(mapDiv, mapFeatures);
};


// Capture marker, save in FB/show more info
app.marker = null;
app.manageMarker = function(poke, index) {
    //
    var p = poke.position;
    poke.marker = new google.maps.Marker({
        position: new google.maps.LatLng(p.lat, p.lng),
        map: app.map,
        title: poke.title,
        icon: poke.icon,
        animation: google.maps.Animation.DROP
    });

    // Add "marker" (heatmap) on user click & push to database
    google.maps.event.addListener(poke.marker, 'click', function(e) {
        // places a heatmap at stores that lat/lng to FB
        firebase.push({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        });

        // Add feature with marker to the knockoutjs observable list.
        if (index !== undefined && index / 1 == index) {
            app.viewModel.pokestops.splice(0, 0, poke);
        } else {
            app.viewModel.pokestops.push(poke);
        }
        // shows a infoWindow with restaurants/bars in the area
        app.infoWindow(poke);
    });


};

app.infoWindow = function(poke) {
    //TODO: show info for user onClick events
    //Return: Restaurant Count from 4sq,
};