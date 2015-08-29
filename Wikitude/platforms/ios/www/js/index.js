/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    // represents the device capability of launching ARchitect Worlds with specific features
    isDeviceSupported: false,
    wikitudePlugin: null, 

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    path: "www/real.html", 
    requiredFeatures: [
        "geo"
    ], 
    startupConfiguration: {
        "camera_position": "back"
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        
        console.log('on device ready ...');

        // Depending on the device, a few examples are:
        //   - "Android"
        //   - "BlackBerry 10"
        //   - "iOS"
        //   - "WinCE"
        //   - "Tizen"
        var devicePlatform = device.platform;

        console.log('Device: ' + devicePlatform);

        //if (devicePlatform == 'iOS' || devicePlatform == 'Android') {
            app.wikitudePlugin = cordova.require("com.wikitude.phonegap.WikitudePlugin.WikitudePlugin");
        //} else {
        //    console.log('I can\'t start wikititude');
        //    navigator.geolocation.getCurrentPosition(onLocationUpdated, onLocationError);
        //};
    },
    // --- Wikitude Plugin ---
    // Use this method to load a specific ARchitect World from either the local file system or a remote server
    loadARchitectWorld: function() {

        console.log('load architect world ...');

        // if (app.wikitudePlugin != null && (devicePlatform == 'iOS' || devicePlatform == 'Android')) {
            // check if the current device is able to launch ARchitect Worlds
            app.wikitudePlugin.isDeviceSupported(function() {
                app.wikitudePlugin.setOnUrlInvokeCallback(app.onUrlInvoke);
                
                // inject poi data using phonegap's GeoLocation API and inject data using World.loadPoisFromJsonData
                navigator.geolocation.getCurrentPosition(onLocationUpdated, onLocationError);
                
                app.wikitudePlugin.loadARchitectWorld(function successFn(loadedURL) {
                    /* Respond to successful world loading if you need to */ 
                    console.log('loaded architect world ' + loadedURL);
                }, function errorFn(error) {
                    alert('Loading AR web view failed: ' + error);
                },
                app.path, 
                app.requiredFeatures, 
                app.startupConfiguration
                );
            }, function(errorMessage) {
                alert(errorMessage);
            },
            app.requiredFeatures
            );
        //} else {
        //    console.log('wikitude null');
            // inject poi data using phonegap's GeoLocation API and inject data using World.loadPoisFromJsonData
        //    navigator.geolocation.getCurrentPosition(onLocationUpdated, onLocationError);
        //}
    },
    urlLauncher: function(url) {

        var world = {
            path: url, 
            requiredFeatures: [
                "2d_tracking",
                "geo"
            ],
            startupConfiguration: {
                camera_position: "back"
            },
            requiredExtension: "ObtainPoiDataFromApplicationModel"
        };
        console.log(JSON.stringify(world));

        app.loadARchitectWorld(world);
    },
    // This function gets called if you call "document.location = architectsdk://" in your ARchitect World
    onUrlInvoke: function (url) {
        if (url.indexOf('captureScreen') > -1) {
            app.wikitudePlugin.captureScreen(
                function(absoluteFilePath) {
                    alert("snapshot stored at:\n" + absoluteFilePath);
                }, 
                function (errorMessage) {
                    alert(errorMessage);                
                },
                true, null
            );
        } else {
            alert(url + "not handled");
        }
    }
    // --- End Wikitude Plugin ---
};

app.initialize();
