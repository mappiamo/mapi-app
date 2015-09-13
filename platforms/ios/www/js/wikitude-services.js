/*!
 * Copyright 2015 Giuseppe Zileni
 * http://giuseppezileni.github.io
 *
 * Ionic, v1.0.0
 * http://ionicframework.com/
 *
 * By @gzileni
 *
 *
 */
 

angular.module('wikitude.plugin', [])

.factory("$AR", function () {
	return {
		get: function () {
			return window.AR;
		},
		constant: function () {
			return window.AR.CONST
		},
		imageResource: function (image) {
			return new window.AR.ImageResource(image);
		},
		context: function () {
			return window.AR.context
		},
		geoLocation: function (lat, lng, alt) {
			return new window.AR.GeoLocation(lat, lng, alt);
		},
		imageDrawable: function (marker, num, options) {
			return new window.AR.ImageDrawable(marker, num, options);	
		},
		label: function (title, num, options) {
			return new window.AR.Label(title, num, options);
		},
		geoObject: function (marker, options) {
			return new window.AR.GeoObject(marker, options);
		},
		propertyAnimation: function (marker, text, object, num, type) {
			return new window.AR.PropertyAnimation(marker, text, object, num, type);
		},
		animationGroup: function (constant, array) {
			return new window.AR.AnimationGroup(constant, array)
		},
		logger: function (log) {
			return window.AR.logger.debug(log);
		}
	};
})

