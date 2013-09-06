//	Has.js feature test rules defined for Cordova API's
//--------------------------------------------------------------------
//	"cordova"					Returns true if running under Cordova, else false
//  "cordova-accelerometer"		Returns true if has accelerometer access, else false
//	"cordova-alert"				Returns true if has native alert dialog, else false
//	"cordova-android"			Returns Android OS version if running on Android, else false
//	"cordova-beep"				Returns true if can sound a device beep, else false
//	"cordova-blackberry"		Returns Blackberry OS version if running on Blackberry, else false
//  "cordova-camera"			Returns true if has camera / album access, else false
//	"cordova-capture-audio"		Returns true if has audio capture access, else false
//	"cordova-capture-image"		Returns true if has image capture access, else false
//	"cordova-capture-video"		Returns true if has video capture access, else false
//	"cordova-compass"			Returns true if has compass access, else false
//	"cordova-confirm"			Returns true if has native confirm dialog, else false
//	"cordova-connection"		Returns connection type ("ETHERNET"|"WIFI"|"CELL_2G"|"CELL_3G"|"CELL_4G"|"NONE"|"UNKNOWN"|"UNDEFINED"), else false
//	"cordova-contacts"			Returns true if has contact list access, else false
//	"cordova-device"			Returns device object if running on a device, else false
//	"cordova-file"				Returns true if has file system access, else false
//	"cordova-geolocation"		Returns true if has geolocation access, else false
//	"cordova-ios"				Returns IOS OS version if running on IOS device, else false
//	"cordova-ipad"				Returns iPad OS version if running on iPad, else false
//	"cordova-iphone"			Returns iPhone OS version if running on iPhone, else false
//	"cordova-media"				Returns true if has audio record/play access, else false
//	"cordova-platform"			Returns platform name (eg "Android") if running on a device, else false
//	"cordova-storage"			Returns true if has local database access, else false
//	"cordova-webos"				Returns WebOS OS version if running on WebOS, else false
//	"cordova-windows"			Returns Windows OS version if running on Windows, else false
//--------------------------------------------------------------------

