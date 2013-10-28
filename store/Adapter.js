/* globals WL, define */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/store/util/QueryResults",
    "dojo/when"
],function(declare,lang,Deferred,queryResults,when){

    return declare([],{

        idProperty: "id",
        adapter: "",
        adapterGet : "get",
        adapterQuery : "query",
        adapterPut : "put",
        adapterAdd : "add",
        adapterRemove : "remove",
        cleanGetFunc : null,
        cleanQueryFunc : null,

        constructor : function(args){
            lang.mixin(this,args);
        },

        getIdentity : function(object){
            // summary:
            //      Returns an object's identity
            // object: Object
            //      The object to return the identity for
            return object[this.idProperty];
        },

        get : function(id){

            //var F = MODULE + ":get:";
            //console.debug(F,"Enter");
            var def = new Deferred();
            var invocationData = {
                adapter: this.adapter,
                procedure: this.adapterGet,
                parameters: [id]
            };

            var options = {
                onSuccess : lang.hitch(this,function(response){this._getSuccess(response,def);}),
                onFailure : lang.hitch(this,function(response){this._commonFailure(response,def);})
            };
            WL.Client.invokeProcedure(invocationData, options);
            //console.debug(F,"Exit");
            return def.promise;
        },

        query : function(query,options){
            // summary:
            //      Queries the store using the provided query.
            // query: Object
            //      dojo/store/util/SimpleQueryEngine compatible query.
            // options: Object
            //      Optional. {start : Number, count : Number, sort : [{attribute : String, descending: boolean}]}

            var def = new Deferred();
            if(query.noOp){
                return def.resolve([]);
            }//end if

            WL.Client.invokeProcedure({
                adapter: this.adapter,
                procedure: this.adapterQuery,
                parameters: [query,options]
            },{
                onSuccess : lang.hitch(this,function(response){this._querySuccess(response,def);}),
                onFailure : lang.hitch(this,function(response){this._commonFailure(response,def);})
            });
            return queryResults(def);
        },

        put : function(object,options){
            // summary:
            //      Saves the given object.
            // object: Object
            //      The object to update in the store
            // options: Object
            //      Optional. {id : string, before : Object, parent: Object, overwrite : boolean}

            var def = new Deferred();
            WL.Client.invokeProcedure({
                adapter: this.adapter,
                procedure: this.adapterPut,
                parameters: [object,options]
            },{
                onSuccess : lang.hitch(this,function(response){this._commonSuccess(response,def);}),
                onFailure : lang.hitch(this,function(response){this._commonFailure(response,def);})
            });
            return def.promise;
        },

        add : function(object,options){
            // summary:
            //      Create a new object.
            // object: Object
            //      The object to add to the store
            // options:
            //      (Optional) The options argument is defined the same as put()
            //                  (except overwrite is assumed to be false).
            var def = new Deferred();
            WL.Client.invokeProcedure({
                adapter: this.adapter,
                procedure: this.adapterAdd,
                parameters: [object,options]
            },{
                onSuccess : lang.hitch(this,function(response){this._commonSuccess(response,def);}),
                onFailure : lang.hitch(this,function(response){this._commonFailure(response,def);})
            });
            return def.promise;
        },

        remove : function(id){
            // summary:
            //      Delete the object by id
            // id: Object
            //      The id of the obejct to delete
            var def = new Deferred();
            WL.Client.invokeProcedure({
                adapter: this.adapter,
                procedure: this.adapterRemove,
                parameters: [id]
            },{
                onSuccess : lang.hitch(this,function(response){this._commonSuccess(response,def);}),
                onFailure : lang.hitch(this,function(response){this._commonFailure(response,def);})
            });
            return def.promise;
        },

        setCleanGet : function(func){
            this.cleanGetFunc = func;
        },

        setCleanQuery : function(func){
            this.cleanQueryFunc = func;
        },

        _commonSuccess : function(response,def){
            def.resolve(response.invocationResult.result);
        },

        _getSuccess : function(response,def){
            if(this.cleanGetFunc){
                when(this.cleanGetFunc(response.invocationResult.result),function(cleanResult){
                    def.resolve(cleanResult);
                });
            }else{
                this._commonSuccess(response,def);
            }//end if
        },

        _querySuccess : function(response,def){
            if(this.cleanQueryFunc){
                when(this.cleanQueryFunc(response.invocationResult.result),function(cleanResult){
                    def.resolve(cleanResult);
                });
            }else{
                this._commonSuccess(response,def);
            }//end if
        },

        _commonFailure : function(response,def){
            if(response && response.invocationResult && response.invocationResult.errors){
                def.reject(response.invocationResult.errors);
            }else{
                def.reject([]);
            }//end if
        }

    });

});
