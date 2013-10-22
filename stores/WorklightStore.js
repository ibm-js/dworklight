define([
        "module",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/when",
        "dojo/Deferred",
        "dojo/Stateful",
        "dojo/store/util/SimpleQueryEngine",
        "dojo/store/util/QueryResults"
        ],function(module,declare,lang,when,Deferred,Stateful,SimpleQueryEngine,QueryResults){

	var MODULE = module.id;
	return declare([Stateful],{
		/**
		 * @memberOf WorklightStore
		 */


		// summary:
		//		Implements the dojo/store API, and maintains a local collection (e.g. cache) of objects via the WL.JSONStore


		// collection: Object
		//		The collection that this store represents.  Gotten from WL.JSONStore.get(collectionName)
		collection: null,

		// idProperty: String
		//		The id property of the store.  This will be used to documentify objects, per the WL.JSONStore.documentify method
		//		The default value is "id".
		idProperty: "id",

		// queryEngine: dojo/store/util/SimpleQueryEngine
		//		This is the query engine of the store.
		queryEngine : SimpleQueryEngine,

		// getBackend: function
		//		A pointer to the function used to get and object from the backend
		getBackend : null,

		// queryBackend: function
		//		A pointer to the function used to query the backend for items
		queryBackend : null,

		// addBackend: function
		//		A pointer to the function used to add an object to the backend
		addBackend : null,

		// putBackend: function
		//		A pointer to the function used to update an object on the backend
		putBackend : null,

		// removeBackend: function
		//		A pointer to the function used to remove an object from the backend
		removeBackend : null,

		constructor : function(args){
			lang.mixin(this,args);
		},

		get : function(id){
			// summary:
			//		Gets the entity with the given id.
			// description:
			//		This method first calls the backend method (if set) to get the object. If not, then local collection
			//		is always used.

			var F = MODULE + ":get:";
			console.debug(F,"Enter");
			var def = new Deferred();
			if(!this.collection){
				console.warn(F,"The JSONStore collection is not set on this instance of WorklightStore.  Returning null. Please set the collection via this.set('collection',WL.JSONStore.get(collectioName))");
				def.resolve(null);
				console.debug(F,"Exit");
				return def.promise;
			}//end if

			if(this.getBackend){
				 console.debug(F,"Call getBackend method to get the object from the backend by id",id);

				 when(this.getBackend(id),
						 lang.hitch(this,function(o){this._getBackendSuccess(o,id,def);}),
						 lang.hitch(this,function(errorObject){this._getBackendFail(errorObject,id,def);}));
			}else{
				console.warn(F,"The getBackend method is not defined.  Try to get object from collection.");
				this._getLocal(id, def);
			}//end if

			console.debug(F,"Exit");
		    return def.promise;
		},

		query : function(query,options){
			// summary:
			//		Queries the store using the provided query.
			// query: Object
			//		dojo/store/util/SimpleQueryEngine compatible query.
			// options: Object
			//		Optional. {start : Number, count : Number, sort : [{attribute : String, descending: boolean}]}

			var F = MODULE + ":query:";
			console.debug(F,"Enter");
			var def = new Deferred();
			if(!this.collection){
				console.warn(F,"The JSONStore collection is not set on this instance of WorklightStore.  Returning empty array. Please set the collection via this.set('collection',WL.JSONStore.get(collectioName))");
				def.resolve([]);//TODO: format of error object from JSONStore;
				console.debug(F,"Exit");
				return def.promise;
			}//end if

			if(this.queryBackend){
				console.debug(F,"Call the backend query method");
				when(this.queryBackend(query,options),
						lang.hitch(this,function(list){this._queryBackendSuccess(list,query,options,def);}),
						lang.hitch(this,function(errorObject){this._queryBackendFail(errorObject,query,options,def);}));
			}else{
				console.debug(F,'There is no backend query function set. You can set one with this.set("queryBackend",method);');
			}//end if

			console.debug(F,"Exit");
			return QueryResults(def);
		},

		add : function(object,options){
			// summary:
			//		Used to add an item to the collection
			// object: Object
			//		The obejct to add to the collection
			//  options: Object
			//		The options object

			var F = MODULE + ":add:";
			console.debug(F,"Enter");
			var def = new Deferred();

			if(!this.collection){
				console.error(F,"The JSONStore collection is not set on this instance of WorklightStore. No op. Please set the collection via this.set('collection',WL.JSONStore.get(collectioName))");
				def.reject();
				console.debug(F,"Exit");
				return def.promise;
			}//end if
			//this.collection.removeCollection();
			if(this.addBackend){
				console.debug(F,"The backend add method is defined.  Call it in order to send the object to the backend store");
				when(this.addBackend(object,options),
						lang.hitch(this,function(updatedObject){this._addBackendSuccess(updatedObject,options,def);}),
						lang.hitch(this,function(errorObject){this._addBackendFail(object,options,def);}));
			}else{
				console.debug(F,"The backend add method is not defined.  Trying to add the item directly to local collection");
				this._addLocal(object, def,false);//do not mark the item for push since there is no addBackend method i.e. last param false
			}//end if

		    return def.promise;
			console.debug(F,"Exit");
		},

		put : function(object,options){
			// summary:
			//		This method is used to update an item in the store
			// object: Object
			//		The dojo store item to update
			// options: Object
			//		The update options

			var F = MODULE + ":put:";
			console.debug(F,"Enter");
			var def = new Deferred();

			if(!this.collection){
				console.error(F,"The JSONStore collection is not set on this instance of WorklightStore. No op. Please set the collection via this.set('collection',WL.JSONStore.get(collectioName))");
				def.reject();
				console.debug(F,"Exit");
				return def.promise;
			}//end if

			if(this.putBackend){
				console.debug(F,"put backend method is defined.  Call it to update the object on the backend");
				when(this.putBackend(object,options),
						lang.hitch(this,function(updatedObject){this._putBackendSuccess(updatedObject,options,def);}),
						lang.hitch(this,function(errorObject){this._putBackendFail(object,options,def);}));
			}else{
				console.debug(F,"There is no put backend method defined.  Trying to update the object in the local collection");
				this._replaceLocal(object,def,true,true);//needs an id and you should push the change to the backend
			}//end if
			console.debug(F,"Exit");
			return def.promise;
		},

		remove : function(id){
			// summary:
			//		Used to remove an item from the store by id
			// id: SimpleType

			var F = MODULE + ":remove:";
			console.debug(F,"Enter");
			var def = new Deferred();
			if(!this.collection){
				console.error(F,"The JSONStore collection is not set on this instance of WorklightStore. No op. Please set the collection via this.set('collection',WL.JSONStore.get(collectioName))");
				def.reject();
				console.debug(F,"Exit");
				return def.promise;
			}//end if

			if(this.removeBackend){
				console.debug(F,"Calling the backend remove method for item with store id=",id);
				when(this.removeBackend(id),
						lang.hitch(this,function(){this._removeBackendSuccess(id,def);}),
						lang.hitch(this,function(errorObject){this._removeBackendFail(id,def);}));
			}else{
				console.debug(F,"Remove backend method not defined.  Going to remove item by id from local collection.");
				this._removeLocal(id,def,false);//false means delete right away
			}//end if
			console.debug(F,'Exit');
			return def.promise;
		},

		getIdentity : function(object){
			// summary:
			//		Returns the identity of a store object
			// object: Object
			//		The obejct to get the identity for

			return object[this.idProperty];
		},

		push : function(){
			// summary:
			//		Attempts to push local changes in collection to backend if we are online

			var F = MODULE + ":push:";
			console.debug(F,'Enter');
			if(WL.Client.getEnvironment() == WL.Environment.IPHONE ||
					WL.Client.getEnvironment() == WL.Environment.IPAD ||
					WL.Client.getEnvironment() == WL.Environment.ANDROID){
				WL.Device.getNetworkInfo(lang.hitch(this,function(info){
					if(info.isNetworkConnected){
						console.debug(F,"We are online, so try pushing items to backend again");
						this._onlineEventHandler();
					}//end if
				}));
			}else{
				console.warn(F,"Get network info is not supported on this platform.  Not able to determine if we are online or not.  Always try to push changes to backend");
				this._onlineEventHandler();
			}//end if
			console.debug(F,'Exit');
		},

		_removeBackendSuccess : function(id,def){

			var F = MODULE + ":_removeBackendSuccess:";
			console.debug(F,"Enter");
			this._removeLocal(id, def,false);//false means delete right away
			console.debug(F,"Exit");
		},

		_removeBackendFail : function(id,def){

			var F = MODULE + ":_removeBackendFail:";
			console.debug(F,"Enter");
			this._removeLocal(id, def, true);// true means mark item for delete
			console.debug(F,"Exit");
		},

		_addBackendSuccess : function(updatedObject,options,def){

			var F = MODULE + ":_addBackendSuccess:";
			console.debug(F,"Enter");
			//now we try adding the item to the local collection
			//We put the updated object into the collection because the backend add method could have modified it. e.g. with a server side id
			this._addLocal(updatedObject, def,false);//since the item was added to backend first, we do not mark as push needed. i.e. false as last param
			console.debug(F,"Exit");
		},

		_addBackendFail : function(object,options,def){

			var F = MODULE + "_addBackendFail:";
			console.debug(F,"Enter");
			//Failed to add the object to the backend store.  Lets store it locally and mark it for push.  That way
			//later when we come back online, we will be able to push it. See this._onlineEventHandler
			this._addLocal(object, def, true);//true that we want to mark the item as requiring push
			console.debug(F,"Exit");
		},

		_putBackendSuccess : function(updatedObject,options,def){

			var F = MODULE + ":_putBackendSuccess:";
			console.debug(F,"Enter");
			//now we try adding the item to the local collection
			//We put the updated object into the collection because the backend add method could have modified it. e.g. with a server side id
			this._replaceLocal(updatedObject, def,false,true);//since the item was added to backend first, we do not mark as push needed. i.e. false as last param
			console.debug(F,"Exit");
		},

		_putBackendFail : function(object,options,def){

			var F = MODULE + "_putBackendFail:";
			console.debug(F,"Enter");
			//Failed to replace the object on the backend store.  Lets store it locally and mark it for push.  That way
			//later when we come back online, we will be able to push it. See this._onlineEventHandler
			this._replaceLocal(object, def, true,true);//true that we want to mark the item as requiring push
			console.debug(F,"Exit");
		},

		_queryBackendSuccess : function(list,query,options,def){

			var F = MODULE + ":_queryBackendSuccess:";
			console.debug(F,"Enter");
			console.debug(F,"Loop over the returned items and replace or add them to the collection");
			this._replaceMultipleLocal(list,def);
			console.debug(F,"Exit");
		},

		_queryBackendFail : function(errorObject,query,options,def){

			var F = MODULE + ":queryBackendFail:";
			console.debug(F,"Enter");
			console.warn(F,"Failed to query the backend, so perform query on collection.  errorObject=",errorObject);
			this._queryLocal(query, options, def);
			console.debug(F,"Exit");
		},


		_getBackendSuccess : function(o,id,def){

			var F = MODULE + ":_getBackendSuccess:";
			console.debug(F,"Enter");
			if(!o){
				console.warn(F,"Returned object is not defined, so call backend fail handler to see if we can get the item from local collection.");//TODO error object
				console.debug(F,"Exit");
				this._getBackendFail(null,id,def);
				return;
			}//end if

			console.debug(F,"Success getting the from the backend.  Going to add/update object in collection");
			console.debug(F,"Exit");
			this._replaceLocal(o,def);
		},
		_getBackendFail : function(errorObject,id,def){

			var F = MODULE + ":_getBackendFail:";
			console.debug(F,"Enter");
			console.warn(F,"Failed to get object from backend.  Try to return it from collection. errorObject=",errorObject);
			this._getLocal(id, def);
			console.debug(F,"Exit");
		},

		_getLocal : function(id,def){

			var F = MODULE + ":_getLocal:";
			console.debug(F,"Enter");
			var q = new Object();
			q[this.idProperty] = id;
			this.collection.find(q).
			then(function(arrayResults){
				if(arrayResults.length === 1){
					console.debug(F,"Found object with id",id,"in collection.  Returning it.");
					console.debug(F,"Exit");
					def.resolve(arrayResults[0].json);
				}else if(arrayResults > 1){
					console.warn(F,"More than one result was returned for get method.  This is unexpected.  Returning first one in the array");
					console.debug(F,"Exit");
					def.resolve(arrayResults[0].json);
				}else{
					console.warn(F,"No object was found in the collection.  Reject the deferred.");
					console.debug(F,"Exit");
					def.reject();
				}//end if
			}).
			fail(function(errorObject){
				console.warn(F,"Failed to find object in collection after failed attempt to get object from the backend.");
				console.debug(F,"Exit");
				def.reject(errorObject);
			});

		},

		_queryLocal : function(query,options,def){

			var F = MODULE + ":_queryLocal:";
			console.debug('Enter');
			var storeOptions = new Object();
			if(options && options.start){
				storeOptions.offset = options.start;
			}//endif
			if(options && options.count){
				storeOptions.limit = options.count;
			}//end if

			if((options && !options.sort) || !options){
				console.debug(F,"Query for JSONStore",query,"options for JSONStore",storeOptions);
				this.collection.find(query,storeOptions)
				.then(lang.hitch(this,function(arrayResults){
					console.debug(F,"Got array results from local collection =",arrayResults);
					console.debug(F,'Exit');
					def.resolve(this._getJSONValues(arrayResults));
				}))
				.fail(function(errorObject){
					console.warn(F,"Failed to run query against local collection.  query=",query,"options=",storeOptions);
					console.debug(F,"Exit");
					def.reject(errorObject);
				});
			}else{
				console.debug(F,"Since JSONStore does not support sorting in query, we need to get all items from collection and let dojo do the work");
				this.collection.findAll()
				.then(lang.hitch(this,function(arrayResults){
					var finalArray = this._getJSONValues(arrayResults);
					//now we need to apply the query engine to the array
					console.debug(F,"Exit");
					def.resolve(this.queryEngine(query,options)(finalArray));
				}))
				.fail(function(errorObject){
					console.warn(F,"Failed to query local collection to find all items");
					console.debug(F,"Exit");
					def.reject(errorObject);
				});
			}//end if

		},

		_getJSONValues : function(arrayResults){
			// summary:
			//		This method returns the json value from JSON store items.  This is really what people expect when they
			//		put and get items from a dojo store
			// arrayResults: Array
			//		The array of JSONStore items

			var F = MODULE + ":_getJSONValues:";
			console.debug(F,"Enter");
			var finalArray = new Array();
			for(var x = 0; x < arrayResults.length;x++){
				finalArray.push(arrayResults[x].json);
			}//end for
			console.debug(F,"Exit");
			return finalArray;
		},

		_replaceMultipleLocal : function(list,originalDef,index){

			var F = MODULE + ":_replaceMultipleLocal:";
			var def = new Deferred();
			if(!index){
				index = 0;
			}//end if

			this._replaceLocal(list[index],def);
			def.promise.then(
					lang.hitch(this,function(){
						console.debug(F,"Success replacing item at index",index);
						index ++;
						if(index < list.length){
							this._replaceMultipleLocal(list,originalDef,index);
						}else{
							originalDef.resolve(list);
						}//end if
					}),
					lang.hitch(this,function(){
						console.warn(F,"Success replacing item at index",index);
						index ++;
						if(index < list.length){
							this._replaceMultipleLocal(list,originalDef,index);
						}else{
							originalDef.resolve(list);
						}//end if
					}));
		},

		_itemExistsInCollection : function(o){

			var F = MODULE + ":_itemExistsInCollection:";
			console.debug(F,"Enter");
			var def = new Deferred();

			var id = o[this.idProperty];
			if(id == null){
				console.debug(F,"The item we are being asked to look for does not have an id.  Assume that this is a new object, so it does not exist in the collection.");
				def.resolve(null);
				console.debug(F,"Exit");
				return def.promise;
			}//end if

			var q = new Object();
			q[this.idProperty] = id;
			console.debug(F,"Query",q);
			this.collection.find(q).
			then(lang.hitch(this,function(arrayResults){
				if(arrayResults.length > 0){
					console.debug(F,"Exit");
					def.resolve(arrayResults[0]);//return first item, which there should only be one anyway that matches by id
				}else{
					console.debug(F,"Item is not in collection");
					console.debug(F,"Exit");
					def.resolve(null);
				}//end if
			})).
			fail(lang.hitch(this,function(errorObject){
				console.error(F,"Failed to find existing item in collection with id",o[this.idProperty],"error=",errorObject);
				console.debug(F,"Exit");
				def.reject(errorObject);
			}));

			return def.promise;
		},

		_replaceLocal : function(o,def,push,needsId){

			var F = MODULE + ":_replaceLocal:";
			console.debug(F,"Enter");
			if(!push){
				push = false;
			}//end if

			this._itemExistsInCollection(o).then(
					lang.hitch(this,function(item){
						if(item){
							console.debug(F,"Found existing item in collection with id",o[this.idProperty],". Updating that item");
							var doc = WL.JSONStore.documentify(item._id,o);
							this.collection.replace(doc,{push: push}).
							then(function(numberOfDocumentsReplaced){
								console.debug(F,"Success replacing object in collection. Num replaced =",numberOfDocumentsReplaced,"for object=",o);
								console.debug(F,"Exit");
								def.resolve(o);
							}).
							fail(function(errorObject){
								console.warn(F,"Failed replacing object in collection",errorObject);
								console.debug(F,"Exit");
								def.resolve(o);
							});
						}else{
							console.debug(F,"Item with id does not exist in collection.  Adding it.");
							console.debug(F,"Exit");
							this._addLocal(o,def,push,true);//last param = true means force the add, even if it exists
						}//end if
					}),
					lang.hitch(this,function(errorObject){
						def.reject(errorObject);
					}));
		},

		_addLocal : function(o,def,push,forceAdd){

			var F = MODULE + ":_addLocal:";
			console.debug(F,"Enter");
			if(!push){
				push = false;
			}//end if

			if(forceAdd){
				this.collection.add(o,{push: push}).
				then(function(numberOfDocsAdded){
					console.debug(F,"Number of docs added",numberOfDocsAdded);
					console.debug(F,"Exit");
					def.resolve(o);
				}).
				fail(function(errorObject){
					console.warn(F,"Failed adding item to collection",errorObject);
					console.debug(F,"Exit");
					def.resolve(o);
				});
			}else{
				//before adding, make sure that the object does not already exist
				this._itemExistsInCollection(o).then(
						lang.hitch(this,function(item){
							if(!item){
								console.debug(F,'The item does not exist in the collection, so add it');
								this._addLocal(o, def, push,true);
							}else{
								console.debug(F,"The item exists in the collection, so the add fails");
								def.reject();
							}//end if
						}),
						function(errorObject){
							console.error("Could not determine if item exists in collection. item=",o);
							def.reject(errorObject);
						});
			}//end if
		},

		_removeLocalByJSONStoreId : function(_id,def,push){
			// summary:
			//		Removes item by id from local collection
			// _id: integer
			//		Please note that id in this case is the JSONStore id, not the idProperty of the dojo store
			// def: dojo/Deferred
			//		The deferred to resolve once removal is completed
			// push: boolean
			//		Optional and defaults to false.  If true, the item is marked for push, otherwise it is immediately deleted

			var F = MODULE + ":_removeLocalByJSONStoreId:";
			console.debug(F,'Enter');
			if(!push){push = false;}
			//TODO: For now we can't track removes through JSONStore getPushRequired, because there is no way to
			//handle updaing the item to remove it from push list
			var options = {
					push: false
			};

			this.collection.remove(_id,options)
			.then(function(numRemoved){
				console.debug(F,"Successfully removed",numRemoved,"object(s) from local collection with _id = ",_id);
				def.resolve();
			})
			.fail(function(errorObject){
				console.error(F,"Failed to remove object from local collection with _id =",_id);
				def.reject(errorObject);
			});
		},

		_removeLocal : function(id,def,push){

			var F = MODULE + ":_removeLocal:";
			console.debug(F,'Enter');
			var o = new Object();
			o[this.idProperty] = id;
			this._itemExistsInCollection(o).then(
					lang.hitch(this,function(jsonStoreItem){
						if(jsonStoreItem){
							console.debug(F,"Found item in JSONStore to remove",jsonStoreItem);
							this._removeLocalByJSONStoreId(jsonStoreItem._id, def,push);
						}else{
							console.debug(F,"Item not in collection");
							def.reject();
						}//end if
					}),
					lang.hitch(this,function(errorObject){
						console.error(F,"Error checking if item with the following id exists",id);
						def.reject(errorObject);
					}));
		},

		//setters and getters
		_setCollectionAttr : function(collection){
			// summary:
			//		This method sets the JSONStore collection that this store is linked to.  All methods on this
			//		instance of the WorklightStore will call methods on the given collection
			// collection: Object
			//		The JSONStore collection gotten from WL.JSONStore.get(collectionName)

			this.collection = collection;
		},

		_setGetBackendAttr : function(method){
			// summary:
			//		This setter allows you to specify a backend method that will be called to provide the object by id.
			// description:
			//		The method can return a result or a dojo/promise/Promise object. dojo/when will be used to wait for a
			//		return value.
			// method: function
			//		The method that will be called to fetch an object in this collection from the backend.  It will be called
			//		like so, method(id), where id is the id of the object to fetch

			this.getBackend = method;
		},

		_setQueryBackendAttr : function(method){
			// summary:
			//		This setter allows you to specify a backend method that will be called to perform the dojo store query
			// description:
			//		The method can return a result or a dojo/promise/Promise object. dojo/when will be used to wait for a
			//		return value.
			// method: function
			//		The method that will be called to fetch an object in this collection from the backend.  It will be called
			//		like so, method(query,options), where id is the id of the object to fetch

			this.queryBackend = method;
		},

		_setAddBackendAttr : function(method){
			// summary:
			//		This setter allows you to specify a backend method that will be called to perform the dojo store add
			// description:
			//		The method can return a result or a dojo/promise/Promise object. dojo/when will be used to wait for a
			//		return value.
			// method: function
			//		The method that will be called to fetch an object in this collection from the backend.  It will be called
			//		like so, method(query,options), where id is the id of the object to fetch

			this.addBackend = method;
		},

		_setPutBackend : function(method){
			// summary:
			//		This setter allows you to specify a backend method that will be called to update an item in this dojo store
			// method: function
			//		The update function e.g. method(object,options)

			this.putBackend = method;
		},

		_setRemoveBackend : function(method){
			// summary:
			//		This setter allows you to specify a backend method that will be called to update an item in this dojo store
			// method: function
			//		The update function e.g. method(object,options)

			this.removeBackend = method;
		},


		_onlineEventHandler : function(){
			// summary:
			//		This method is used to push locally modified data to the backend when the aplication comes online

			var F = MODULE + ":_onlineEventHandler:";
			console.debug(F,"Enter");

			if(this.collection){

				this.collection.getPushRequired()
				.then(lang.hitch(this,function(items){
					console.debug(F,"Items to push",items);

					if(items.length > 0){
						var item;
						var def;
						item = items[0];
						def = new Deferred();//TODO: Do we really care what happens to this deferred?
						if(item._operation === "add" && this.addBackend){
							console.debug(F,"Attempting to add locally modified item through backend service");
							when(this.addBackend(item.json),
									lang.hitch(this,function(updatedItem){
									//update the json to point to the updated item... ie. could have id added
									//false means remove item from push list
									//true as last param means that the backend must add an id to the object
									console.debug(F,"Successfully added new item to the backend");
									this._replaceLocal(updatedItem,def,false,true);
								}),
								lang.hitch(this,function(errorObject){
									console.warn(F,"Failed to add item through backend service. item=",item,"errorObject=",errorObject);
									if(errorObject && errorObject.statusCode === 409){
										console.debug(F,"There was a conflict trying to add the item, so we should remove it from local collection.");
										this._removeLocalByJSONStoreId(item._id,def,false);//false = delete right away and don't mark for push
									}else{
										def.reject();
									}//end if
								}));
						}else if(item._operation === "remove" && this.removeBackend){
							console.debug(F,"Attempting to remove locally modified item through backend service");
							this.removeBackend(item.json[this.idProperty]).then(
								lang.hitch(this,function(){
									console.debug(F,"Successfully pushed item remove to the backend");
									this._removeLocal(item.json[this.idProperty], def, false);//false means delete right away
								}),
								lang.hitch(this,function(errorObject){
									console.error(F,"Failed to remove item from backend");
									def.reject();
								}));
						}else if(item._operation === "replace" && this.putBackend){
							this.putBackend(item.json).then(
									lang.hitch(this,function(updatedItem){
										console.debug(F,"Successfully pushed item update to the backend");
										this._replaceLocal(updatedItem,def,false,true);
									}),
									lang.hitch(this,function(errorObject){
										if(errorObject && errorObject.statusCode === 409){
											console.debug(F,"There was a conflict trying to update the item, so we should remove it from local collection.");
											this._removeLocalByJSONStoreId(item._id,def,false);//false = delete right away and don't mark for push
										}else{
											def.reject();
										}//end if
									}));
						}//end if

						//wait until the current item has been successfully pushed to the backend, before moving onto the next
						//If for whatever reason there is a failure, then we stop the recursion.
						def.promise.then(
								lang.hitch(this,function(){
									console.debug(F,"Completed pushing item to backend.  Moving onto the next.");
									this._onlineEventHandler();
								}),
								lang.hitch(this,function(errorObject){
									console.error(F,"Failed to push item=",item,"stopping push. error=",errorObject);
								}));
					}else{
						console.debug(F,"No more items to push.");
					}//end if
				}))
				.fail(function(errorObject){
					console.error(F,'Failed to determine items to push',errorObject);
					console.debug(F,"Exit");
				});

			}//end if
			console.debug(F,'Exit');
		}

	});
});