define([
    /* TODO: Remove dependency on dojo/_base/lang (inline the lang.getObject() using private function) */
    "dojo/_base/lang",
    "dojo/has"
], function(lang, has) {

	//--------------------------------------------------------------------
	var MODULE = "dwl/has/cordova";
	//console.log("Cordova - Has setup");
	var c = {};

	c.hasTests = [
		"cordova",
		"cordova-accelerometer",
		"cordova-alert",
		"cordova-android",
		"cordova-beep",
		"cordova-blackberry",
		"cordova-camera",
		"cordova-capture-audio",
		"cordova-capture-image",
		"cordova-capture-video",
		"cordova-compass",
		"cordova-confirm",
		"cordova-connection",
		"cordova-contacts",
		"cordova-device",
		"cordova-file",
		"cordova-geolocation",
		"cordova-ios",
		"cordova-ipad",
		"cordova-iphone",
		"cordova-media",
		"cordova-platform",
		"cordova-storage",
		"cordova-webos",
		"cordova-windows"
    ],

	has.add("cordova", function() {
		var v = lang.getObject("device.cordova");
		return v ? v : false;
	});

	has.add("cordova-accelerometer", function() {
		return !!( has("cordova") && navigator.accelerometer);
	});

	has.add("cordova-camera", function() {
		return !!( has("cordova") && navigator.camera);
	});

	has.add("cordova-audio", function() {
		return !!( has("cordova") && lang.getObject("navigator.device.capture.captureAudio") );
	});

	has.add("cordova-capture-audio", function() {
		return !!( has("cordova") && lang.getObject("navigator.device.capture.captureAudio") );
	});

	has.add("cordova-capture-image", function() {
		return !!( has("cordova") && lang.getObject("navigator.device.capture.captureImage") );
	});

	has.add("cordova-capture-video", function() {
		return !!( has("cordova") && lang.getObject("navigator.device.capture.captureVideo") );
	});

	has.add("cordova-compass", function() {
		return !!( has("cordova") && navigator.compass);
	});

	has.add("cordova-connection", function() {
		var type = lang.getObject("navigator.connection.type");
		if ( has("cordova") && type ) {
			switch (type ) {
			case Connection.ETHERNET  : type = "ETHERNET"  ; break;
			case Connection.WIFI      : type = "WIFI"      ; break;
			case Connection.CELL_2G   : type = "CELL_2G"   ; break;
			case Connection.CELL_3G   : type = "CELL_3G"   ; break;
			case Connection.CELL_4G   : type = "CELL_4G"   ; break;
			case Connection.NONE      : type = "NONE"      ; break;
			case Connection.UNKNOWN   : type = "UNKNOWN"   ; break;
			default                   : type = "UNDEFINED" ; break;
			}
			return type;
		}
		return false;
	});

	has.add("cordova-contacts", function() {
		return !!( has("cordova") && lang.getObject("navigator.contacts") );
	});

	has.add("cordova-device", function() {
		var dev = window.device;
		return ( has("cordova") && dev ) ? dev : false;
	});

	has.add("cordova-platform", function() {
		var dev = has("cordova-device");
		if ( dev ) {
			//-- older cordova returns an array, newer a string.
			return dev.platform[0].length > 1 ? dev.platform[0] : dev.platform;
		}
		return null;
	});

	has.add("cordova-android", function() {
		var dev = has("cordova-device");
		var platform = has("cordova-platform");
		return (platform && platform.match(/android/i) )  ? dev.version : false;
	});

	has.add("cordova-iphone", function() {
		var dev = has("cordova-device");
		var platform = has("cordova-platform");
		return (platform && platform.match(/iphone/i) )  ? dev.version : false;
	});

	has.add("cordova-ipad", function() {
		var dev = has("cordova-device");
		var platform = has("cordova-platform");
		return(platform && platform.match(/ipad/i) )  ? dev.version : false;
	});

	has.add("cordova-ios", function() {
		return has("cordova-iphone") || has("cordova-ipad");
	});

	has.add("cordova-blackberry", function() {
		var dev = has("cordova-device");
		var platform = has("cordova-platform");
		return (platform && platform.match(/blackberry/i) ) ? dev.version : false;
	});

	has.add("cordova-windows", function() {
		var dev = has("cordova-device");
		var platform = has("cordova-platform");
		return (platform && platform.match(/win/i) )  ? dev.version : false;
	});

	has.add("cordova-webos", function() {
		var dev = has("cordova-device");
		var platform = has("cordova-platform");
		return (platform && platform.match(/webos/i) )  ? dev.version : false;
	});

	has.add("cordova-file", function() {
		return !!( has("cordova") && window.requestFileSystem );
	});

	has.add("cordova-geolocation", function() {
		return !!lang.getObject("navigator.geolocation.getCurrentPosition");
	});

	has.add("cordova-media", function() {
		return !!( has("cordova") && window.Media );
	});

	has.add("cordova-alert", function() {
		return !!( has("cordova") && lang.getObject("navigator.notification.alert") );
	});

	has.add("cordova-confirm", function() {
		return !!( has("cordova") && lang.getObject("navigator.notification.confirm") );
	});

	has.add("cordova-beep", function() {
		return !!( has("cordova") && lang.getObject("navigator.notification.beep") );
	});

	has.add("cordova-storage", function() {
		return !!( has("cordova") && window.openDatabase);
	});

	c.dumpHasTests = function() {
		var F = MODULE+".dumpHasTests(): ";
		var tests = {};
		for( var i = 0; i < c.hasTests.length; i++ ) {
			var t = c.hasTests[i];
			tests[t] = has(t);
		}
		//console.log(F, tests );
		return tests;
	};

	return c;
});
