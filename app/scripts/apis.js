/**
*  Proj 5 : Neighborhood Map Project
*  Author: Noble Ackerson
*  main.js Pulls API data from ext services
*/

var app = app || {};

// Retrieves Foursquare lat, long and search data
app.getResponse = function(lat, lng, query, callback) {
    'use strict';
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState === 4) {
            var json = JSON.parse(xmlhttp.response); // Set up JSON callback
            if (json.meta.code === 200) {
                callback(json);
            } else {
                console.log("There was an issue with app.getResponse: " + json.message);
            }
        }
    };
    xmlhttp.addEventListener('error', function() {
        alert('Can not connect with Foursquare');
    });

    var FOURSQUARE_CLIENTID = '[replace with your own]';
    var FOURSQUARE_SECRET   = '[replace with your own]';
    // Search recommended and popular venues
    // (https://developer.foursquare.com/docs/venues/explore)
    var endpoint = [
        'https://api.foursquare.com/v2/venues/explore',
        '?client_id='       + FOURSQUARE_CLIENTID,
        '&client_secret='   + FOURSQUARE_SECRET,
        '&ll='  + lat + ',' + lng,
        '&v=20160810',
        '&radius=550',
        '&query=' + query
        ].join('');
    xmlhttp.open('GET', endpoint, true);
    xmlhttp.send();
};

// Error message if map does not load
app.connectionError = function() {

  alert("I'm sorry Dave, I'm afraid I can't do that! There is a connection error with Google Maps.");
};
