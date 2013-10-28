/* jshint devel:true */
//-----------------------------------------------------------------------------
// Generic JS file to establish some environment setting BEFORE dojo is loaded
//-----------------------------------------------------------------------------
// This preload is only useful if WLv6.1+ and dojox/mobile/deviceTheme is being used.
//-----------------------------------------------------------------------------

// ----------------------------------------------------------------------------------
// Custom worklight block that will allow very simple testing using HTTP server
// ----------------------------------------------------------------------------------
window.mblConfig = window.mblConfig || {};
if ( WL && !window.mblConfig.mblUserAgent ) {

	//-- Valid ?theme=Xxx settings: Holodark, Android, BlackBerry, iPhone, iPad, WindowsPhone, Custom
	var theme = (location.search.match(/theme=(\w+)/) ? RegExp.$1 : "");

	//-- If WL Preview, derive intended proper theme.
	if ( !theme && WL.Environment.PREVIEW === WL.Client.getEnvironment() ){
		var lh = location.href;
		if      ( lh.match(/\/preview\/.*\/android\//)  ){ theme = "Holodark";     }
		else if ( lh.match(/\/preview\/.*\/iphone\//)   ){ theme = "iPhone";       }
		else if ( lh.match(/\/preview\/.*\/ipad\//)     ){ theme = "iPad";         }
		else if ( lh.match(/\/preview\/.*\/blackberry/) ){ theme = "BlackBerry";   }
		else if ( lh.match(/\/preview\/.*\/windows/)    ){ theme = "WindowsPhone"; }
	}

	if ( theme ) {
		console.log("Preload: Setting mblUserAgent to:", theme);
		window.mblConfig.mblUserAgent = theme;
	}
}

if ( window.cordova && !window.cordova.exec ) {
    // stub cordova.exec to allow for simple browser testing
    window.cordova.exec = function() {
        console.warn("Preload: Stub Cordova exec called (no-op). Arguments:", arguments);
    };
    console.warn("Preload: Stub Cordova firing artificial deviceready event");
    window.cordova.fireDocumentEvent("deviceready", {} );
}
