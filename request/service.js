//---------------------------------------------------------------------------------
// Module: issw/mobile/worklight/service
//---------------------------------------------------------------------------------
require([
    "dojo/_base/lang",
	"dojo/_base/Deferred",
    "issw/web/service",
    "issw/mobile/logger"
], function(lang, Deferred, service, logger) {

	var MODULE = "issw/mobile/worklight/service";
	
	if ( ! lang.getObject("WL.Client.invokeProcedure") ) {
		console.warn(MODULE,": Worklight libraries not available. Any 'wladapter' calls will fail!");
	}

    //---------------------------------------------------------------------------------------
	service.wladapter = function( adapter, procedure, options ) {
    	// summary:
        //     Wrapper for Worklight Adapter call.
		// adapter: String
		//		Adapter name
		// procedure: String
		//		Procedure name
        // options: Map
        //      Map of options.
        //      See _process() function for details on other key:values.
        // Returns: Promise
        //      Deferred object from request call.  Basic error handling is applied by default
        // tags:
        //    public
    	return service._process( {type:"wladapter", adapter:adapter, procedure:procedure, options:options} );
    };
    
    //---------------------------------------------------------------------------------------
	service._invokeWLAdapter = function( /*map*/ args ) {
    	var F = MODULE + ":_invokeWLAdapter:";

    	var def = new Deferred();
    	
    	if ( ! lang.getObject("WL.Client.invokeProcedure") ) {
    		var msg = "Full Worklight libraries not available.<br/>Unable to call 'WL.Client.invokeProcedure'.";
    		var err = new Error(msg);
    		err.src = F;
	        def.reject( err );
    	} else {
    		args.options.data = args.options.data || [];
    		if ( !lang.isArray( args.options.data ) ) {
    			args.options.data = [ args.options.data ];
    		}
    		
			WL.Client.invokeProcedure({
				adapter    : args.adapter,
				procedure  : args.procedure,
				parameters : args.options.data
			},
			{
				onSuccess: function(resp) {
			    	//console.log(F,"onSuccess:", resp );
			    	def.resolve(resp.invocationResult);
				},
				onFailure: function(err) {
			    	console.log(F,"onError:", err );
			    	def.reject({
			    		status      : err.status,
			    		response    : err.invocationResult,
		    			errorCode   : err.errorCode,
	    				message     : err.errorMsg,
	    				env         : err.env,
	    				isSuccessful: false,
	    				msg         : "/var/worklightServer/logs/messages.log (No such file or directory)"
			    	});
				}
			});
    	
    	}
    	
        return def.promise;
    };
    
    //---------------------------------------------------------------------------------------
	service.typeHandlers.wladapter = service._invokeWLAdapter;

	return service;
    
});
