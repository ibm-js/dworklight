//-----------------------------------------------------------------------------
// Generic JS file to establish some environment setting BEFORE dojo is loaded
//-----------------------------------------------------------------------------
// This preload stub function should not be needed for Worklight 6.5+
//-----------------------------------------------------------------------------

//-- Check url parameters
var getParam = function(name) {
	// summary:
	//		Return requested parameter if located.
	// name: String
	//		Key of argument to locate
	// Returns: String
	//		Matching parameter value
	// tags:
	//		public
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"); // JSLint:OK
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(location.href);
	results = (results ? results[1] : null);
	return results;
};

// -----------------------------------------------------------------------------
// -- Inline code
// -----------------------------------------------------------------------------

// -- Set up default device settings
var device = null;
var ua = navigator.userAgent;
if (ua.match(/android/i)) {
	device = "Android";
} else if (ua.match(/blackberry/i)) {
	device = "BlackBerry";
} else if (ua.match(/iPad/i)) {
	device = "iPad";
} else if (ua.match(/iPhone/i)) {
	device = "iphone";
} else {
	device = "webapp";
}

var deviceParam = getParam("device");
if (deviceParam) {
	switch (deviceParam.toLowerCase()) {
	case "android":
		device = "Android";
		break;
	case "bb":
		device = "BlackBerry";
		break;
	case "blackberry":
		device = "BlackBerry";
		break;
	case "custom":
		device = "Custom";
		break;
	case "ipad":
		device = "iPad";
		break;
	case "iphone":
		device = "iphone";
		break;
	}
}
//console.log("PRELOAD: Device:", device);

// ----------------------------------------------------------------------------------
// Custom worklight block that will allow very simple testing using HTTP server
// ----------------------------------------------------------------------------------
if (typeof (WL) === "undefined" || WL === null) {
	//console.warn("PRELOAD: Worklight: Creating stub WL environment for HTTP only testing");

	var servicesUrl = location.href.substring(0, location.href.indexOf("/apps/services/")+15 );
	WL = {
		mock : true,
		StaticAppProps : {
			"APP_DISPLAY_NAME": "GERS Mobile",
			"APP_SERVICES_URL": servicesUrl,
//			"APP_SERVICES_URL": "http:\/\/192.168.1.11:8080\/apps\/services\/",
			"APP_VERSION": "0.1",
			"ENVIRONMENT": "mobilewebapp",
			"HEIGHT": 460,
			"LOGIN_DISPLAY_TYPE": "embedded",
			"WIDTH": 320,
			"WORKLIGHT_ROOT_URL": servicesUrl + "api/GersMobile/mobilewebapp/"
//			"WORKLIGHT_ROOT_URL": "http:\/\/192.168.1.11:8080\/apps\/services\/api\/GersMobile\/mobilewebapp\/"
		},
		Environment : {
			PREVIEW : "preview",
			IGOOGLE : "igoogle",
			VISTA_SIDEBAR : "vista",
			OSX_DASHBOARD : "dashboard",
			IPHONE : "iphone",
			IPAD : "ipad",
			EMBEDDED : "embedded",
			FACEBOOK : "facebook",
			ADOBE_AIR : "air",
			ANDROID : "android",
			BLACKBERRY : "blackberry",
			WINDOWS_PHONE : "windowsphone",
			MOBILE_WEB : "mobilewebapp"
		},
		Logger : {
			debug : function() {
				console.debug(arguments);
			},
			error : function() {
				console.error(arguments);
			}
		},
		Client : {
			init : function() {
				document.body.style.display = "";
				wlCommonInit();
			},
			getEnvironment : function() {
				return WL.Environment.MOBILE_WEB;
			},
			createChallengeHandler : function(realm) {
				console.warn("WL Mock: createChallengeHandler(): No authentication provided for: ", realm);
				return {
					submitLoginForm : function() {
						return {};
					}
				};
			},
			isUserAuthenticated: function(realm) {
				return true;
			},
			getUserName : function(realm) {
				return "Mock User";
			},
			getUserInfo : function(realm, key) {
				return "mock data";
			},
			login : function(realm) {
				return
			},
			logout : function(realm) {
				console.warn("WL Mock: logout(): Logged out for: ", realm);
				return {};
			},
			Push : {
				subscribe : function() {
					console.log("WL Mock: Push subscription function done");
					return {};
				},
				unsubscribe : function() {
					console.log("WL Mock: Unsubscribe function done");
					return {};
				}
			}
		},
		BusyIndicator : function() {
			// This one is instantiated with new WL.BusyIndicator()
			// So just return an object to use!
			return {
				show : function() {
					console.log("WL Mock: Busy Indicator appears");
				},
				hide : function() {
					console.log("WL Mock: Busy Indicator disappears");
				},
				isVisible : function() {
					return false;
				}
				};
		},

		SimpleDialog : {
			show : function( title, body, buttons ) {
				alert(title+"\n\n"+body+"\n\nMock buttons not drawn");
			}
		}
	};
	if (typeof (Cordova) == 'undefined' || Cordova == null) {
		Cordova = {};
	}
}


