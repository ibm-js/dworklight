define([
   	"dojo/text!./ServiceView.html",
	"issw/mobile/ScrollableViewWidget",

	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/json",
	"dojo/dom-style",
	"dojo/when",
	"issw/mobile/widget/input/SimpleForm",
	"issw/mobile/widget/dialog/AlertDialog",
	"issw/web/config",
	"issw/web/service",
	
	//-- Template only modules
	"dojox/mobile/Heading",
	"dojox/mobile/RoundRect",
	
], function(template, ViewWidget, declare, lang, json, domStyle, when, SimpleForm, AlertDialog, config, service ) {

	// MODULE : String
	//		MODULEule name used in configuration and logging
	var MODULE = "issw/mobile/tests/worklight/ServicesView";

	//-- Do not define a global name, just list base class(es), and implementation object.
	return declare( [ViewWidget], {
		
		autoBack       : true,
		backLabel      : "Service",
		
		templateString : template,
		
		//-----------------------------------------------------------------------------------------
		postCreate: function() {		
			var F = MODULE + ":postCreate: ";
			console.log(F, arguments);
			
			var services = this.getWLServices();
			
			var fields = [
    			{
    				name        : "config",    
    				label       : "Config (Read-only)",
    				description : "Readonly view of service configuration (from: config.json)",
    				type        : "object",
    				inputArgs   : {
    					value    : config.get("issw/web/service"),
    					readonly : true,
    					style    : "height:140px;font-family:monospace;"
    				},
    			},
    			{
    				name        : "call",
    				label       : "Direct Service call name",
    				description : "Service names defined in the configuration.",
    				inputType   : "dojox/mobile/ComboBox",
    				inputArgs   : {
    					value   : services.length ? services[0] : "", 
    					options : services
    				}
    			},
    			{
    				name        : "adapter",
    				label       : "WL Adapter",
    				description : "Worklight Adapter name",
    				type        : "string",
    			},
    			{
    				name        : "procedure",
    				label       : "WL Procedure",
    				description : "Worklight Procedure name",
    				type        : "string",
    			},
    			{
    				name        : "data",
    				label       : "Parameters array",
    				description : "An array of value to send to adapter",
    				type        : "object",
    				inputArgs   : {
    					placeholder  : "[ 'arg1', {a:12,b:false}, true]",
    					style    : "height:60px;font-family:monospace;"
    				},
    			},
    		];        		

			this.form = new SimpleForm({
				fields   : fields,
				onSubmit : lang.hitch(this, this.makeServiceCall)
			}, this.dapForm);
		},
		
		//-----------------------------------------------------------------------------------------
		makeServiceCall: function( data ) {		
			var F = MODULE + ":makeServiceCall:";
			console.log(F, arguments);
			
			var prmoise;
			if ( data.call ) {
				//-- Make direct service call
				promise = service.call( data.call, { data:data.data, handleError:false } );
			} else {
				//-- Make a/p call
				promise = service.wladapter( data.adapter, data.procedure, data.data );
			}
			promise.then(
				function(resp) {
					console.log(F,"call success:", resp);
					var ad = new AlertDialog({
						title   : "Service Success",
						message : "<pre>" + json.toJson(resp, true) + "</pre>"
					});
				},
				function(e) {
					var ad = new AlertDialog({
						title   : "Service Error",
						message : "<div class='resultsDialogContainer'>" + json.toJson(e, true) + "</div>",
						style   : "width:500px;",
						closeButtonClass : "mblRedButton"
					});
					domStyle.set(ad.domNode, "width", "300px");
				}
			);
		},
		
		//-----------------------------------------------------------------------------------------
		getWLServices : function() {
			var F = MODULE + ":getWLServices:";
			var resp =[];
			var cfg = config.get("issw/web/service");
			for( var key in cfg.services ) {
				var svc = cfg.services[key];
				if ( svc.type == "wladapter" ) {
					resp.push(key);
				}
			}
			console.log(F, "Found WL services: ", resp);
			return resp;
		}
		
		//-----------------------------------------------------------------------------------------
		//onBeforeTransitionIn: function() {		
		//onBeforeTransitionOut: function() {		
		//onAfterTransitionIn: function() {		
		//onAfterTransitionOut: function() {		
		//-----------------------------------------------------------------------------------------

	});
});

