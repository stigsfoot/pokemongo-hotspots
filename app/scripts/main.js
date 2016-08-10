/**
*  Proj 5 : Neighborhood Map Project
*  Author: Noble Ackerson
*  main.js Pulls API data from ext services
*/

var app = app || {};

// Retrieves Foursquare lat, long and search data
app.getFoursquareResponse = function(lat, lon, searchTerm, callback) {
    'use strict';
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var json = JSON.parse(xmlhttp.response); // Set up callback
            if (json.meta.code === 200) {
                callback(json);
            } else {
                console.log("ERROR in app.getFoursquareResponse: " + json.message);
            }
        }
    };
    xmlhttp.addEventListener('error', function() {
        alert('Unable to connect with Foursquare.com.');//TODO: Use modal polyfill here
    });

    var FOURSQUARE_CLIENTID = 'AGY01VY2EHXDQOJB0QLY25IQXZKMZLHJAX3CWWPU5HYVPYPT';
    var FOURSQUARE_SECRET = 'EUKNHNC0ZQNTFWXHOW3USKLCTGEKGWF5KQQCT5OJXHIQL3SY';

    var requestString = [
        'https://api.foursquare.com/v2/venues/explore',
        '?client_id=' + FOURSQUARE_CLIENTID,
        '&client_secret=' + FOURSQUARE_SECRET,
        '&v=20130815',
        '&ll=' + lat + ',' + lon,
        '&radius=8000',
        '&query=' + searchTerm
        ].join('');
    xmlhttp.open('GET', requestString, true);
    xmlhttp.send();
};