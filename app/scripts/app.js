/**
 *  Proj 5 : Neighborhood Map Project
 *  Author: Noble Ackerson
 *  map.js Manages Canvas items & Google Maps data
 */
var app = app || {};
var POKEMON_ICON = 'images/pokeball_50.png';
var FOURSQUARE_ICON = 'images/4sq_logo.png';


// Default DC region hotspots (pokeHotStops)for Pokemon Users
app.pokestops = [{
    title: 'Old Town',
    team: 'TEAM INSTINCT',
    position: {
        lat: 38.8067193,
        lng: -77.0420541
    },
    icon: POKEMON_ICON
}, {
    title: 'Mount Vernon',
    team: 'TEAM VALOR',
    position: {
        lat: 38.707982,
        lng: -77.0861753
    },
    icon: POKEMON_ICON
}, {
    title: 'National Harbor',
    team: 'TEAM MYSTIC',
    position: {
        lat: 38.7890853,
        lng: -77.0213807
    },
    icon: POKEMON_ICON
}, {
    title: 'White House',
    team: 'TEAM MYSTIC',
    position: {
        lat: 38.8983312,
        lng: -77.0380863
    },
    icon: POKEMON_ICON
}, {
    title: 'Herndon',
    team: 'TEAM VALOR',
    position: {
        lat: 38.957888,
        lng: -77.359920
    },
    icon: POKEMON_ICON
}, {
    title: 'Arlington',
    team: 'TEAM VALOR',
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

    app.mapBounds = new google.maps.LatLngBounds();
    app.center = new google.maps.LatLng(38.8067193, -77.0420541); // Map data in the DC/VA/MD metro area
    app.map = app.getGMapData(document.getElementById('map')); // Setup and bind map to View
    // Use built in InfoWindow library for better perf/responsiveness
    app.infoWindow = new google.maps.InfoWindow();

    app.addPokeHotStopsToMap();

    ko.applyBindings(app.viewModel); // Apply KnockoutJS model binding.

    app.firebase = new Firebase("https://lit-pokestops.firebaseio.com/"); //persist heatmap data in Firebase


    // Create a heatmap (constructor)
    app.heatmap = new google.maps.visualization.HeatmapLayer({
        data: [],
        map: app.map,
        radius: 25
    });

    app.firebase.on("child_added", function(snapshot, prevChildKey) {
        //Get latitude and longitude from Firebase.
        var newPosition = snapshot.val();
        var latLng = new google.maps.LatLng(newPosition.lat, newPosition.lng);

        app.heatmap.getData().push(latLng);
    });

    // Add "marker" (heatmap) on user click & push to database
    google.maps.event.addListener(app.map, 'click', function(e) {
        // places a heatmap at stores that lat/lng to FB
        app.firebase.push({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        });
        console.log('Heatmap placed, recorded and updated');
    });


}

// Main viewModel
app.viewModel = new(function() {
    var self = this;
    // self.heatMapCluster = ko.observableArray();
    // List of hotspots to bind in HTML
    self.pokestops = ko.observableArray();

    // Number of initial foursquare for the top banner
    self.foursquareCount = ko.computed(function() {
        var num = self.pokestops().length;
        return num;
    });

    // Moves & centers map to marker position within .map div
    self.zoomTo = function(poke) {
        document.getElementById("map").focus();
        app.map.zoomTo(poke.marker.getPosition());
    };
    // Bind rating
    self.fsqRating = ko.observable(app.poke); //TODO: Research
    // Help Text
    self.helpText =  ko.observable('This map starts with a default list of Pokemon hotspots. Clicking on an area in the map means there is Pokemon activity in this area.  Search for a place and get ideas on where to chill if the place is in a hotspot');

    // Bind queries
    self.query = ko.observable('');

    self.query.subscribe(function(search) {

        if (search == '') return;

        var mapBounds = app.map.fitBounds();
        var position = app.map.getCenter();
        app.getResponse(
            position.lat(), position.lng(),
            search,
            app.processResponse
        );
    });

    // Error handling via MDL toast message
    // TODO: Finish and use instead of alert()
    self.connectionError = function() {
        var contentString = '<div id="show-toast" class="mdl-js-snackbar mdl-snackbar">'
                            +    '<div class="mdl-snackbar__text"><h2>Unable to Connect</h2>Please check your connection</div>'
                            +'</div>';
        return contentString;
    };

    // Manage clicks on the left of the map
    self.listClick = function(location) {
        app.openInfoWindow(location);
    }

})();

// Process locations from 4SQ responses
app.processResponse = function(json) {

    for (var i = app.viewModel.pokestops().length - 1; i >= 0; i = i - 1) {
        if (app.viewModel.pokestops()[i].marker.icon === POKEMON_ICON) {
            app.viewModel.pokestops()[i].marker.setMap(null);
            app.viewModel.pokestops.splice(i, 1);
        }
    }
    // Query foursquare API for venue data/recommendations near the current location.
    // Updated the tutorial to fit this need https://developer.foursquare.com/overview/tutorial
    var items = json.response.groups['0'].items;
    app.viewModel.foursquareCount(items.length);

    if (items.length == 0) {
        alert('I could not find "' + app.viewModel.query() + '"');
    } else {
        for (var i = 0; i < items.length; i = i + 1) {
            var poke = {
                title: items[i].venue.name,
                icon: FOURSQUARE_ICON,
                rating: items[i].venue.rating,
                position: {
                    lat: items[i].venue.location.lat,
                    lng: items[i].venue.location.lng
                },
            };
            app.manageMarker(poke, 0);
        }
    }
};

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
        zoom: 11,
        mapTypeControl: false,
        styles: app.styleArray,
        disableDoubleClickZoom: true
    };

    return new google.maps.Map(mapDiv, mapFeatures);
};

