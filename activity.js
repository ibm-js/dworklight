define([
   	"dojo/_base/array",
   	"dojo/_base/lang",
    "dojo/_base/window",
    "dojo/has",
    "dojo/topic",
    "dojox/mobile/ProgressIndicator"
], function(array, lang, win, has, topic, ProgressIndicator){

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

	    //------------------------------------------------------------------------
	    init : function( /*Map*/config ){
	        // summary:
	        //      Initializer.
	        // config: Map
	        //		Map of config settings
	        //		{
	        //			defaultMessage : "Loading...",
	        //			useNative      : true,
	        //			iosOptions     : {
			//	        	"bounceAnimation" : false,
	        //				"textColor"       : "#FFFFFF",
	        //				"fullScreen"      : false,
	        //				"duration"        : 0,
	        //				"minDuration"     : 2
	        //			},
			//	        containerId   : "someNodeId"
		    //	    }
	    	// tags:
			//		public
	    	lang.mixin(a, config);
		    if( !has("worklight-hybrid") ){
		    	a.useNative = false;
		    }
	    },

		//--------------------------------------------------------------------
		start : function( args ){
			if( a._busy ){
				a.stop();
			}
			if( a.useNative ){
				var opts;
				if ( has("worklight-ios") ){
					opts = lang.clone( a.iosOptions );
					if( lang.isString(args) ){
						opts.text = args;
					}else{
						//-- WL is WAAAY picky about what arguments it gets
						opts.text = args.text || args.message || a.defaultMessage;
						array.forEach(["bounceAnimation", "textColor", "fullScreen", "duration", "minDuration"], function(o){
							if( typeof args[o] !== "undefined"){
								opts[o] = args[o];
							}
						});
					}
				}else{
					// Anything else
					opts = {
						text : lang.isString(args) ? args : (args.text || args.message || a.defaultMessage)
					};
				}
				var target = args.target || a.containerId;
				a._busy = new WL.BusyIndicator( target, opts);
				a._busy.show();
			}else{
				a._busy = ProgressIndicator.getInstance();
				win.body().appendChild( a._busy.domNode );
				a._busy.start();
			}
		},

		//--------------------------------------------------------------------
		stop : function(){
			// Stop
			if(a._busy ){
				if( a.useNative ){
					a._busy.hide();
				}else{
					a._busy.stop();
				}
				a._busy = null;
			}
		},

	    /////////////////// PRIVATE METHODS //////////////////

	    //------------------------------------------------------------------------
	    _init : function(){
	        // summary:
	        //      Initializer.
	    	// tags:
			//	private
	        topic.subscribe( a.topics.start, a.start );
	        topic.subscribe( a.topics.stop , a.stop );
	        a.init({});
	    }
	};
	a._init();
	return a;
});