.factory("$wikitudeMarker", function (S, $AR) {
	
	var Marker = {
		
		poiData: null,
		isSelected: false,
		animationGroup_idle: null,
    	animationGroup_selected: null,
    	markerDrawable_idle: null,
    	descriptionLabel: null,
    	titleLabel: null,
    	directionIndicatorDrawable: null,
    	markerObject: null,
    	kMarker_AnimationDuration_ChangeDrawable: 500,
		kMarker_AnimationDuration_Resize: 1000,
		markerDrawable_idle: null,
		markerDrawable_selected: null,
		
		initialize: function (poiData) {

			var self = this;

			this.poiData = poiData;
			this.isSelected = false;
			this.animationGroup_idle = null;
    		this.animationGroup_selected = null;

    		// create the AR.GeoLocation from the poi data
		    var markerLocation = $AR.geoLocation(poiData.latitude, poiData.longitude, poiData.altitude);

		    // create an AR.ImageDrawable for the marker in idle state
		    this.markerDrawable_idle = $AR.imageDrawable(marker_idle, 2.5, {
		        zOrder: 0,
		        opacity: 1.0,
		        onClick: self.getOnClickTrigger(this, onclick)
		    });

		    // create an AR.ImageDrawable for the marker in selected state
		    this.markerDrawable_selected = $AR.imageDrawable(marker, 2.5, {
		        zOrder: 0,
		        opacity: 0.0,
		        onClick: null
		    });

		    var title = S(poiData.title).truncate(10).s

		    // create an AR.Label for the marker's title 
		    this.titleLabel = $AR.label(title, 1, {
		        zOrder: 1,
		        offsetY: 0.55,
		        style: {
		            textColor: '#FFFFFF',
		            fontStyle: $AR.constant().FONT_STYLE.BOLD
		        }
		    });

		    var sdescr = S(poiData.description).truncate(15).s; 

		    // create an AR.Label for the marker's description
		    this.descriptionLabel = $AR.label(sdescr, 0.8, {
		        zOrder: 1,
		        offsetY: -0.55,
		        style: {
		            textColor: '#FFFFFF'
		        }
		    });

		    this.directionIndicatorDrawable = $AR.imageDrawable(marker_directionIndicator, 0.1, {
		        enabled: false,
		        verticalAnchor: $AR.constant().VERTICAL_ANCHOR.TOP
		    });

		    this.markerObject = $AR.geoObject(markerLocation, {
		        drawables: {
		            cam: [self.markerDrawable_idle, self.markerDrawable_selected, self.titleLabel, self.descriptionLabel],
		            indicator: self.directionIndicatorDrawable
		        }
		    });
		},

		getOnClickTrigger: function(marker, callback) {

		    var self = this;

    		if (!this.isAnyAnimationRunning(marker)) {
            	if (marker.isSelected) {
                	self.setDeselected(marker);
				} else {
                	self.setSelected(marker);
                	try {
                    	callback(marker);
                	} catch (err) {
                    	console.log(err);
                	}
            	}
        	} else {
            	$AR.logger('a animation is already running');
        	};
		},

		setSelected: function(marker) {

    		marker.isSelected = true;

		    // New: 
		    if (marker.animationGroup_selected === null) {

		        // create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the idle-state-drawable
		        var hideIdleDrawableAnimation = $AR.propertyAnimation(marker.markerDrawable_idle, "opacity", null, 0.0, kMarker_AnimationDuration_ChangeDrawable);
		        // create AR.PropertyAnimation that animates the opacity to 1.0 in order to show the selected-state-drawable
		        var showSelectedDrawableAnimation = $AR.propertyAnimation(marker.markerDrawable_selected, "opacity", null, 1.0, kMarker_AnimationDuration_ChangeDrawable);

		        // create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.2
		        var idleDrawableResizeAnimation = $AR.propertyAnimation(marker.markerDrawable_idle, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
		            amplitude: 2.0
		        }));
		        // create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.2
		        var selectedDrawableResizeAnimation = $AR.propertyAnimation(marker.markerDrawable_selected, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
		            amplitude: 2.0
		        }));
		        // create AR.PropertyAnimation that animates the scaling of the title label to 1.2
		        var titleLabelResizeAnimation = $AR.propertyAnimation(marker.titleLabel, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
		            amplitude: 2.0
		        }));
		        // create AR.PropertyAnimation that animates the scaling of the description label to 1.2
		        var descriptionLabelResizeAnimation = $AR.propertyAnimation(marker.descriptionLabel, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
		            amplitude: 2.0
		        }));

		        marker.animationGroup_selected = $AR.animationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [hideIdleDrawableAnimation, showSelectedDrawableAnimation, idleDrawableResizeAnimation, selectedDrawableResizeAnimation, titleLabelResizeAnimation, descriptionLabelResizeAnimation]);
		    }

		    // removes function that is set on the onClick trigger of the idle-state marker
		    marker.markerDrawable_idle.onClick = null;
		    // sets the click trigger function for the selected state marker
		    marker.markerDrawable_selected.onClick = this.getOnClickTrigger(marker);

		    // enables the direction indicator drawable for the current marker
		    marker.directionIndicatorDrawable.enabled = true;
		    // starts the selected-state animation
		    marker.animationGroup_selected.start();
		},

		setDeselected: function(marker) {

    		marker.isSelected = false;

		    if (marker.animationGroup_idle === null) {

		        // create AR.PropertyAnimation that animates the opacity to 1.0 in order to show the idle-state-drawable
		        var showIdleDrawableAnimation = $AR.propertyAnimation(marker.markerDrawable_idle, "opacity", null, 1.0, kMarker_AnimationDuration_ChangeDrawable);
		        // create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the selected-state-drawable
		        var hideSelectedDrawableAnimation = $AR.propertyAnimation(marker.markerDrawable_selected, "opacity", null, 0, kMarker_AnimationDuration_ChangeDrawable);
		        // create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.0
		        var idleDrawableResizeAnimation = $AR.propertyAnimation(marker.markerDrawable_idle, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
		            amplitude: 2.0
		        }));
		        // create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.0
		        var selectedDrawableResizeAnimation = $AR.propertyAnimation(marker.markerDrawable_selected, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
		            amplitude: 2.0
		        }));
		        // create AR.PropertyAnimation that animates the scaling of the title label to 1.0
		        var titleLabelResizeAnimation = $AR.propertyAnimation(marker.titleLabel, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
		            amplitude: 2.0
		        }));
		        // create AR.PropertyAnimation that animates the scaling of the description label to 1.0
		        var descriptionLabelResizeAnimation = $AR.propertyAnimation(marker.descriptionLabel, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
		            amplitude: 2.0
		        }));

		        marker.animationGroup_idle = $AR.animationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [showIdleDrawableAnimation, hideSelectedDrawableAnimation, idleDrawableResizeAnimation, selectedDrawableResizeAnimation, titleLabelResizeAnimation, descriptionLabelResizeAnimation]);
		    }

		    // sets the click trigger function for the idle state marker
		    marker.markerDrawable_idle.onClick = this.getOnClickTrigger(marker);
		    // removes function that is set on the onClick trigger of the selected-state marker
		    marker.markerDrawable_selected.onClick = null;

		    // disables the direction indicator drawable for the current marker
		    marker.directionIndicatorDrawable.enabled = false;
		    // starts the idle-state animation
		    marker.animationGroup_idle.start();
		},

		isAnyAnimationRunning: function(marker) {

		    if (marker.animationGroup_idle === null || marker.animationGroup_selected === null) {
		        return false;
		    } else {
		        if ((marker.animationGroup_idle.isRunning() === true) || (marker.animationGroup_selected.isRunning() === true)) {
		            return true;
		        } else {
		            return false;
		        }
		    }
		}
	};

	return Marker;
})