// Capture marker, save in FB/show more info
app.marker = null;
app.manageMarker = function(poke, index) {
    // Drop default markers
    var p = poke.position;
    poke.marker = new google.maps.Marker({
        position: new google.maps.LatLng(p.lat, p.lng),
        map: app.map,
        title: poke.title,
        icon: poke.icon,
        animation: google.maps.Animation.DROP
    });

    // Add result with marker to the knockoutjs observable list.
    if (index !== undefined && index / 1 == index) {
        app.viewModel.pokestops.splice(0, 0, poke);
    } else {
        app.viewModel.pokestops.push(poke);
    }
    // shows a infoWindow with recommended places in the area
    google.maps.event.addListener(poke.marker, 'click', function(e) {
        app.openInfoWindow(poke);
    });
};


app.openInfoWindow = function(location) {
    console.log(location);
    // TODO: show info for user onClick events
    // infoWindow should be a template that is visible=true when user clicks on item on the nav
    // infoWindow should show 4SQ Recommended venues + (nice to have) controlling team in the area (manual)
    var shareUrl = 'http://www.facebook.com/sharer.php?u=https://lit-pokestops.firebaseapp.com';
    var contentString = '<div class="info-card-wide mdl-card mdl-shadow--2dp">'
                        +  '<div class="mdl-card__title">'
                        +    '<h2 class="mdl-card__title-text" data-bind="text: genericTitle"></h2>'
                        +  '</div>'
                        +  '<div class="mdl-card__supporting-text" data-bind="text: team">'
                        +  '</div>'
                        +  '<div class="mdl-card__actions mdl-card--border">'
                        +    '<a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" href="#" target="_blank">'
                        +      "Visit Hotspot"
                        +    '</a>'
                        +  '</div>'
                        +  '<div class="mdl-card__menu">'
                        +    '<button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" onclick="window.location.href='+ shareUrl +'">'
                        +      '<i class="material-icons">share</i>'
                        +    '</button>'
                        +  '</div>'
                        +'</div>';
    // TODO: If default card show genericTitle else show Fourscare result
    var genericTitle = "Poke-n-Chill Hotspot";
    var fsqTitle = app.pokestops.title;
    var fsqRating = app.fsqRating;
    var team = app.pokestops.team;

    app.infoWindow.setContent(contentString);
    app.infoWindow.open(app.map, location.marker);

    if (app.marker != null) {
            app.marker.setAnimation(null);
        }
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
        app.marker = location.marker;
};



