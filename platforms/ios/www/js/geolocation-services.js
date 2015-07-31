/*!
 * Copyright 2014 Giuseppe Zileni
 * http://giuseppezileni.github.io
 *
 * Ionic, v1.0.0
 * http://ionicframework.com/
 *
 * By @gzileni
 *
 *
 */

//////////////////////////////////////////////
// 
// Service GeoLocation
//
//

var service = angular.module('gal.geolocation', []);

// Geolocation
service.factory('Geolocation', function ($http, _, $localstorage) {

  var location = {
      latitude: 0,
      longitude: 0,
      altitude: 0,
      accuracy: 0,
      altitudeAccuracy: 0,
      heading: 0,
      speed: 0,
      timestamp: '',
      watchID: 0
  };

  var watchID;

  var geolocation = {

    ToLL: function (north, east, utmZone) {
      return _ToLL(north, east, utmZone)
    },

    error: function (error) {
      _callback_geolocation_error(error);
    },

    get: function (callback_success, callback_error) {
      console.log('get position ...');
      navigator.geolocation.getCurrentPosition(callback_success, callback_error);
    },

    save: function (position) {
      location.latitude = position.coords.latitude;
      location.longitude = position.coords.longitude;
      location.altitude = position.coords.altitude;
      location.accuracy = position.coords.accuracy;
      location.altitudeAccuracy = position.coords.altitudeAccuracy;
      location.heading = position.coords.heading;
      location.speed = position.coords.speed;
      location.timestamp = position.timestamp;

      location.watchID = watchID;

      $localstorage.setObject('location', location);

      // console.log('Position: ' + JSON.stringify(location));
    },

    location: function () {
      var location = $localstorage.getObject('location');
      // console.log('get location about ' + location.latitude + ',' + location.longitude);
      return location;
    },

    watch: function (callback_success, callback_error) {
      
      console.log('watching position ...');
      
      var options = { 
        maximumAge: 3000, 
        timeout: 20000, 
        enableHighAccuracy: true 
      };
      
      watchID = navigator.geolocation.watchPosition(callback_success, callback_error, options);
    },

    distance: function (latitude, longitude) {

      var d = 0;

      var location = geolocation.location();

      // console.log('calculate distance about: ' + JSON.stringify(location));

      var lat1 = location.latitude;
      var lng1 = location.longitude;
      
      // console.log('check distance about: ' + JSON.stringify(position) + '-' + latitude + ',' + longitude)

      var R = 6371; // Radius of the earth in km
      var dStr = '';
      
      var dLat = _deg2rad(lat1 - latitude);  // deg2rad below
      var dLon = _deg2rad(lng1 - longitude); 
      
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(_deg2rad(latitude)) * Math.cos(_deg2rad(lat1)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
      
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      d = Math.ceil((R * c)); // Distance in km
      
      return d;
    }
  };

  return geolocation;

});


////////////////////////////////////////////////////////////////////////////////////////////
//
// ToLL - function to compute Latitude and Longitude given UTM Northing and Easting in meters
//
//  Description:
//    This member function converts input north and east coordinates
//    to the corresponding Northing and Easting values relative to the defined
//    UTM zone.  Refer to the reference in this file's header.
//
//  Parameters:
//    north   - (i) Northing (meters)
//    east    - (i) Easting (meters)
//    utmZone - (i) UTM Zone of the North and East parameters
//    lat     - (o) Latitude in degrees 
//    lon     - (o) Longitude in degrees
//
function _ToLL (north,east,utmZone)
{ 
  // This is the lambda knot value in the reference
  var LngOrigin = DegToRad(utmZone * 6 - 183)

  // The following set of class constants define characteristics of the
  // ellipsoid, as defined my the WGS84 datum.  These values need to be
  // changed if a different dataum is used.    

  var FalseNorth = 0.  // South or North?
  //if (lat < 0.) FalseNorth = 10000000.  // South or North?
  //else          FalseNorth = 0.   

  var Ecc = 0.081819190842622       // Eccentricity
  var EccSq = Ecc * Ecc
  var Ecc2Sq = EccSq / (1. - EccSq)
  var Ecc2 = Math.sqrt(Ecc2Sq)      // Secondary eccentricity
  var E1 = ( 1 - Math.sqrt(1-EccSq) ) / ( 1 + Math.sqrt(1-EccSq) )
  var E12 = E1 * E1
  var E13 = E12 * E1
  var E14 = E13 * E1

  var SemiMajor = 6378137.0         // Ellipsoidal semi-major axis (Meters)
  var FalseEast = 500000.0          // UTM East bias (Meters)
  var ScaleFactor = 0.9996          // Scale at natural origin

  // Calculate the Cassini projection parameters

  var M1 = (north - FalseNorth) / ScaleFactor
  var Mu1 = M1 / ( SemiMajor * (1 - EccSq/4.0 - 3.0*EccSq*EccSq/64.0 -
    5.0*EccSq*EccSq*EccSq/256.0) )

  var Phi1 = Mu1 + (3.0*E1/2.0 - 27.0*E13/32.0) * Math.sin(2.0*Mu1)
    + (21.0*E12/16.0 - 55.0*E14/32.0)           * Math.sin(4.0*Mu1)
    + (151.0*E13/96.0)                          * Math.sin(6.0*Mu1)
    + (1097.0*E14/512.0)                        * Math.sin(8.0*Mu1)

  var sin2phi1 = Math.sin(Phi1) * Math.sin(Phi1)
  var Rho1 = (SemiMajor * (1.0-EccSq) ) / Math.pow(1.0-EccSq*sin2phi1,1.5)
  var Nu1 = SemiMajor / Math.sqrt(1.0-EccSq*sin2phi1)

  // Compute parameters as defined in the POSC specification.  T, C and D

  var T1 = Math.tan(Phi1) * Math.tan(Phi1)
  var T12 = T1 * T1
  var C1 = Ecc2Sq * Math.cos(Phi1) * Math.cos(Phi1)
  var C12 = C1 * C1
  var D  = (east - FalseEast) / (ScaleFactor * Nu1)
  var D2 = D * D
  var D3 = D2 * D
  var D4 = D3 * D
  var D5 = D4 * D
  var D6 = D5 * D

  // Compute the Latitude and Longitude and convert to degrees
  var lat = Phi1 - Nu1*Math.tan(Phi1)/Rho1 *
    ( D2/2.0 - (5.0 + 3.0*T1 + 10.0*C1 - 4.0*C12 - 9.0*Ecc2Sq)*D4/24.0
     + (61.0 + 90.0*T1 + 298.0*C1 + 45.0*T12 - 252.0*Ecc2Sq - 3.0*C12)*D6/720.0 )

  lat = RadToDeg(lat)

  var lon = LngOrigin + 
    ( D - (1.0 + 2.0*T1 + C1)*D3/6.0
      + (5.0 - 2.0*C1 + 28.0*T1 - 3.0*C12 + 8.0*Ecc2Sq + 24.0*T12)*D5/120.0) / Math.cos(Phi1)

  lon = RadToDeg(lon)

  // Create a object to store the calculated Latitude and Longitude values
  var sendLatLon = new PC_LatLon(lat,lon)

  // Returns a PC_LatLon object
  return sendLatLon
};

function DegToRad (deg)
{
    return (deg / 180.0 * Math.PI)
}

// distance in meters 
var distance = function (lat1, lng1, lat2, lng2) {
          
  var R = 6371; // Radius of the earth in km
  var dStr = "";

  var dLat = _deg2rad(lat2-lat1);  // deg2rad below
  var dLon = _deg2rad(lng2-lng1); 

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(_deg2rad(lat1)) * Math.cos(_deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = Math.ceil((R * c) * 1000); // Distance in mt

  return d;

};

function _deg2rad(deg) {
    return deg * (Math.PI/180)
};

////////////////////////////////////////////////////////////////////////////////////////////
//
//  RadToDeg - function that inputs a value in radians and returns a value in degrees
//
function RadToDeg(value)
{
  return ( value * 180.0 / Math.PI )
};

////////////////////////////////////////////////////////////////////////////////////////////
//
// PC_LatLon - this psuedo class is used to store lat/lon values computed by the ToLL 
//  function.
//
function PC_LatLon(inLat,inLon)
{
  this.lat       = inLat     // Store Latitude in decimal degrees
  this.lon       = inLon     // Store Longitude in decimal degrees
};