.factory("$wikitudeWorld", function ($wikitudeMarker, Gal, _) {

	// implementation of AR-Experience (aka "World")
	var World = {
		// you may request new data from server periodically, however: in this sample data is only requested once
		isRequestingData: false,

		// true once data was fetched
		initiallyLoadedData: false,

		// different POI-Marker assets
		markerDrawable_idle: null,
		markerDrawable_selected: null,
		markerDrawable_directionIndicator: null,

		// list of AR.GeoObjects that are currently shown in the scene / World
		markerList: [],

		// The last selected marker
		currentMarker: null,

		// called to inject new POI data
		load: function (poiData, done) {

			console.log('load World ... init ');
			
			// empty list of visible markers
			World.markerList = [];

			// Start loading marker assets:
			// Create an AR.ImageResource for the marker idle-image
			World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
			// Create an AR.ImageResource for the marker selected-image
			World.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
			// Create an AR.ImageResource referencing the image that should be displayed for a direction indicator. 
			World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

			// loop through POI-information and create an AR.GeoObject (=Marker) per POI
			for (var currentPlaceNr = 0; currentPlaceNr < poiData.length; currentPlaceNr++) {
				var singlePoi = {
					"id": poiData[currentPlaceNr].id,
					"content": poiData[currentPlaceNr].content,
					"category": poiData[currentPlaceNr].category,
					"latitude": parseFloat(poiData[currentPlaceNr].latitude),
					"longitude": parseFloat(poiData[currentPlaceNr].longitude),
					"altitude": parseFloat(poiData[currentPlaceNr].altitude),
					"title": poiData[currentPlaceNr].title,
					"description": poiData[currentPlaceNr].description
				};

				console.log('load World ... add marker ');
				World.markerList.push($wikitudeMarker.initialize(singlePoi));
			}

			var msg = currentPlaceNr + ' places loaded';

			console.log(msg);

			done(msg);
		},	

		// location updates, fired every time you call architectView.setLocation() in native environment
		_locationChanged: function (lat, lon, alt, acc) {

			console.log('_locationChanged');
			
			if (!World.initiallyLoadedData) {
				World.request(lat, lon);
				World.initiallyLoadedData = true;
			}
		},

		// fired when user pressed maker in cam
		onMarkerSelected: function (marker) {

			// deselect previous marker
			if (World.currentMarker) {
				if (World.currentMarker.poiData.id == marker.poiData.id) {
					return;
				}
				World.currentMarker.setDeselected(World.currentMarker);
			}

			// highlight current one
			marker.setSelected(marker);
			World.currentMarker = marker;
		},

		// screen was clicked but no geo-object was hit
		onScreenClick: function () {
			console.log('onScreenClick');
			if (World.currentMarker) {
				World.currentMarker.setDeselected(World.currentMarker);
			}
		},

		// request POI data
		request: function (centerPointLatitude, centerPointLongitude) {
			
			var poisToCreate = 20;
			var poiData = [];

			for (var i = 0; i < poisToCreate; i++) {
				poiData.push({
					"id": (i + 1),
					"longitude": (centerPointLongitude + (Math.random() / 5 - 0.1)),
					"latitude": (centerPointLatitude + (Math.random() / 5 - 0.1)),
					"description": ("This is the description of POI#" + (i + 1)),
					// use this value to ignore altitude information in general - marker will always be on user-level
					"altitude": 0,
					"name": ("POI#" + (i + 1))
				});
			};

			World.load(poiData);

			/*
			Gal.poi_latlng(function (err, data) {
				var poiData = _.find(data, function (item) {
					return item.latitude == centerPointLatitude &&
						   item.longitude == centerPointLongitude
				});
				console.log('founded n.' + _.size(poiData) + ' by ' + centerPointLatitude + ',' + centerPointLongitude);
				World.load(poiData);	
			});
			*/
		},

		initialize: function () {
			console.log('initialize World: onLocationChanged');
			
			$AR.context().onLocationChanged = World._locationChanged;

			console.log('initialize World: onScreenClick');
			
			$AR.context().onScreenClick = World.onScreenClick;
			
			console.log('initialize World Ok.');
		}

	};

	return World;

})

