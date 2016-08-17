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

    // app.mapBounds = new google.maps.LatLngBounds(window);
    app.center = new google.maps.LatLng(38.8067193, -77.0420541); // Map data in the DC/VA/MD metro area
    app.map = app.getGMapData(document.getElementById('map')); // Setup and bind map to View
    // Use built in InfoWindow library for better perf/responsiveness
    app.infoWindow = new google.maps.InfoWindow();
    app.addPokeHotStopsToMap();

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
        //console.log('Heatmap placed, recorded and updated');
    });

    ko.applyBindings(app.viewModel); // Apply KnockoutJS model binding.

}

// Main viewModel
app.viewModel = new(function() {
    var self = this;
    // self.heatMapCluster = ko.observableArray();
    // List of hotspots to bind in HTML
    self.pokestops = ko.observableArray();
    self.showMarker = new self.pokestops();
    // Number of initial foursquare for the top banner
    // self.foursquareCount = ko.computed(function() {
    //     return self.pokestops().length;
    // });
    self.foursquareCount = ko.observable(6);

    // Bind rating
    self.fsqRating = ko.observable(app.poke);
    // Help Text
    self.helpText = ko.observable('This map starts with a default list of Pokemon hotspots. Help curate more hotspots on the map by clicking the map canvas.  Search for a place near a hotspot.');

    // Bind queries
    self.query = ko.observable('');
    self.query.subscribe(function(search) {

        if (search == '') return;
        // var mapBounds = app.map.fitBounds();
        var position = app.map.getCenter();
        app.getResponse(
            position.lat(), position.lng(),
            search,
            app.processResponse
        );
    });

    self.currentFilter = ko.observable(); // This store the filter
    // this is similar to an observable array, but
    // its elements will be selected dynamically
    self.filterLocations = ko.computed(function() {
    // if the current filter is empty, we return the whole array
    // as there's no need to filter it
   if (!self.currentFilter()) {
        // but we also make every pokestops visible
        self.pokestops().forEach(function(loc) {
            // loc.marker is the google marker object
            // it has a setVisible method
            loc.marker.setVisible(true);
        });
        // return the entire array
        return self.pokestops();
   }
    // otherwise return arrayFilter, which is a function
    // that filters an array
    return ko.utils.arrayFilter(self.pokestops(), function(loc) {
        // this function will run for every elements of self.pokestops()
        // it's similar to array.forEach
        // for more info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
        // if we return true, the location will be in the array
        // if we return false, the location WON'T be in the array

        // if location title or team contains self.currentFilter()
        if (loc.title.toLowerCase().indexOf(self.currentFilter().toLowerCase()) >= 0 ||
            loc.team.toLowerCase().indexOf(self.currentFilter().toLowerCase()) >= 0) {
            // show marker
            loc.marker.setVisible(true);
            loc.marker.setAnimation(google.maps.Animation.BOUNCE);
            // return true from arrayFilter
            // so this loc will be in filterLocations
            return true;

         } else {
            // hide the marker
            loc.marker.setVisible(false);
            // return false from arrayFilter
            // so this loc will not be in filterLocations
            return false;
        }
    });
});

    // Manage clicks on the left of the map
    self.listClick = function(location) {
        app.openInfoWindow(location);
    }
});

    // Process locations from 4SQ responses
    app.processResponse = function(json) {
        var location = app.viewModel;
        for (var i = 0;  i <  app.viewModel.pokestops().length;  i = i + 1) {

            if (location.pokestops()[i].marker.icon === POKEMON_ICON) {
                location.pokestops()[i].marker.setMap(null);
                location.pokestops.splice(i, 1);
            }
        }
        // Query foursquare API for venue data/recommendations near the current location.
        // Updated the tutorial to fit this need https://developer.foursquare.com/overview/tutorial
        var items = json.response.groups['0'].items;
        app.viewModel.foursquareCount(items.length);

        if (items.length == 0) {
            alert('I could not find "' + app.viewModel.query() + '"'); // TODO: Return html object for toast
        } else {
            for (var i = 0, max = items.length; i < max; i++){
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

    // Moves & centers map to marker position within .map div
    app.zoomTo = function(poke) {
        document.getElementById("map").focus();
        app.map.zoomTo(poke.marker.getPosition());
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
            zoom: 12,
            mapTypeControl: false,
            styles: app.styleArray,
            disableDoubleClickZoom: false
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
            rating: poke.rating,
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
        //console.log(location);
        // infoWindow should be a template that is visible=true when user clicks on item on the nav
        // infoWindow should show 4SQ Recommended venues +  controlling team in the area
        var shareUrl = 'http://www.facebook.com/sharer.php?u=https://litpokestops.firebaseapp.com';
        var fsqTitle = location.title;
        var fsqRating = location.rating;
        var team = location.team;

        var contentString = '<div class="info-card-wide mdl-card mdl-shadow--2dp">' +
            '<div class="mdl-card__title">' +
            '<h2 class="mdl-card__title-text">';
        if (fsqTitle) {
            contentString += fsqTitle;
        } else {
            contentString += 'Poke-n-Chill Hotspot';
        }
        contentString += '</h2>' +
            '</div>' +
            '<div class="mdl-card__supporting-text">';
        if (fsqRating) {
            contentString += 'This place has a <strong class="mdl-badge" data-badge="4Sq">' + fsqRating + '</strong> rating.';
        } else {
            contentString += 'This area is controlled by ' + team + ' but there are some fun things to do. Try searching for a business in this location. ';
        }

        contentString += '</div>' +
            '<div class="mdl-card__actions mdl-card--border">' +
            '<a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" href="' + shareUrl + '" target="_blank">' +
            "Share to facebook" +
            '</a>' +
            '</div>'
            /*+  '<div class="mdl-card__menu">'
            +    '<button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" onclick="window.location.href='+ shareUrl +'">'
            +      '<i class="material-icons">share</i>'
            +    '</button>'
            +  '</div>'*/
            +
            '</div>';

        app.infoWindow.setContent(contentString);
        app.infoWindow.open(app.map, location.marker);

        if (app.marker != null) {
            app.marker.setAnimation(null);
        }
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
        app.marker = location.marker;
    };



