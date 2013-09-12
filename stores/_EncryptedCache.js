define(["dojo/_base/declare","dojo/_base/lang","dojo/Deferred"],function(declare,lang,Deferred){
	var MODULE = "commonapp/utils/_EncryptedCache";
	
	return declare([],{
	
		constructor : function(props){
			var F = MODULE + ":constructor:";
			console.debug(F,"Created cache");
			lang.mixin(this,props);
		},
		
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
			//TODO
			def.resolve();
			return def.promise;
		},
		
		get : function(id){
			// summary:
			//		Find an object by id
			// id: Object
			//		The object to find with the given id
			var F = MODULE + ":get:";
			var def = new Deferred();
			//TODO
			def.resolve(null);
			return def.promise;
		},
		
		add : function(item){
			var def = new Deferred();
			//TODO
			def.resolve(0);
			return def.promise;
		},
		
		put : function(doc){
			var F = MODULE + ":put:";
			var def = new Deferred();
			console.debug(F,"Putting item into store",doc);
			//TODO
			def.resolve(0);
			return def.promise;
		},
		
		query : function(query){
			var def = new Deferred();
			//TODO
			def.resolve([]);
			return def.promise;
		},
		
		remove : function(id){
			var def = new Deferred();
			//TODO
			def.resolve(0);
			return def.promise;
		},
		
		empty : function(){
			var def = new Deferred();
			//TODO
			def.resolve();
			return def.promise;
		}
	});
});