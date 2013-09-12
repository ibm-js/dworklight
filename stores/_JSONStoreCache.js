define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/when",
        "dojo/json"],function(declare,lang,Deferred,when,JSON){
	var MODULE = "commonapp/utils/_JSONStoreCache";
	
	return declare([],{
	
		// jsonStore: WL.JSONStore
		//		The json store collection instance
		jsonStore : null,
		
		// collectionName: String
		//		The collection/resource name
		collectionName : null,
		
		// searchFields: Object
		//		The search fields to index against for lookup
		searchFields : null,
		
		// idProperty: Object
		//		The id property of store items
		idProperty : "id",
		
		constructor : function(props){
			lang.mixin(this,props);
		},
		
		init : function(name){
			// summary:
			//		Initializes a JSONStore collection
			// name: String
			//		The name of the JSONStore collection to initialize.
			var F = MODULE + ":init:";
			var def = new Deferred();
			if(this.jsonStore != null){
				console.debug("JSON store already initialized");
				def.resolve();
			}else{
				console.debug("Initializing JSONStore");
				delete this.searchFields["__parent"];//Workaround: We need to have a simple object for search fields.  __parent is added by dojox/app config.json file
				this.jsonStore = WL.JSONStore.initCollection(
						this.collectionName,
						this.searchFields,
						{load : false,	
						 onSuccess : function(result){console.debug("Initialization of JSONStore successful");def.resolve();}, 
					     onFailure : function(error){console.debug("Initialization of JSONStore failed:" + WL.JSONStore.getErrorMessage(error));def.reject(WL.JSONStore.getErrorMessage(error));}});
			}//end if
			
			return def.promise;
		},
		
		get : function(id){
			// summary:
			//		Find an object by id
			// id: Object
			//		The object to find with the given id
			var F = MODULE + ":get:";
			var def = new Deferred();
			console.debug("Getting item with id: ",id);
			var o = new Object();
			o[this.idProperty] = id;
			this.jsonStore.find(o,{onSuccess : lang.hitch(this,function(data){
				console.debug(F,"Got item from cache",data);
				if(data && data instanceof Array && data.length > 0){
					def.resolve(data[0]);
				}else {
					def.resolve(null);
				}//end if
				}), 
				onFailure : lang.hitch(this,function(error){
					def.reject(WL.JSONStore.getErrorMessage(error));})
				});
			return def.promise;
		},
		
		add : function(item){
			var def = new Deferred();
			when(this.get(item[this.idProperty]),
			lang.hitch(this,function(data){
				if(data && data.length > 0){
					console.error("Object with id already exixts.  Add is rejected");
					def.reject("Object with id already exists in cache, so cannot add this one");
				}else{
					console.debug("Adding item to cache  : " + JSON.stringify(item));
					this.jsonStore.store(item,{onSuccess : function(num){def.resolve();},
	                     		               onFailure : function(error){def.reject(WL.JSONStore.getErrorMessage(error));}});
				}//end if
			}),
			function(error){
				def.reject(error);
			}
			);
			return def.promise;
		},
		
		put : function(doc){
			var F = MODULE + ":put:";
			var def = new Deferred();
			console.debug(F,"Putting item into store",doc);
			var o = new Object();
			o[this.idProperty] = doc[this.idProperty];
			console.debug(F,"Finding item",o);
			this.jsonStore.find(o,
			{onSuccess: lang.hitch(this,function(d){
				console.debug(F,"Return array has this many items in it",d.length);
				if(d && d instanceof Array && d.length > 0){
					console.debug(F,"old doc",d[0]);
					d[0].json = doc;
					console.debug(F,"new doc",d[0]);
					this.jsonStore.replace(d[0],{onSuccess : function(num){def.resolve(num);},onFailure : function(error){def.reject(WL.JSONStore.getErrorMessage(error));}});
				}else{
					this.jsonStore.add(doc,{onSuccess : function(num){def.resolve(num);},onFailure : function(error){def.reject(WL.JSONStore.getErrorMessage(error));}});
				}//end if
			}),
			onFailure : lang.hitch(this,function(){
				this.jsonStore.add(doc,{onSuccess : function(num){def.resolve(num);},onFailure : function(error){def.reject(WL.JSONStore.getErrorMessage(error));}});
			})});
			return def.promise;
		},
		
		query : function(query){
			var def = new Deferred();
			this.jsonStore.find(query,{onSuccess : function(items){def.resolve(items);}, 
				                       onFailure : function(error){def.reject(WL.JSONStore.getErrorMessage(error));}});
			return def.promise;
		},
		
		remove : function(id){
			var def = new Deferred();
			var o = new Object();
			o[this.idProperty] = id;
			this.jsonStore.remove(o,{onSuccess : function(num){def.resolve(num);},
								     onFailure : function(error){def.reject(WL.JSONStore.getErrorMessage(error));}});
			return def.promise;
		},
		
		empty : function(){
			var def = new Deferred();
			if(this.jsonStore){
				this.jsonStore.removeCollection({onSuccess: function(){def.resolve();},
												 onFailure: function(error){def.reject(WL.JSONStore.getErrorMessage(error));}});
			}else{
				def.resolve();
			}//end if
			return def.promise;
		}
		
		
	});
});