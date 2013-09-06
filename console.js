//-------------------------------------------------------------------------
// Module: dwl/console
//-------------------------------------------------------------------------
define([
    "dojo/_base/array",          // arr
    "dojo/_base/json",           // json
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/has",

    "./has/worklight"
], function(array, json, lang, aspect, has) {

	//--------------------------------------------------------------------
	var MODULE = "dwl/console";
	var hc = {
		_init        : false
	};

	//--------------------------------------------------------------------
	// Set up list style console output. Hybrids only output first argument :(
	if ( !hc._init ) {
		hc._init = true;

		if ( has("worklight-hybrid") ) {

			var _logProcess = function() {
				var out = [];
				array.forEach(arguments, function(item) {
					if ( lang.isString(item) || !isNaN(item) ) {
						out.push(item);
					} else if ( item === null ) {
						out.push("<null>");
					} else if ( typeof(item) === "undefined" ) {
						out.push("<undefined>");
					} else {
						try {
							out.push( json.toJson(item) );
						} catch(e) {
							out.push( item );
						}
					}
				});
				return [out.join(" ")];
			};

			aspect.before(console   , "debug"   , _logProcess);
			aspect.before(console   , "log"     , _logProcess);
			aspect.before(console   , "info"    , _logProcess);
			aspect.before(console   , "warn"    , _logProcess);
			aspect.before(console   , "error"   , _logProcess);

			if ( has("worklight") ) {
				//-- Fix brain dead WL logger to support multiple args
				aspect.before(WL.Logger , "debug"   , _logProcess);
				aspect.before(WL.Logger , "error"   , _logProcess);
			}

			if ( has("worklight-android") ) {
				//-- Redefine console to Worklight's Logger (for cleaner LogCat output)
				console.debug = WL.Logger.debug;
				console.log   = WL.Logger.debug;
				console.info  = WL.Logger.debug;
				console.warn  = WL.Logger.error;
				console.error = WL.Logger.error;
			}
			console.log("Hybrid Console - Env setup complete");
		}
	}
	return hc;
});
