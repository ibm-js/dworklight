define([
	"module",
   	"dojo/_base/array",
   	"dojo/_base/lang",
    "dojo/_base/window",
    "dojo/has",
    "dojo/topic",
    "dojox/mobile/ProgressIndicator"
], function(module, array, lang, win, has, topic, ProgressIndicator) {

	var MODULE = module.id;

	var a = {};
	a = {

		defaultMessage : "Loading",

		useNative   : true,

		iosOptions  : {
			"bounceAnimation" : false,
			"textColor"       : "#FFFFFF",
			"fullScreen"      : false,
			"duration"        : 0,
			"minDuration"     : 2
		},

		containerId : "",

		topics : {
	        start   : "activity/start",
	        stop    : "activity/stop"
		},

		_busy : false,

		//--------------------------------------------------------------------
		start : function( args ) {
			var F = MODULE+":start:";
			//console.log(F,"Input args:", args);
			if ( a._busy ) {
				a.stop();
			}
			if( a.useNative ) {
				var opts;
				if ( has("worklight-ios") ) {
					opts = lang.clone( a.iosOptions );
					if (lang.isString(args) ) {
						opts.text = args;
					} else {
						//-- WL is WAAAY picky about what arguments it gets
						opts.text = args.text || args.message || a.defaultMessage;
						array.forEach(["bounceAnimation", "textColor", "fullScreen", "duration", "minDuration"], function(o) {
							if ( typeof args[o] !== "undefined") {
								opts[o] = args[o];
							}
						});
					}
				} else {
					// Anything else
					opts = {
						text : lang.isString(args) ? args : (args.text || args.message || "Loading")
					};
				}
				var target = args.target || a.containerId;
				//console.log(F,"WL BusyIndicator args:", target, opts);
				a._busy = new WL.BusyIndicator( target, opts);
				a._busy.show();
			} else {
				a._busy = ProgressIndicator.getInstance();
				win.body().appendChild( a._busy.domNode );
				a._busy.start();
			}
		},

		//--------------------------------------------------------------------
		stop : function() {
			// Stop
			if (a._busy ) {
				if( a.useNative ) {
					a._busy.hide();
				} else {
					a._busy.stop();
				}
				a._busy = null;
			}
		},

	    /////////////////// PRIVATE METHODS //////////////////

	    //------------------------------------------------------------------------
	    _init : function() {
	        // summary:
	        //      Initializer.
	    	// tags:
			//	private
	        topic.subscribe( a.topics.start, a.start );
	        topic.subscribe( a.topics.stop , a.stop );
	        if( WL.mock || !has("worklight-hybrid") ) {
	        	a.useNative = false;
	        }
	    }
	};
	a._init();
	return a;
});
