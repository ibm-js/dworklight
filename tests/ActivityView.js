define([
	"issw/mobile/ViewWidget",
	"dojo/text!./ActivityView.html",
	
	"issw/mobile/activity",
	
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dojo/has",
	"dojox/mobile/ListItem",
	"dijit/registry",
	
	"dojox/mobile/Heading",
	"dojox/mobile/RoundRect",
	"dojox/mobile/TextBox",
	"dojox/mobile/ToolBarButton",
	
], function(ViewWidget, template, activity, arr, declare, lang, registry) {

	return declare("issw.mobile.tests.worklight.ActivityView", [ViewWidget], {
		
		//-----------------------------------------------------------------------------------------
		// Public members
		//-----------------------------------------------------------------------------------------
		templateString : template,

		//-----------------------------------------------------------------------------------------
		constructor: function( args ) {
			var F = this.declaredClass + ":constructor: ";
			console.log(F, arguments);
		},
		
		//-----------------------------------------------------------------------------------------
		postCreate: function() {		
			var F = this.declaredClass + ":postCreate: ";
			console.log(F, arguments);
			this.connect( this.dapMessageButton  ,"onClick","processMessageBusy");
			this.connect( this.dapCountdownButton,"onClick","processCountdownBusy");
		},
		
		//-----------------------------------------------------------------------------------------
		processMessageBusy: function() {		
			var F = this.declaredClass + ":processMessageBusy: ";
			var msg = this.dapText.get("value");
			console.log(F,"Starting message busy: ", msg);
			activity.start(msg);
			setTimeout( function() {
				console.log(F,"Stopping message busy");
				activity.stop();
			}, 5000);
		},
		
		//-----------------------------------------------------------------------------------------
		processCountdownBusy: function() {		
			var F = this.declaredClass + ":processCountdownBusy: ";
			var cntr = 5;
			var msg = "Countdown: " + cntr;
			console.log(F,"Starting countdown busy with:", cntr);
			activity.start(msg);
			var f = function() {
				setTimeout( function() {
					msg = "Countdown: " + cntr;
					console.log(F,"Updating countdown busy:", msg);
					activity.start(msg);
					if ( cntr-- > 0 ) {
						f();
					} else {
						activity.stop();
					}
				}, 1000);
			};
			f();
		},
		
		//-----------------------------------------------------------------------------------------	
		// The following 5 functions:
		//		onBeforeTranistionOut : Called on source view before transition
		//		onBeforeTransitionIn  : Called on target view before transition
		//		onAfterTransitionOut  : Called on source view after transition
		//		onAfterTransitionIn   : Called on target view after transition
		// may be cleanly used within a each view instance class.
		// You DO NOT need to call inherited for the base issw.mobile.View classes.
		//-----------------------------------------------------------------------------------------	

		//-----------------------------------------------------------------------------------------
		onBeforeTransitionOut: function( targetId, dir, transition) {
			// summary:
			//		When SOURCE: Called BEFORE LEAVING this view for another view 
			var F = this.declaredClass + ":onBeforeTransitionOut: ";
			console.log(F, this.id, arguments);
		},
		
		//-----------------------------------------------------------------------------------------
		onBeforeTransitionIn: function( targetId, dir, transition) {
			// summary:
			//		When TARGET: Called BEFORE ENTERING this view from another view 
			var F = this.declaredClass + ":onBeforeTransitionIn: ";
			console.log(F, this.id, arguments);
		},
		
		//-----------------------------------------------------------------------------------------
		onAfterTransitionOut: function( targetId, dir, transition) {
			// summary:
			//		When SOURCE: Called AFTER LEAVING this view for another view 
			var F = this.declaredClass + ":onAfterTransitionOut: ";
			console.log(F, this.id, arguments);
		},
				
		//-----------------------------------------------------------------------------------------
		onAfterTransitionIn: function( targetId, dir, transition) {
			// summary:
			//		When TARGET: Called AFTER ENTERING this view from another view
			var F = this.declaredClass + ":onAfterTransitionIn: ";
			console.log(F, this.id, arguments);
		},
				
		_eof:null
	});
});

