define([
	"issw/mobile/ViewWidget",
	"dojo/text!./HybridConsoleView.html",
	
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/has",

	"dojox/mobile/Heading",
	"dojox/mobile/RoundRect",
	"issw/mobile/worklight",
	
], function(ViewWidget, template, arr, declare, lang, has) {

	return declare("issw.mobile.tests.worklight.HybridConsoleView", [ViewWidget], {
		
		//-----------------------------------------------------------------------------------------
		// Public members
		//-----------------------------------------------------------------------------------------
		templateString : template,

		//-----------------------------------------------------------------------------------------
		processConsoleMessages: function() {		
			var F = this.declaredClass + ":processConsoleMessages: ";

			var obj = {
				"myString"  : "a string",
				"myInt"     : 123,
				"myDecimal" : 123.45,
				"myBool"    : true
			};
			
			console.log(F,"Testing console logging. Output should contain; string, int, decimal, boolean, null, object, and a full combination.");
			arr.forEach(["debug", "log", "info", "warn", "error"], function(lvl) {
				console.log(F,">>>>> Testing console log level: ", lvl);
				console[lvl]("Hello string");
				console[lvl](123);
				console[lvl](123.45);
				console[lvl](true);
				console[lvl](null);
				console[lvl]( obj );
				console[lvl]( "Hello", 123, 123.45, true, null, obj );
			});
			
			if ( has("worklight") ) {
				console.log(F,"Testing Worklight logging. Output should contain; string, int, decimal, boolean, null, object, and a full combination.");
				arr.forEach(["debug", "error"], function(lvl) {
					console.log(F,"Testing worklight logger level: ", lvl);
					WL.Logger[lvl]("Hello string");
					WL.Logger[lvl](123);
					WL.Logger[lvl](123.45);
					WL.Logger[lvl](true);
					WL.Logger[lvl](null);
					WL.Logger[lvl]( obj );
					WL.Logger[lvl]( "Hello", 123, 123.45, true, null, obj );
				});
				
			} else {
				console.log(F,"Not a Worklight environment");
			}

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
		//onBeforeTransitionOut: function( targetId, dir, transition) {},
		//onBeforeTransitionIn : function( targetId, dir, transition) {},
		//onAfterTransitionOut : function( targetId, dir, transition) {},
		//onAfterTransitionIn  : function( targetId, dir, transition) {}
		//-----------------------------------------------------------------------------------------

		//-----------------------------------------------------------------------------------------
		onAfterTransitionIn: function( targetId, dir, transition) {
			// summary:
			//		When TARGET: Called AFTER ENTERING this view from another view
			var F = this.declaredClass + ":onAfterTransitionIn: ";
			//console.log(F, this.id, arguments);
			this.processConsoleMessages();
		}

	});
});

