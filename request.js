//---------------------------------------------------------------------------------
// Module: dworklight/request
//---------------------------------------------------------------------------------
require([
	"module",
    "dojo/_base/lang",
	"dojo/Deferred"
], function(module, lang, Deferred) {

	var MODULE = module.id;

	if ( ! lang.getObject("WL.Client.invokeProcedure") ) {
		console.warn(MODULE,": Worklight libraries not available. Any 'wladapter' calls will fail!");
	}

    //---------------------------------------------------------------------------------------
	function request( /*map*/ args ) {
    	var def = new Deferred();

    	if ( ! lang.getObject("WL.Client.invokeProcedure") ) {
    		var err = new Error("Worklight libraries not available. Unable to call 'WL.Client.invokeProcedure'.");
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
			    	def.reject({
			    		status      : err.status,
			    		response    : err.invocationResult,
		    			errorCode   : err.errorCode,
	    				message     : err.errorMsg,
	    				env         : err.env,
	    				isSuccessful: false
			    	});
				}
			});

    	}

        return def.promise;
    }
	return request;

});
