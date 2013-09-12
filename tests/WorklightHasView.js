define([
	"issw/mobile/ScrollableViewWidget",
	"dojo/text!./WorklightHasView.html",
	
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dojo/has",
	"dojox/mobile/ListItem",
	"issw/mobile/worklight/has",
	
	"dojox/mobile/Heading",
	"dojox/mobile/RoundRect",
	"dojox/mobile/RoundRectList",
	
], function(ScrollableViewWidget, template, arr, declare, lang, domConstruct, has, ListItem, worklight) {

	var MODULE = "issw/mobile/tests/worklight/WorklightHasView";
	
	return declare( [ScrollableViewWidget], {
		
		//-----------------------------------------------------------------------------------------
		// Public members
		//-----------------------------------------------------------------------------------------
		templateString : template,

		//-----------------------------------------------------------------------------------------
		constructor: function( args ) {
			var F = MODULE + ":constructor: ";
			console.log(F, arguments);
		},
		
		//-----------------------------------------------------------------------------------------
		postCreate: function() {		
			var F = MODULE + ":postCreate: ";
			console.log(F, arguments);
			worklight.dumpHasTests();
			
			var target = this.dapList.domNode;
            arr.forEach(worklight.hasTests, function( ht ) {
            	var result = has( ht );
                li = new ListItem({
                    "label"          : ht,
                    "rightText"      : result, 
                    "rightIcon"      : result ? "mblDomButtonCheckboxOn" : "mblDomButtonCheckboxOff",
                    "variableHeight" : true
                }, domConstruct.create("li",{},target) );
                li.startup();
            });
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
			var F = MODULE + ":onBeforeTransitionOut: ";
			console.log(F, this.id, arguments);
		},
		
		//-----------------------------------------------------------------------------------------
		onBeforeTransitionIn: function( targetId, dir, transition) {
			// summary:
			//		When TARGET: Called BEFORE ENTERING this view from another view 
			var F = MODULE + ":onBeforeTransitionIn: ";
			console.log(F, this.id, arguments);
		},
		
		//-----------------------------------------------------------------------------------------
		onAfterTransitionOut: function( targetId, dir, transition) {
			// summary:
			//		When SOURCE: Called AFTER LEAVING this view for another view 
			var F = MODULE + ":onAfterTransitionOut: ";
			console.log(F, this.id, arguments);
		},
				
		//-----------------------------------------------------------------------------------------
		onAfterTransitionIn: function( targetId, dir, transition) {
			// summary:
			//		When TARGET: Called AFTER ENTERING this view from another view
			var F = MODULE + ":onAfterTransitionIn: ";
			console.log(F, this.id, arguments);
		},
				
		_eof:null
	});
});

