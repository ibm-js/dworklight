define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/when",
        "dojo/store/util/QueryResults",
        "dojo/store/util/SimpleQueryEngine",
        "dojo/store/Memory",
        "./_JSONStoreCache",
        "./_EncryptedCache"],function(declare,lang,Deferred,when,QueryResults,SimpleQueryEngine,Memory,_JSONStoreCache,_EncryptedCache){
	
	var MODULE = "commonapp/utils/WorklightStore";
	return declare([],{
		//public attributes
		
		// idProperty: String
		//		The id property of store items
		idProperty : "id",
		// queryEngine: dojo/store/util/SimpleQueryEngine
		//		This is the query engine of the store.  Simple query engine should be good enough as it is supported buy Memory and JSONStore
		queryEngine : SimpleQueryEngine,
		
		
		// resourceName: String
		//		The resource that this store does CRUD against
		resourceName : null,
		
		// adapterOptions: Object
		//		Adapter that this store synchronizes data with
		adapterOptions : {
			name   :  null,
			get    :  "get",
			query  :  "query",
			add    :  "add",
			put    :  "put",
			remove :  "remove"
		},
		
		StatusCode : {
			OK           : 200,
			CREATED      : 201,
			NO_CONTENT   : 204,
			NOT_MODIFIED : 304,
			BAD_REQUEST  : 400,
			UNAUTHORIZED : 401,
			FORBIDDEN    : 403,
			NOT_FOUND    : 404,
			CONFLICT     : 409,
			SERVER_ERROR : 500,
			UNRESPONSIVE_HOST : "UNRESPONSIVE_HOST"
		},
		
		// searchFields: Object
		//		The search fields that you can query on e.g. {"name" : "string", "id" : "string"}
		searchFields : null,
		
		
		//private attributes
		
		// _cache: Object
		//		The store that this store uses with for local data caching 
		_cache : null,
		// CacheType: Object
		//		The cache type.  One of JSON_STORE,ENCRYPTED_CACHE or MEMORY_STORE
		CacheType : {
			JSON_STORE : "JSON_STORE",
			ENCRYPTED_CACHE : "ENCRYPTED_CACHE",
			MEMORY_STORE : "MEMORY_STORE"
		},
		// _cacheType: String
		//		The cache type of this instance
		_cacheType : null,
		
		constructor : function(props){
			lang.mixin(this,props);
			if(this.adapterOptions.name == null){
				this.adapterOptions.name = this.resourceName;
			}//end if
			this._createStore();
		},
		
		//public methods
		
		get : function(id){
			// summary:
			//		Retrieves an object by its identifier, returning the object.
			// id: Object
			//		The id of the item to get from the store
			var F = MODULE + ":get:";
			console.debug(F,"Looking up latest item with id on server:", id);
			
			var def = new Deferred();
			WL.Client.invokeProcedure({
				adapter: this.adapterOptions.name,
				procedure: this.adapterOptions.get,
				parameters: [id]
			},{
				onSuccess : lang.hitch(this,function(result){this._getSuccess(result,id,def);}),
				onFailure : lang.hitch(this,function(error){this._getFailure(error,id,def);})
			});
			
			return def;
		},
		
		getIdentity : function(object){
			// summary:
			//		Returns an object‘s identity
			// object: Object
			//		The object to return the identity for
			return object[this.idProperty];
		},
		
		query : function(query,options){
			// summary:
			//		Queries the store using the provided query.
			// query: Object
			//		dojo/store/util/SimpleQueryEngine compatible query.
			// options: Object
			//		Optional. {start : Number, count : Number, sort : [{attribute : String, descending: boolean}]}
			var F = MODULE + ":query:";
			console.debug(F,"Executing query",query,"with options",options);
			var def = new Deferred();
			
			WL.Client.invokeProcedure({
				adapter: this.adapterOptions.name,
				procedure: this.adapterOptions.query,
				parameters: [query,options]
			},{
				onSuccess : lang.hitch(this,function(result){this._querySuccess(result,def);}),
				onFailure : lang.hitch(this,function(error){this._queryFailure(error,query,options,def);})
			});
			
			return QueryResults(def);
		},
		
		put : function(object,options){
			// summary:
			//		Saves the given object.
			// object: Object
			//		The object to update in the store
			// options: Object
			//		Optional. {id : string, before : Object, parent: Object, overwrite : boolean}
			var def = new Deferred();
			WL.Client.invokeProcedure({
				adapter: this.adapterOptions.name,
				procedure: this.adapterOptions.put,
				parameters: [object,options]
			},{
				onSuccess : lang.hitch(this,function(result){this._putSuccess(result,object,def);}),
				onFailure : lang.hitch(this,function(error){this._putFailure(error,object,def);})
			});
			return def;
		},
		
		add : function(object,options){
			// summary:
			//		Create a new object. 
			// object: Object
			//		The object to add to the store
			// options:
			//		(Optional) The options argument is defined the same as put() (except overwrite is assumed to be false).
			var def = new Deferred();
			WL.Client.invokeProcedure({
				adapter: this.adapterOptions.name,
				procedure: this.adapterOptions.add,
				parameters: [object,options]
			},{
				onSuccess : lang.hitch(this,function(result){this._addSuccess(result,object,def);}),
				onFailure : lang.hitch(this,function(error){this._addFailure(error,object,def);})
			});
			return def;
		},
		
		remove : function(id){
			// summary:
			//		Delete the object by id
			// id: Object
			//		The id of the obejct to delete
			
			var F = MODULE + "remove:";
			var def = new Deferred();
			WL.Client.invokeProcedure({
				adapter: this.adapterOptions.name,
				procedure: this.adapterOptions.remove,
				parameters: [id]
			},{
				onSuccess : lang.hitch(this,function(result){this._removeSuccess(result,id,def);}),
				onFailure : lang.hitch(this,function(error){this._removeFailure(error,id,def);})
			});
			return def;
		},
		
		emptyCache : function(){
			// summary:
			//		This method empties the cache
			
			var F = MODULE + ":emptyCache:";
			var def = new Deferred();
			when(this._cache.init(),
					lang.hitch(this,function(){this._cache.empty().then(function(){console.debug(F,"Success emptying the cache");def.resolve();},function(error){console.error(F,"Error emptying the cache",error);def.reject(error);});}),
					lang.hitch(this,function(e){
						console.warn(F,"Failed to initialize cache",e);
						def.reject(e);
					}));
			return def.promise;
		},
		
		//private methods
		_getSuccess : function(result,id,def){
			var F = MODULE + ":_getSuccess:";
			console.debug(F,"GET success from adapter",result);
			var statusCode = result.invocationResult.statusCode;
			var item = result.invocationResult.item;
			
			when(this._cache.init(),
			lang.hitch(this,function(){
				if( statusCode && statusCode === this.StatusCode.NOT_MODIFIED){
					console.debug(F,"A conditional GET was done, and a 304 not modified was returned.  Therefore we should return what is in cache");
					this._getFromCache(id, def);
				}else if(item){
					console.debug(F,"A new item was returned from server.  Replace the one in cache (if any)");
					when(this._cache.put(item),
					function(num){
						console.debug(F,"PUT",num,"item(s) into cache");
						def.resolve(item);
					},
					function(e){
						console.warn(F,"Failed to put item into cache.",e);
						def.resolve(item);
					}
					);
				}//end if
			}),
			lang.hitch(this,function(e){
				console.warn(F,"Failed to initialize cache",e);
				def.resolve(item);
			})
			);
		},
		_getFailure : function(error,id,def){
			var F = MODULE + ":_getFailure:";
	
			console.debug(F,"GET fail from adapter.  Attempting to return from cache.",error);
			if(error.errorCode === this.StatusCode.UNRESPONSIVE_HOST){
				console.error(F,"attempting to get from cache.  errorCode was ",error.errorCode,"statusCode was",error.statusCode);
				this._getFromCache(id, def, error);
			}else{
				console.debug(F,"Item was not found on the server.  Remove it from local cache as well");
				when(this._cache.init(),
						lang.hitch(this,function(){
							when(this._cache.remove(id),
							function(num){
								console.debug(F,"Removed",num,"items from cache matching id",id);
								def.reject(error);
							},
							function(e){
								console.warn(F,"Failed remove item with id",id,"from cache:",e);
								def.reject(error);
							}
							);
						}),		
						function(e){
							console.warn(F,"Failed to initialize cache",e);
							def.reject(error);
						});
			}//end if
			
		},
		
		_getFromCache : function(id,def,error){
			// summary:
			//		Get the item with id from the cache and resolve or reject the def with the item
			// id: Object
			//		The id of the item
			// def: dojo/Deferred
			//		The deferred to resolve or reject
			// error: Object
			//		The optional error to send to the def if rejected
			var F = MODULE + "_getFromCache:";
			when(this._cache.init(),
					lang.hitch(this,function(){
						when(this._cache.get(id),
						function(item){
							if(item){
								console.debug(F,"Found cached version of item in local cache.  Returning that.");
								def.resolve(item.json);
							}else{
								def.reject();
							}//end if
						},
						function(e){
							console.warn(F,"Failed to get item from cache as well",e);
							if(error){
								def.reject(error);
							}else{
								def.reject(e);
							}//end if
						}
						);
					}),		
					function(e){
						console.warn(F,"Failed to initialize cache",e);
						if(error){
							def.reject(error);
						}else{
							def.reject(e);
						}//end if
					}
					);
			
		},
		
		_querySuccess : function(result,def){
			//now that we have query result from server, we update the cache with PUT
			var F = MODULE + ":_querySuccess:";
			var items = result.invocationResult.items;
			when(this._cache.init(),
					lang.hitch(this,function(){
						for(var x = 0; x < items.length;x++){
							console.debug(F,"PUTing item into cache",JSON.stringify(items[x]));
							when(this._cache.put(items[x]),
									function(num){console.debug(F,"Added",num,"items to cache");},
									function(error){console.error(F,"Could not add to cache",error);});
						}//end for
						def.resolve(items);
					}),
					function(error){
						def.reject(error);
					});
		},
		_queryFailure : function(error,query,options,def){
			//Could not run query successfully on server, so query from local cache
			var F = MODULE + ":_queryFailure:";
			console.warn(F,"Failed to query server.  Query cache now");
			when(this._cache.init(),
					lang.hitch(this,function(){
						when(this._cache.query(query),
								lang.hitch(this,function(items){this._queryCacheSuccess(items,query,options,def);}),
								lang.hitch(this,function(error){this._queryCacheFailure(error,def);}));
					}),
					function(error){
						def.reject(error);
					});
		},
		
		_queryCacheSuccess : function(items,query,options,def){
			//run simple query engine on array of items.  All should match, but we take advantage of options handling
			var F = MODULE + ":_queryCacheSuccess:";
			var i = new Array();
			console.debug(F,"Items to filter",JSON.stringify(items));
			for(var x = 0; x < items.length; x++){
				i.push(items[x].json);
			}//end for
			
			var filteredItems = this.queryEngine(query, options)(i);
			def.resolve(filteredItems);
		},
		
		_queryCacheFailure : function(error,def){
			var F = MODULE + ":_queryCacheFailure:";
			console.warn(F,"Failed to query cache. Reject deferred.",error);
			def.reject(error);
		},
		
		_putSuccess : function(result,object,def){
			//The object was accepted, so put it into the cache
			when(this._cache.init(),
			lang.hitch(this,function(){
				console.debug("_putSuccess");
				when(this._cache.put(object),
				function(){
					console.debug("Success adding object to cache after successful PUT on adapter");
					def.resolve(object);
				},
				function(error){
					console.debug("Failed to add object to cache after successful PUT on adapter");
					def.resolve(object);
				});
			}),
			function(error){
				console.debug("Failed to init cache to add object to cache after successful PUT on adapter");
				def.resolve(object);
			}
			);
			
		},
		_putFailure : function(error,object,def){
			var F = MODULE + ":_putFailure:";
			when(this._cache.init(),
			lang.hitch(this,function(){
				//determine the statusCode
				if(error.errorCode === this.StatusCode.UNRESPONSIVE_HOST){
					console.debug(F,"The PUT failed due to unresponsive host.  Offline mode so keep item in cache.");
					when(this._cache.put(object),
							function(){
								console.debug("Error execting PUT against adapter that may be due to communication issues. Finished PUT into local cache.");
								def.resolve(object);
							},
							function(error){
								console.debug("Failed to add object to cache after failed PUT on adapter that may be due to communication issues");
								def.resolve(object);
							});
				}else{
					console.debug(F,"Could connect to backend service through adapter, but the backend service threw some sort of error. Removing item from cache.");
					when(this._cache.remove(object[this.idProperty]),
							function(num){
								console.debug("Removed " + num + " item(s) from cache");
								def.reject(object);
							},
							function(e){
								console.warn("Could not remove item from cache: " + e);
								def.reject(object);
							}
							);
				}//end if
			}),	
			function(e){
				console.debug("Failed to initialize cache in _putFailire" + e);
				def.reject(error);
			}
			);
		},
		
		_addSuccess : function(result,object,def){
			//The object was accepted, so put it into the cache
			//check if result has item and then that becomes object to add to cache.  Otherwise, check if object has id property, and add that to cache.
			//if neither of the above, then no op.
			
			var F = MODULE + ":_addSuccess:";
			var item = result.invocationResult.item;
			if(item && item[this.idProperty] != null){
				console.debug(F,"The service returned an item with id. PUT this object into cache.");
				object[this.idProperty] = item[this.idProperty];
			}else if(object[this.idProperty] != null){
				console.debug(F,"The service did not return an object with id, but the client side object sent has an id.  PUT this object into cache.");
			}else{
				console.warn(F,"Could not determine the id of newly added object, so cannot add to cache. Return.");
				def.resolve(object);
				return;
			}//end if
			
			when(this._cache.init(),
			lang.hitch(this,function(){
				when(this._cache.put(object),
				function(){
					console.debug("Success adding object to cache after successful ADD on adapter");
					def.resolve(object);
				},
				function(error){
					console.debug("Failed to add object to cache after successful ADD on adapter");
					def.resolve(object);
				});
			}),
			function(error){
				console.debug("Failed to init cache to add object to cache after successful ADD on adapter");
				def.resolve(object);
			}
			);
			
		},
		_addFailure : function(error,object,def){
			var F = MODULE + ":_addFailure:";
			//Check if the object has a client side provided id.  If so we can add it to the cache if there was a network error for instance.
			//If some error like a conflict occured, then we can remove the object from the cache if it has an id.
			if(object[this.idProperty] == null){
				console.debug("The object does not have a client side id, so we cannot continue with _addFailure");
				def.reject(error);
				return;
			}//end if
			
			when(this._cache.init(),
			lang.hitch(this,function(){
				//determine the statusCode
				if(error.statusCode === this.StatusCode.UNRESPONSIVE_HOST){
					console.debug("Could not connect to adapter. Offline mode.");
					when(this._cache.put(object),
							function(){
								console.debug("Error execting ADD against adapter that may be due to communication issues. Finished PUT into local cache.");
								def.resolve(object);
							},
							function(error){
								console.debug("Failed to PUT object to cache after failed ADD on adapter that may be due to communication issues");
								def.resolve(object);
							});
				}else{
					when(this._cache.remove(object[this.idProperty]),
							function(num){
								console.debug("Removed " + num + " items from cache");
								def.reject(error);
							},
							function(e){
								console.warn("Could not remove item from cache: " + e);
								def.reject(error);
							}
							);
				}//end if
			}),	
			function(e){
				console.debug("Failed to initialize cache in _putFailire" + e);
				def.reject(error);
			}
			);
		},
		
		_removeSuccess : function(result,id,def){
			var F = MODULE + ":_removeSuccess:";
			console.debug(F,"REMOVE success from adapter",result);
		
			when(this._cache.init(),
			lang.hitch(this,function(){
					console.debug(F,"Remove item from cache by id",id);
					when(this._cache.remove(id),
					function(num){
						console.debug(F,"Removed",num,"item(s) from cache");
						def.resolve(id);
					},
					function(e){
						console.warn(F,"Remove attempt on cache failed",e);
						def.resolve(id);
					}
					);
			}),
			lang.hitch(this,function(e){
				console.warn(F,"Failed to initialize cache",e);
				def.resolve(id);
			})
			);
		},
		_removeFailure : function(error,id,def){
			var F = MODULE + ":_removeFailure:";
	
			console.debug(F,"REMOVE failed on adapter.  Attempting to remove from cache",error);
			
			when(this._cache.init(),
						lang.hitch(this,function(){
							when(this._cache.remove(id),
							function(num){
								console.debug(F,"Removed",num,"items from cache matching id",id);
								def.reject(error);
							},
							function(e){
								console.warn(F,"Failed remove item with id",id,"from cache",e);
								def.reject(error);
							}
							);
						}),		
						function(e){
							console.warn(F,"Failed to initialize cache",e);
							def.reject(error);
						});
		},
		
		_createStore : function(){
			// summary:
			//		This method determines the device that the Worklight store is being used on.  
			// description:
			//		If it is one that supports JSONStore, then a JSON store will be used for local cache of data.  
			//		Otherwise encrypted cache will be used.  If WL encrypted cache is not available, a straight dojo/store/Memory store will be used.
			//		Note that a dojo/store/Memory store will NOT be encrypted.
		    var F = MODULE + ":_createStore:";
			if(typeof (WL) === 'undefined' || WL == null){
		    	console.debug(F,"Creating a dojo/store/Memory store for the _cache since WL is undefined");
		    	this._cache = new Memory({data: [],idProperty: this.idProperty});
		    	this._cacheType = this.CacheType.MEMORY_STORE;
		    }else if (WL.Client.getEnvironment() === 'iphone' || WL.Client.getEnvironment() === 'ipad' || WL.Client.getEnvironment() === 'android') {
		    	console.debug(F,"The device supports JSONStore, so using that as the _cache.  It will be initialized when first CRUD op is done");
		    	this._cache = new _JSONStoreCache({"collectionName" : this.resourceName,"idProperty" : this.idProperty,"searchFields" : this.searchFields});
		    	this._cacheType = this.CacheType.JSON_STORE;
		    }else{
		    	console.debug(F,"Worklight environment that does not support JSONStore, so use Encrypted Cache");
		    	this._cache = new _EncryptedCache();
		    	this._cacheType = this.CacheType.ENCRYPTED_CACHE;
		    }//end if
		}
		
		
		
		
		
	});

});