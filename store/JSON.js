define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "dojo/Deferred",
    "dojo/Stateful",
    "dojo/store/util/SimpleQueryEngine",
    "dojo/store/util/QueryResults",
    "dojo/has"
],function(declare,lang,when,Deferred,Stateful,SimpleQueryEngine,queryResults, has){

    return declare([Stateful],{
        /**
         * @memberOf JSONStore
         */

        // summary:
        //      Implements the dojo/store API, and maintains a local collection (e.g. cache) of
        //      objects via the WL.JSONStore

        // collection: Object
        //      The collection that this store represents.  Gotten from WL.JSONStore.get(collectionName)
        collection: null,

        // idProperty: String
        //      The id property of the store.  This will be used to documentify objects, per the
        //       WL.JSONStore.documentify method. The default value is "id".
        idProperty: "id",

        // queryEngine: dojo/store/util/SimpleQueryEngine
        //      This is the query engine of the store.
        queryEngine : SimpleQueryEngine,

        // getBackend: function
        //      A pointer to the function used to get and object from the backend
        getBackend : null,

        // queryBackend: function
        //      A pointer to the function used to query the backend for items
        queryBackend : null,

        // addBackend: function
        //      A pointer to the function used to add an object to the backend
        addBackend : null,

        // putBackend: function
        //      A pointer to the function used to update an object on the backend
        putBackend : null,

        // removeBackend: function
        //      A pointer to the function used to remove an object from the backend
        removeBackend : null,
        
        // collectionInitClass: String
        //		The name of the AMD class (full path) that can be used to bootstrap the WL.JSONStore collection.  The class should be a 
        //		singleton. That is, you return an instance of the class from the AMD define.
        collectionInitClass : null,
        
        // collectionInitMethod: String
        //		The name of the method in collectionInitClass that actually bootstraps the WL.JSONStore collection
        collectionInitMethod : null,

        constructor : function(args){
            lang.mixin(this,args);
        },

        get : function(id){
            // summary:
            //      Gets the entity with the given id.
            // description:
            //      This method first calls the backend method (if set) to get the object. If not, then local collection
            //      is always used.
            var def = new Deferred();
            if(!this.collection){
                // The JSONStore collection is not set on this instance of WorklightStore.  Returning null.
                // Please set the collection via this.set('collection',WL.JSONStore.get(collectioName))
                def.resolve(null);
                return def.promise;
            }

            if(this.getBackend){
                // Call getBackend method to get the object from the backend by id
                when(this.getBackend(id),
                    lang.hitch(this,function(o){
                        this._getBackendSuccess(o,id,def);
                    }),
                    lang.hitch(this,function(errorObject){
                        this._getBackendFail(errorObject,id,def);
                    })
                );
            }else{
                // The getBackend method is not defined.  Try to get object from collection.
                this._getLocal(id, def);
            }
            return def.promise;
        },

        query : function(query,options,def){
            // summary:
            //      Queries the store using the provided query.
            // query: Object
            //      dojo/store/util/SimpleQueryEngine compatible query.
            // options: Object
            //      Optional. {start : Number, count : Number, sort : [{attribute : String, descending: boolean}]}
        	if(!def){
        		def = new Deferred();	
        	}//end if
        	
            if(!this.collection){
            	console.warn("No WL.JSONStore collection has been defined for this store");
            	if(this.collectionInitClass && this.collectionInitMethod){
            		console.debug("Attempting to init the collection via",this.collectionInitClass,this.collectionInitMethod);
            		require([this.collectionInitClass],lang.hitch(this,function(LocalStorageInst){
            			//The class should be a singleton!
            			when(LocalStorageInst[this.collectionInitMethod](),
            			lang.hitch(this,function(col){
            				if(col){
            					this.set("collection",col);
            					console.debug("The collection has been initialized",col);
                    			this.query(query, options,def);
            				}else{
            					console.error("The collection was undefined");
            					def.reject(undefined);
            				}//end if
            			}),
            			lang.hitch(this,function(error){
            				console.error("There was an error calling",this.collectionInitClass,this.collectionInitMethod,error);
            				def.reject(undefined);
            			}));
            		}));
            	}else{
            		 // The JSONStore collection is not set on this instance of WorklightStore and neither is collectionInitMethod. Returning empty array.
                    // Please set the collection via this.set('collection',WL.JSONStore.get(collectioName))
                    def.reject(undefined);//TODO: format of error object from JSONStore;
            	}//end if
            	return def.promise;
            }//end if

            if(this.queryBackend){
                when(this.queryBackend(query,options),
                    lang.hitch(this,function(list){
                        this._queryBackendSuccess(list,query,options,def);
                    }),
                    lang.hitch(this,function(errorObject){
                        this._queryBackendFail(errorObject,query,options,def);
                    })
                );
            }else{
                // There is no backend query function set. You can set one with this.set("queryBackend",method)
            	this._queryLocal(query, options, def);
            }//end if
            return queryResults(def);
        },

        add : function(object,options,def){
            // summary:
            //      Used to add an item to the collection
            // object: Object
            //      The obejct to add to the collection
            //  options: Object
            //      The options object
            
        	if(!def){
        		def = new Deferred();	
        	}//end if
        	
            if(!this.collection){
            	console.warn("No WL.JSONStore collection has been defined for this store");
            	if(this.collectionInitClass && this.collectionInitMethod){
            		console.debug("Attempting to init the collection via",this.collectionInitClass,this.collectionInitMethod);
            		require([this.collectionInitClass],lang.hitch(this,function(LocalStorageInst){
            			//The class should be a singleton!
            			when(LocalStorageInst[this.collectionInitMethod](),
            			lang.hitch(this,function(col){
            				if(col){
            					this.set("collection",col);
            					console.debug("The collection has been initialized",col);
                    			this.add(object, options,def);
            				}else{
            					console.error("The collection was undefined");
            					def.reject(undefined);
            				}//end if
            			}),
            			lang.hitch(this,function(error){
            				console.error("There was an error calling",this.collectionInitClass,this.collectionInitMethod,error);
            				def.reject(undefined);
            			}));
            		}));
            	}else{
            		 // The JSONStore collection is not set on this instance of WorklightStore and neither is collectionInitMethod. Returning empty array.
                    // Please set the collection via this.set('collection',WL.JSONStore.get(collectioName))
                    def.reject(undefined);//TODO: format of error object from JSONStore;
            	}//end if
            	return def.promise;
            }//end if

            //this.collection.removeCollection();
            if(this.addBackend){
                // The backend add method is defined.  Call it in order to send the object to the backend store
                when(this.addBackend(object,options),
                    lang.hitch(this,function(updatedObject){
                        this._addBackendSuccess(updatedObject,options,def);
                    }),
                    lang.hitch(this,function(errorObject){
                        this._addBackendFail(object,errorObject,options,def);
                    })
                );
            }else{
                // The backend add method is not defined.  Trying to add the item directly to local collection
                //do not mark the item for push since there is no addBackend method i.e. last param false
                this._addLocal(object, def,false);
            }
            return def.promise;
        },

        put : function(object,options,def){
            // summary:
            //      This method is used to update an item in the store
            // object: Object
            //      The dojo store item to update
            // options: Object
            //      The update options
           
        	if(!def){
        		def = new Deferred();	
        	}//end if
        	
            if(!this.collection){
            	console.warn("No WL.JSONStore collection has been defined for this store");
            	if(this.collectionInitClass && this.collectionInitMethod){
            		console.debug("Attempting to init the collection via",this.collectionInitClass,this.collectionInitMethod);
            		require([this.collectionInitClass],lang.hitch(this,function(LocalStorageInst){
            			//The class should be a singleton!
            			when(LocalStorageInst[this.collectionInitMethod](),
            			lang.hitch(this,function(col){
            				if(col){
            					this.set("collection",col);
            					console.debug("The collection has been initialized",col);
                    			this.put(object, options,def);
            				}else{
            					console.error("The collection was undefined");
            					def.reject(undefined);
            				}//end if
            			}),
            			lang.hitch(this,function(error){
            				console.error("There was an error calling",this.collectionInitClass,this.collectionInitMethod,error);
            				def.reject(undefined);
            			}));
            		}));
            	}else{
            		 // The JSONStore collection is not set on this instance of WorklightStore and neither is collectionInitMethod. Returning empty array.
                    // Please set the collection via this.set('collection',WL.JSONStore.get(collectioName))
                    def.reject(undefined);//TODO: format of error object from JSONStore;
            	}//end if
            	return def.promise;
            }//end if

            if(this.putBackend){
                // put backend method is defined.  Call it to update the object on the backend
                when(this.putBackend(object,options),
                    lang.hitch(this,function(updatedObject){
                        this._putBackendSuccess(updatedObject,options,def);
                    }),
                    lang.hitch(this,function(errorObject){
                        this._putBackendFail(object,errorObject,options,def);
                    })
                );
            }else{
                //There is no put backend method defined.  Trying to update the object in the local collection
                //needs an id and you should push the change to the backend
                this._replaceLocal(object,def,true,true);
            }
            return def.promise;
        },

        remove : function(id,def){
            // summary:
            //      Used to remove an item from the store by id
            // id: SimpleType
           
        	if(!def){
        		def = new Deferred();	
        	}//end if
        	
            if(!this.collection){
            	console.warn("No WL.JSONStore collection has been defined for this store");
            	if(this.collectionInitClass && this.collectionInitMethod){
            		console.debug("Attempting to init the collection via",this.collectionInitClass,this.collectionInitMethod);
            		require([this.collectionInitClass],lang.hitch(this,function(LocalStorageInst){
            			//The class should be a singleton!
            			when(LocalStorageInst[this.collectionInitMethod](),
            			lang.hitch(this,function(col){
            				if(col){
            					this.set("collection",col);
            					console.debug("The collection has been initialized",col);
                    			this.add(object, options,def);
            				}else{
            					console.error("The collection was undefined");
            					def.reject(undefined);
            				}//end if
            			}),
            			lang.hitch(this,function(error){
            				console.error("There was an error calling",this.collectionInitClass,this.collectionInitMethod,error);
            				def.reject(undefined);
            			}));
            		}));
            	}else{
            		 // The JSONStore collection is not set on this instance of WorklightStore and neither is collectionInitMethod. Returning empty array.
                    // Please set the collection via this.set('collection',WL.JSONStore.get(collectioName))
                    def.reject(undefined);//TODO: format of error object from JSONStore;
            	}//end if
            	return def.promise;
            }//end if

            if(this.removeBackend){
                // Calling the backend remove method for item with store
                when(this.removeBackend(id),
                    lang.hitch(this,function(){
                        this._removeBackendSuccess(id,def);
                    }),
                    lang.hitch(this,function(){
                        this._removeBackendFail(id,def);
                    })
                );
            }else{
                // Remove backend method not defined.  Going to remove item by id from local collection.
                this._removeLocal(id,def,false);//false means delete right away
            }
            return def.promise;
        },

        getIdentity : function(object){
            // summary:
            //      Returns the identity of a store object
            // object: Object
            //      The obejct to get the identity for
            return object[this.idProperty];
        },

        push : function(){
            // summary:
            //      Attempts to push local changes in collection to backend if we are online
            if( has("worklight-ios") || has("worklight-android") ) {
                WL.Device.getNetworkInfo(lang.hitch(this,function(info){
                    if(info.isNetworkConnected){
                        //We are online, so try pushing items to backend again
                        this._onlineEventHandler();
                    }
                }));
            }else{
                // Get network info is not supported on this platform.  Not able to determine if we
                // are online or not.  Always try to push changes to backend
                this._onlineEventHandler();
            }
        },

        _removeBackendSuccess : function(id,def){
            this._removeLocal(id, def,false);//false means delete right away
        },

        _removeBackendFail : function(id,def){
            this._removeLocal(id, def, true);// true means mark item for delete
        },

        _addBackendSuccess : function(updatedObject,options,def){
            //now we try adding the item to the local collection
            //We put the updated object into the collection because the backend add method could have modified it.
            // e.g. with a server side id
            //since the item was added to backend first, we do not mark as push needed. i.e. false as last param
            this._addLocal(updatedObject, def,false);
        },

        _addBackendFail : function(object,errorObject,options,def){
        	//Failed to add the object to the backend store.  Lets store it locally and mark it for push.  That way
           //later when we come back online, we will be able to push it. See this._onlineEventHandler
           this._addLocal(object, def, true);//true that we want to mark the item as requiring push
        },

        _putBackendSuccess : function(updatedObject,options,def){
        	
        	//now we try adding the item to the local collection
            //We put the updated object into the collection because the backend add method could have modified it.
            // e.g. with a server side id
            //since the item was added to backend first, we do not mark as push needed. i.e. false as last param
            this._replaceLocal(updatedObject, def,false,true);
        },

        _putBackendFail : function(object,errorObject,options,def){
        	
        	//Failed to replace the object on the backend store.  Lets store it locally and mark it for push.
            //That way later when we come back online, we will be able to push it. See this._onlineEventHandler
            this._replaceLocal(object, def, true,true);//true that we want to mark the item as requiring push
        },

        _queryBackendSuccess : function(list,query,options,def){
            // Loop over the returned items and replace or add them to the collection
            this._replaceMultipleLocal(list,def);
        },

        _queryBackendFail : function(errorObject,query,options,def){
            // Failed to query the backend, so perform query on collection
            this._queryLocal(query, options, def);
        },

        _getBackendSuccess : function(o,id,def){
            if(!o){
                // Returned object is not defined, so call backend fail handler to see if we can get the item
                // from local collection.
                //TODO: error object
                this._getBackendFail(null,id,def);
                return;
            }
            // Success getting the from the backend.  Going to add/update object in collection
            this._replaceLocal(o,def);
        },

        _getBackendFail : function(errorObject,id,def){
            // Failed to get object from backend.  Try to return it from collection.
            this._getLocal(id, def);
        },

        _getLocal : function(id,def){
            var q = {};
            q[this.idProperty] = id;
            this.collection.find(q).then(
                function(arrayResults){
                    if(arrayResults.length === 1){
                        // Found object with id",id,"in collection.  Returning it.
                        def.resolve(arrayResults[0].json);
                    }else if(arrayResults > 1){
                        // More than one result was returned for get method.  This is unexpected.
                        // Returning first one in the array
                        def.resolve(arrayResults[0].json);
                    }else{
                        // No object was found in the collection.  Reject the deferred.
                        def.reject(undefined);
                    }
                }
            ).fail(
                function(errorObject){
                    // Failed to find object in collection after failed attempt to get object from the backend.
                	console.error("Failed to find object in collection after failed attempt to get object from the backend.");
                    def.reject(errorObject);
                }
            );
        },

        _queryLocal : function(query,options,def){
            var storeOptions = {};
            if(options && options.start){
                storeOptions.offset = options.start;
            }
            if(options && options.count){
                storeOptions.limit = options.count;
            }

            if((options && !options.sort) || !options){
                // Query for JSONStore",query,"options for JSONStore
                this.collection.find(query,storeOptions).then(
                    lang.hitch(this,function(arrayResults){
                        //Got array results from local collection
                        def.resolve(this._getJSONValues(arrayResults));
                    })
                ).fail(
                    function(errorObject){
                        // Failed to run query against local collection
                        def.reject(errorObject);
                    }
                );
            }else{
                // Since JSONStore does not support sorting in query, we need to get all items from
                // collection and let dojo do the work
                this.collection.findAll().then(
                    lang.hitch(this,function(arrayResults){
                        var finalArray = this._getJSONValues(arrayResults);
                        //now we need to apply the query engine to the array
                        def.resolve(this.queryEngine(query,options)(finalArray));
                    })
                ).fail(
                    function(errorObject){
                        //Failed to query local collection to find all items
                        def.reject(errorObject);
                    }
                );
            }
        },

        _getJSONValues : function(arrayResults){
            // summary:
            //      This method returns the json value from JSON store items.
            //      This is really what people expect when they
            //      put and get items from a dojo store
            // arrayResults: Array
            //      The array of JSONStore items
            var finalArray = [];
            for(var x = 0; x < arrayResults.length;x++){
                finalArray.push(arrayResults[x].json);
            }
            return finalArray;
        },

        _replaceMultipleLocal : function(list,originalDef,index){
            var def = new Deferred();
            if(!index){
                index = 0;
            }

            this._replaceLocal(list[index],def);
            def.promise.then(
                lang.hitch(this,function(){
                    // Success replacing item
                    index++;
                    if(index < list.length){
                        this._replaceMultipleLocal(list,originalDef,index);
                    }else{
                        originalDef.resolve(list);
                    }
                }),
                lang.hitch(this,function(){
                    // Success replacing item at index
                    index++;
                    if(index < list.length){
                        this._replaceMultipleLocal(list,originalDef,index);
                    }else{
                        originalDef.resolve(list);
                    }
                })
            );
        },

        _itemExistsInCollection : function(o){
            var def = new Deferred();

            var id = o[this.idProperty];
            if(id == null){
                // The item we are being asked to look for does not have an id.  Assume that this is a new object,
                // so it does not exist in the collection.
                def.resolve(null);
                return def.promise;
            }

            var q = {};
            q[this.idProperty] = id;
            this.collection.find(q).then(
                lang.hitch(this,function(arrayResults){
                    if(arrayResults.length > 0){
                        //return first item, which there should only be one anyway that matches by id
                        def.resolve(arrayResults[0]);
                    }else{
                        def.resolve(null);
                    }
                })
            ).fail(
                lang.hitch(this,function(errorObject){
                    // Failed to find existing item in collection with id",o[this.idProperty]
                    def.reject(errorObject);
                })
            );
            return def.promise;
        },

        _replaceLocal : function(o,def,push){
            if(!push){
                push = false;
            }

            this._itemExistsInCollection(o).then(
                lang.hitch(this,function(item){
                    if(item){
                        // Found existing item in collection with id",o[this.idProperty],". Updating that item
                        var doc = WL.JSONStore.documentify(item._id,o);
                        this.collection.replace(doc,{push: push}).then(
                            function(){
                                // Success replacing object in collection. Num replaced
                                def.resolve(o);
                            }
                        ).fail(
                            function(){
                                // Failed replacing object in collection",errorObject);
                                def.resolve(o);
                            }
                        );
                    }else{
                        // Item with id does not exist in collection.  Adding it.
                        //last param = true means force the add, even if it exists
                        this._addLocal(o,def,push,true);
                    }
                }),
                lang.hitch(this,function(errorObject){
                    def.reject(errorObject);
                })
            );
        },

        _addLocal : function(o,def,push,forceAdd){
            if(!push){
                push = false;
            }

            if(forceAdd){
                this.collection.add(o,{push: push}).
                then(function(){
                    def.resolve(o);
                }).
                fail(function(){
                    def.resolve(o);
                });
            }else{
                //before adding, make sure that the object does not already exist
                this._itemExistsInCollection(o).then(
                    lang.hitch(this,function(item){
                        if(!item){
                            //The item does not exist in the collection, so add it
                            this._addLocal(o, def, push,true);
                        }else{
                            // The item exists in the collection, so the add fails
                            def.reject();
                        }
                    }),
                    function(errorObject){
                        //Could not determine if item exists in collection. item=
                        def.reject(errorObject);
                    }
                );
            }
        },

        _removeLocalByJSONStoreId : function(_id,def,push){
            // summary:
            //      Removes item by id from local collection
            // _id: integer
            //      Please note that id in this case is the JSONStore id, not the idProperty of the dojo store
            // def: dojo/Deferred
            //      The deferred to resolve once removal is completed
            // push: boolean
            //      Optional and defaults to false.  If true, the item is marked for push, otherwise it is
            //      immediately deleted
            if(!push){push = false;}
            //TODO: For now we can't track removes through JSONStore getPushRequired, because there is no way to
            //handle updaing the item to remove it from push list
            var options = {
                push: false
            };

            this.collection.remove(_id,options).then(
                function(){
                    // Successfully removed",numRemoved,"object(s) from local collection
                    def.resolve();
                }
            ).fail(
                function(errorObject){
                    // Failed to remove object from local collection
                    def.reject(errorObject);
                }
            );
        },

        _removeLocal : function(id,def,push){
            var o = {};
            o[this.idProperty] = id;
            this._itemExistsInCollection(o).then(
                lang.hitch(this,function(jsonStoreItem){
                    if(jsonStoreItem){
                        this._removeLocalByJSONStoreId(jsonStoreItem._id, def,push);
                    }else{
                        def.reject();
                    }
                }),
                lang.hitch(this,function(errorObject){
                    def.reject(errorObject);
                })
            );
        },
        

        //setters and getters
        _setCollectionAttr : function(collection){
            // summary:
            //      This method sets the JSONStore collection that this store is linked to.  All methods on this
            //      instance of the WorklightStore will call methods on the given collection
            // collection: Object
            //      The JSONStore collection gotten from WL.JSONStore.get(collectionName)
            this.collection = collection;
        },

        _setGetBackendAttr : function(method){
            // summary:
            //      This setter allows you to specify a backend method that will be called to provide the object by id.
            // description:
            //      The method can return a result or a dojo/promise/Promise object. dojo/when will be used to
            //       wait for a return value.
            // method: function
            //      The method that will be called to fetch an object in this collection from the backend.
            //      It will be called like so, method(id), where id is the id of the object to fetch
            this.getBackend = method;
        },

        _setQueryBackendAttr : function(method){
            // summary:
            //      This setter allows you to specify a backend method that will be called to perform the
            //      dojo store query
            // description:
            //      The method can return a result or a dojo/promise/Promise object. dojo/when will be used
            //      to wait for a return value.
            // method: function
            //      The method that will be called to fetch an object in this collection from the backend.
            //      It will be called like so, method(query,options), where id is the id of the object to fetch
            this.queryBackend = method;
        },

        _setAddBackendAttr : function(method){
            // summary:
            //      This setter allows you to specify a backend method that will be called to perform the dojo store add
            // description:
            //      The method can return a result or a dojo/promise/Promise object. dojo/when will be used to
            //      wait for a return value.
            // method: function
            //      The method that will be called to fetch an object in this collection from the backend.  It will
            //      be called like so, method(query,options), where id is the id of the object to fetch
            this.addBackend = method;
        },

        _setPutBackend : function(method){
            // summary:
            //      This setter allows you to specify a backend method that will be called to update an item
            //      in this dojo store
            // method: function
            //      The update function e.g. method(object,options)
            this.putBackend = method;
        },

        _setRemoveBackend : function(method){
            // summary:
            //      This setter allows you to specify a backend method that will be called to update an item
            //      in this dojo store
            // method: function
            //      The update function e.g. method(object,options)
            this.removeBackend = method;
        },

        _onlineEventHandler : function(){
            // summary:
            //      This method is used to push locally modified data to the backend when the aplication comes online
        	//TODO This function needs to be inspected for bugs.  I put this together quite late in the evening ;)
        	
            var _this = this;
            if(this.collection){
                this.collection.getPushRequired().then(
                    lang.hitch(this,function(items){
                        if(items.length > 0){
                            var item, def;
                            item = items[0];
                            def = new Deferred();//TODO: Do we really care what happens to this deferred?
                            if(item._operation === "add" && this.addBackend){
                                // Attempting to add locally modified item through backend service
                                when(this.addBackend(item.json),
                                    lang.hitch(this,function(updatedItem){
                                        //update the json to point to the updated item... ie. could have id added
                                        //false means remove item from push list
                                        //true as last param means that the backend must add an id to the object
                                        // Successfully added new item to the backend
                                        this._replaceLocal(updatedItem,def,false,true);
                                    }),
                                    lang.hitch(this,function(errorObject){
                                        //Failed to add item through backend service.
                                        if(errorObject && errorObject.statusCode === 409){
                                            // There was a conflict trying to add the item, so we should remove
                                            //it from local collection
                                            //false = delete right away and don't mark for push
                                            this._removeLocalByJSONStoreId(item._id,def,false);
                                        }else{
                                            def.reject();
                                        }
                                    })
                                );
                            }else if(item._operation === "remove" && this.removeBackend){
                                // Attempting to remove locally modified item through backend service
                                this.removeBackend(item.json[this.idProperty]).then(
                                    function(){
                                        //Successfully pushed item remove to the backend
                                        //false means delete right away
                                        _this._removeLocal(item.json[_this.idProperty], def, false);
                                    },
                                    function(){
                                        // Failed to remove item from backend
                                        def.reject();
                                    }
                                );
                            }else if(item._operation === "replace" && this.putBackend){
                                _this.putBackend(item.json).then(
                                    function(updatedItem){
                                        //Successfully pushed item update to the backend
                                        _this._replaceLocal(updatedItem,def,false,true);
                                    },
                                    function(errorObject){
                                        if(errorObject && errorObject.statusCode === 409){
                                            //There was a conflict trying to update the item, so we should
                                            //remove it from local collection.
                                            //false = delete right away and don't mark for push
                                            _this._removeLocalByJSONStoreId(item._id,def,false);
                                        }else{
                                            def.reject();
                                        }
                                    }
                                );
                            }

                            //wait until the current item has been successfully pushed to the backend,
                            //before moving onto the next
                            //If for whatever reason there is a failure, then we stop the recursion.
                            def.promise.then(
                                function(){
                                    // Completed pushing item to backend.  Moving onto the next
                                    _this._onlineEventHandler();
                                }
                            );
                        }else{
                            //No more items to push.
                        }
                    })
                ).fail( function(){
                    //Failed to determine items to push
                });
            }//if
        }

    });
});
