/*jshint devel:true */
require(["app/core-web-layer"], function(){
    console.log("Hello World!");
	var list = [];
	for(var x in require.modules ) {
		if ( !/waitingForPlugin/.test(x) && !/^require+/.test(x) ){
			list.push( x );
		}
	}
	console.log( list.sort() );
});
