//-------------------------------------------------------------------------
// Module: issw/mobile/worklight/file
//-------------------------------------------------------------------------
define([
	"dojo/_base/lang",
	"dojo/_base/Deferred"
], function( lang, Deferred ) {

	// module:
	//	dojo/number
	var MODULE = "issw/mobile/cordova/file";
	
	//--------------------------------------------------------------------
	var file = {
		// summary:
		//		Promised based wrapper for Cordova File API
		// example:
		// |	file.getFile("myFile").then(function(file) { ... }, function(err) { ... } );

		//-----------------------------------------------------------------------------------------
		getFile: function( filename ) {
			var F = MODULE + ":getFile: ";
			console.log(F, arguments);		
			var def = new Deferred();
			
		    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
		    	function(fs) {
					console.log(F,"FS OK:", fs);
					fs.root.getFile(filename, {create:true, exclusive:false}, 
						function(fileEntry) {
							console.log(F,"GF_Suc, got fileEntry:", fileEntry);
							fileEntry.file(
								function(file) {
									file.url = fileEntry.toURL();
									console.log(F,"Got file:", file);
									def.resolve( file );
								}, 
						    	function(err) {
						    		def.reject(err);
						    	}
							);//F
						},
				    	function(err) {
				    		def.reject(err);
				    	}
				    );//FE
				}, 
		    	function(err) {
		    		def.reject(err);
		    	}
		    );//FS
		    return def.promise;
		},
		
		//-----------------------------------------------------------------------------------------
		getDirectory: function( /*String*/dirpath ) {
			// summary:
			//		Get (or make) directory pointed to by path
			var F = MODULE + ":getDirectory: ";
			console.log(F, arguments);		
			var def = new Deferred();
			var dirs = dirpath.split("/");
			//-- Get rid of any empty segments.
			for( var x = dirs.length-1; x >= 0; x-- ) {
				if ( !dirs[x].length ) { dirs.splice(x,1); }
			}
			console.log(F,"Resulting dirpath: ", dirs.join("/"));
			
			var getDir = function(de, dirs, callback) {
				var dir = dirs.splice(0,1)[0];  // returns array, want 1st (single) node
				console.log(F, "getDir: ", de, dirs, dir);

				de.getDirectory( dir, {create:true, exclusive:false},
					function( d ) {
						if ( dirs.length ) {
							getDir( d, dirs, callback );
						} else {
							callback( d );
						}
					},
			    	function(err) {
			    		def.reject({
			    			error      : err,
			    			message    : "Failed getting directory segment: " + dir,
			    			dirEntry   : de,
			    			dirSegment : dir,
			    			dirPath    : dirpath
			    		});
			    	}
				);
			};
			
		    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
		    	function(fs) {
					console.log(F,"FS OK:", fs);
					getDir( fs.root, dirs, function( finalDir ) {
						console.log(F,"Got final child dir:", finalDir);
						def.resolve( finalDir );
					});
				}, 
		    	function(err) {
		    		def.reject({
		    			error      : err,
		    			message    : "Failed getting file system",
		    			dirs       : dirs,
		    			dirPath    : dirpath
		    		});
		    	}
		    );//FS
		    return def.promise;
		},
		
		copyFile: function(fileLocation, newDirectory, newName){

			var F = MODULE + ":moveFile: ";
			console.warn(F, arguments);		
			var def = new Deferred();
			var _this = this;
			
			window.resolveLocalFileSystemURI(fileLocation, function(fileEntry){
				console.info(F,"got file name is ", fileEntry.name);
				_this.getDirectory(newDirectory).then(function(dir){
					console.info(F,"GF_Suc got android directory ", dir);
					fileEntry.copyTo(dir, newName, 
						function(fileEntry) {
							console.info(F,"File copied to:", dir.fullPath);
							fileEntry.file(function(fileObj){
								def.resolve( 
										{
											name: fileObj.name,
											size: fileObj.size,
											fullPath: fileEntry.fullPath,
											type: fileObj.type
										} 
									);
							}, 
							function(err){
								console.warn("error is:", err);
								def.reject(err);
							});
							
						}, 
						function(err) {
							console.warn("error is:", err);
							def.reject(err);
						}
					);//F
				}, 
				function(err){
					console.warn("error is", err);
				});
			}, 
			function(err){
				console.warn("error is:", err);
	    		def.reject(err);
			});
		    return def.promise;
		},
		
		getFileDetails: function(fileLocation){
			// fileLocation should be in the format file:///mnt/sdcard/SOME_FOLDER/FILE_NAME.EXT
			var F = MODULE + ":getFileDetails: ";
			console.info(F, arguments);		
			var def = new Deferred();
						
			window.resolveLocalFileSystemURI(fileLocation, function(fileEntry){
				console.info("got file name is ", fileEntry.name);
				fileEntry.file(function(fileObj){
					console.info("got file is ", fileObj.name);
					def.resolve(
							{
								name: fileObj.name,
								size: fileObj.size,
								fullPath: fileEntry.fullPath,
								type: fileObj.type
							}
						);
				}, 
				function(err){
					console.warn("error is:", err);
					def.reject(err);
				});
			}, 
			function(err){
				console.warn("error is:", err);
	    		def.reject(err);
			});
		    return def.promise;
		},
		
		deleteFile: function(/* String */fileURL){
			// fileURL should be in the format file:///mnt/sdcard/SOME_FOLDER/FILE_NAME.EXT
			console.info("in deleteFile, trying to delete file: ", fileURL);
			var def = new Deferred();
			window.resolveLocalFileSystemURI(fileURL, function(fileEntry) {
				console.info("in removeFileFromDevice, resolved file entry: ", fileEntry);
				fileEntry.remove(function(obj){
					console.debug("remove file", obj);
					def.resolve(obj);
				}, 
				function(err){
					console.error("Error removing file", err);
					def.reject(err);
				});
			}, 
			function(err){
				console.error("Error removing file", err);
				def.reject(err);
			});
			return def.promise;
		}
		
	};
    return file;
});
