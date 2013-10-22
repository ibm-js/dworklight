require(["app/core-web-layer"], function(cwl){
    console.log("Hello World!");
var list = [];
for(var x in require.modules ) {
  list.push( x );
}
console.log( list.sort() );

});