.factory("$wikitude", function ($ionicPlatform, $wikitudeMarkerJS, Geolocation, Gal, async, $AR) {
		
	var wikitude_json = {

		wobj: null,
	    
	    arExperienceUrl: 'www/templates/poi-real-camera.html',
	    
	    requiredFeatures: [ '2d_tracking', 'geo' ],
	    
	    startupConfiguration: {
	        camera_position: 'back'
	    },

	    location: {
	    	latitude: 0,
	    	longitude: 0
	    },

	    markerDrawable_idle: null,
		// Create an AR.ImageResource for the marker selected-image
		markerDrawable_selected: null,
		// Create an AR.ImageResource referencing the image that should be displayed for a direction indicator. 
		markerDrawable_directionIndicator: null,
	    
	    currentMarker: null, 

	    start: function() {
	    	console.log('wikitude initializing...');
	    	$ionicPlatform.ready(function() {
	    		
	    		wikitude_json.wobj = cordova.require('com.wikitude.phonegap.WikitudePlugin.WikitudePlugin');
	    		wikitude_json.wobj.isDeviceSupported(wikitude_json.onDeviceSupported, 
	    										wikitude_json.onDeviceNotSupported, 
	    										wikitude_json.requiredFeatures);
	    		console.log('wikitude initialized Ok...');
	    	});
	    },

	    onDeviceSupported: function() {
	    	console.log('wikitude device supported checking ...');
        
        	// wikitude_json.wobj._onARchitectWorldLaunchedCallback = wikitude_json.onARchitectWorldLaunched;
        	// wikitude_json.wobj._onARchitectWorldFailedLaunchingCallback = wikitude_json.onARchitectWorldFailedLaunching;

        	wikitude_json.wobj.setOnUrlInvokeCallback(wikitude_json.onURLInvoked);

        	// load an ARchitect World
        	wikitude_json.wobj.loadARchitectWorld(function () {
        		console.log('Wikitude Loaded Successful OK: ');
        		wikitude_json.startWorld();
        	}, function (errMsg) {
        		console.log('Error: wikitude Failed Launching.: ' + errorMgs)
        	}, 
        	wikitude_json.arExperienceUrl, 
            wikitude_json.requiredFeatures, 
            wikitude_json.startupConfiguration);
        	
        	console.log('wikitude device supported check OK.');
        	// wikitude_json.startWorld();
    	},

    	startWorld: function () {
    		console.log('starting initialize World ...');

    		wikitude_json.markerDrawable_idle = $AR.imageResource("assets/marker_idle.png"),
			// Create an AR.ImageResource for the marker selected-image
			wikitude_json.markerDrawable_selected = $AR.imageResource("assets/marker_selected.png"),
			// Create an AR.ImageResource referencing the image that should be displayed for a direction indicator. 
			wikitude_json.markerDrawable_directionIndicator = $AR.imageResource("assets/indi.png"),
	    	
	    	console.log('initialize World step 1 ...');

			/* 
				Set a custom function where location changes are forwarded to. There is also a possibility to set AR.context.onLocationChanged to null. In this case the function will not be called anymore and no further location updates will be received. 
			*/
			$AR.context.onLocationChanged = wikitude_json.locationChanged;

			console.log('initialize World step 2 ...');
			/*
				To detect clicks where no drawable was hit set a custom function on AR.context.onScreenClick where the currently selected marker is deselected.
			*/
			$AR.context.onScreenClick = wikitude_json.onScreenClick;

			console.log('finished initialize World ...');

    	},

    	onDeviceNotSupported: function() {
        	// ... code that is executed if the device is not supported ...
    		console.log('Error: wikitude not supported.')
    	},

    	onARchitectWorldFailedLaunching: function(errorMgs) {
    		console.log('Error: wikitude Failed Launching.: ' + errorMgs)
    	},

    	markers: [],
    	initiallyLoadedData: false,

    	onScreenClick: function () {

    		var self = this;

    		if (this.currentMarker) {
				self.currentMarker.setDeselected(self.currentMarker);
			};

    	},

    	onLocationChanged: function (lat, lon, alt, acc) {
    		
    		var self = this;

    		if (this.initiallyLoadedData) {
				
				Gal.poi_latlng(function (err, pois_data) {
					console.log('get data POIs Ok.');
					
					async.each(pois_data, function (poi, callback) {
						self.markers.push($wikitudeMarkerJS.create(poi));
						callback();
					}, function (err) {
						console.log('done add markers to wikitude');
					});

				});

				this.initiallyLoadedData = true;
			};

    	},
    	
		onUrlInvoke: function (url) {
			console.log('Wikitude AR => PhoneGap ' + url);
    	}
	};
	
	return wikitude_json;
		
});