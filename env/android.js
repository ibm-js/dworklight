//-------------------------------------------------------------------------
// Module: dworklight/env/android
//-------------------------------------------------------------------------
define([
	"module",
    "dojo/_base/lang",
    "dojo/has",
	"dojo/query",
	"dijit/registry",
	"dojox/mobile",

    "../sniff"  // for has test support
    "../deviceReady!",
], function(module, lang, has, query, registry, dmobile) {

	//--------------------------------------------------------------------
	var MODULE = module.id;

	var a = {

		// backButtonAction : String
		//		Allow custom override of android back button
		//		"default" || unset	: Exits app (Worklight default)
		//		"view"				: Previous view (closing any dialogs/openers too)
		//		"simple"			: Closes currently open dialogs/openers OR previous view
		//		"disabled"			: Disables back button (not recommended)
		backButtonAction : "default",

		// topLevelViewIds : array
		//		Define top level view ids for back button support. Required if action set to view || simple.
		topLevelViewIds : [],

	    //------------------------------------------------------------------------
	    init : function( /*Map*/config ) {
	        // summary:
	        //      Initializer.
	        // config: Map
	        //		Map of config settings
	        //		{
	        //			backButtonAction : "default",
	        //			topLevelViews    : ["MainView","WelcomeView"]
		    //	    }
	    	// tags:
			//		public

	    	lang.mixin(a, config);

	    	//-- Add back button handler?
	    	if ( has("worklight-android") ) {
		    	if ( a.backButtonAction && (a.backButtonAction != "default") ) {
		  			//-- Handle Android back button
					document.addEventListener("backbutton", a._backButtonHandler, false);
		    	}
	    	}
	    },

		//------------------------------------------------------------------------------------
		_backButtonHandler: function (e) {
			var F = MODULE + ":_backButtonHandler: ";

			if ( a.backButtonAction == "none" ) { return; }

			try {
				if ( a.topLevelViews.indexOf( dmobile.currentView.id ) >= 0 ) {
					console.debug(F,"Closing App!");
			        WL.App && WL.App.close();
				} else {
					// Close the opened dialog(s) first one by one.
					var dialogNodes = query(".mblSimpleDialog");
					if (dialogNodes && dialogNodes.length) {
					    for (var i = 0; i < dialogNodes.length; ++i) {
    					    var dialog = registry.byId( dialogNodes[i].id );

    					    if (dialog.domNode.style.display !== "none") {
    					    	dialog.hide();
    							console.log(F, "Closing the current active dialog");
    						    if ( a.backButtonAction == "simple" ) { return; }
    					    }
					    }
					}

					// Close the opened opener(s) one by one after all the dialogs are closed.
					var openerNodes = query(".mblOpener.mblOverlay:not(.mblOverlayHidden)");
					if (openerNodes && openerNodes.length) {
					    registry.byId(openerNodes[0].id).hide();
						console.log(F, "Closing the current active opener");
						if ( a.backButtonAction == "simple" ) { return; }
					}

					// Default is to go to back.
					// backButtonAction == "view" || "simple" (no dialogs/openers)
					console.log(F, "Performing the back of the current view");
					imobile.currentView.back();
				}
			} catch (e) {
				console.error(F, "Cannot perform back operation. Error: ", e);
			}
		}

	    /////////////////// PRIVATE METHODS //////////////////

	};
	return a;
});
