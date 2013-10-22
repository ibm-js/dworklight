//-------------------------------------------------------------------------
// Module: dworklight/require
//-------------------------------------------------------------------------
define([
	"module",
    "dojo/_base/lang",
    "dojo/has",

    "./features"

], function(module, lang, has ) {

	//--------------------------------------------------------------------
	var MODULE = module.id;
	//console.log("Worklight - Env setup");

	//--------------------------------------------------------------------
	var require = {

		//--------------------------------------------------------------------
		getHostUrl: function(/*bool*/ fullWebApp) {
			//	summary:
			//		Returns the Worklight server URL
			//	description:
			//		Note: The worklight server is not defined until after WL.init() has completed!
			//	fullWebApp: bool
			//		Returns the fully qualified mobilewebapp url
			var host;
			if ( has("worklight") ) {
				//-- We need to get the app name based on the api
				//-- Get the next path segment after ".../api/{appName}/...."
				//-- ex: "/api/MyApp/ipad/0/" == "MyApp"
				if ( WL.mock ) {
					host = "../mobilewebapp/";
				} else {
					// http://{host}:8080/apps/services/www/Main/mobilewebapp/
					host = WL.Client.getAppProperty(WL.AppProperty.APP_SERVICES_URL);
					if( fullWebApp ) {
						var appName = WL.Client.getAppProperty(WL.AppProperty.WORKLIGHT_ROOT_URL).match(/\/api\/([^\/]*)\/.*$/)[1];
						host += "www/" + appName + "/mobilewebapp/default/";
					}
				}
			} else {
				host = "/";
			}
			//console.debug(F,"Host:",host);
			return host;
		},

		//--------------------------------------------------------------------
		wlRequire : function( packages, modules, callback) {
			// summary:
			//		Special require loader to retrieve on demand modules from WL mobilewebapp deployment
			// description:
			//		Allows dynamic loading of dojo modules when the package name is not known at
			//		build or deployment time. It assumes that the package is at the top level of
			//		the mobilewebapp tree.
			// example:
			//	|	wlRequire( ["rapp"],
			//	|		["rapp/investment/InvestmentBijit"],
			//	|		lang.hitch(this, function(InvestmentBijit) {
			//	|			this.widget = new InvestmentBijit({}, "InvestmentViewContent");
			//	|		}
			//	|	));
			var host = null, MODULEs = [];

			packages = lang.isArray(packages) ? packages : [packages];
			modules  = lang.isArray(modules)  ? modules  : [modules];

			//-- WL defined by injected scripts at build time.
			host = this.getHostUrl(true);

			//-- build up packages array / map
			packages.forEach(function(MODULE) {
				MODULEs.push( {name:MODULE, location:host+MODULE} );
			});

			//console.log(F,"Loading modules from:",MODULEs );

			require({
				packages : MODULEs
			}, modules, callback);

		}
	};
    return require;
});
