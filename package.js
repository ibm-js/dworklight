var profile = (function(){
	var testResourceRe = /\/tests\//,

		copyOnly = function(filename, mid){
			var list = {
				// these are test modules that are not intended to ever be built
				"dworklight/env/preload":1,		// Normal JS file, Non AMD based
				"dworklight/package":1,
				"dworklight/package.json":1,
				"dworklight/tests":1
			};
			return (mid in list) || /^dworklight\/resources\//.test(mid) || /(png|jpg|jpeg|gif|tiff)$/.test(filename);
		};


	return {
		resourceTags:{
			test: function(filename, mid){
				return testResourceRe.test(mid);
			},

			copyOnly: function(filename, mid){
				return copyOnly(filename, mid);
			},

			amd: function(filename, mid){
				return !testResourceRe.test(mid) && !copyOnly(filename, mid) && /\.js$/.test(filename);
			}
		}
	};
})();
