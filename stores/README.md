WorklightStore
==============

A dojo/store implementation for IBM Worklight.  It makes use of JSONStore as a native cache where possible.

The store treats the server as the master store, with the local cache only referenced if a connection to the backend is not possible.

You are free to implement "backend" Create Read Update and Delete (CRUD) methods however you like.  You could implement them as Worklight adapters, or normal XHR calls.

To use the store, do the following:

1. Create the JSONStore for the local collection, and set it on the WorklightStore so it can use it as an offline cache.  For instance, in the following code block, we create a "Transaction" collection.

```
//Worklight store is initialized
var store = new WorklightStore();

//Standard JSONStore collection creation
var collections = new Object();
collections.Transaction = new Object();
collections.Transaction.collectionName = "Transaction";
collections.Transaction.searchFields = {
		 			"fromAccount"    : "string",
		 			"toAccount"      : "string",
		 			"transactionId"   : "string"	
		 		        };
		 		
var options = new Object();
options.username = "chrisfelix82@gmail.com";
options.password = "password";
WL.JSONStore.init(collections,options).
		 		then(lang.hitch(this,function(){
		 		
		 		     //Now we set the JSONStore collection on the Worklight store
		 	             store.set("collection",WL.JSONStore.get("Transaction"));
		 			...
```

2. Now implement your backend adapter.  The adapter class should implement the <a target="_blank" href="http://dojotoolkit.org/reference-guide/1.9/dojo/store.html">dojo/store</a> interface.  The example below shows a backend adapter.
   A rejection of the deferred, will mean that the backend method failed, so the WorklightStore will attempt to run the method against the local JSONStore collection (i.e. the cache).

```

store.set("getBackend",lang.hitch(this,function(id){

	var def = new Deferred();
	//do something to get data from backend and then resolve the deferred
	...
	return def.promise;
}));
store.set("queryBackend",lang.hitch(this,function(query,options){
	var def = new Deferred();
	//do something to query data from backend and then resolve the deferred
	...
	return def.promise;			

}));

store.set("putBackend",lang.hitch(this,function(object,options){
	var def = new Deferred();
	//do something to send object updates to the backend.  If there is a conflict (i.e. 409 status code) then you should
	//reject the deferred with an errorObject = {status: 409}. This will cause the object to be removed from the local
	//JSONStore collection cache.
	...
	return def.promise;			

}));

store.set("addBackend",lang.hitch(this,function(object,options){
	var def = new Deferred();
	//do something to send new object to the backend.  If there is a conflict (i.e. 409 status code) then you should
	//reject the deferred with an errorObject = {status: 409}. This will cause the object to be removed from the local
	//JSONStore collection cache.
	...
	return def.promise;			

}));

store.set("removeBackend",lang.hitch(this,function(id){
	var def = new Deferred();
	//Do something to delete the object on the backend.  
	...
	return def.promise;			

}));


```
