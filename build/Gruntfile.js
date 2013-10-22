//-- References:
//-- https://github.com/yatskevich/grunt-bower-task
//-- https://github.com/sindresorhus/grunt-shell
//-- https://github.com/phated/grunt-dojo
//-- https://github.com/pahen/grunt-madge

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    dojoBuildProfile : {
      options : {
        scanExcludeList: ['dworklight/env/preload'],
        profileFile : "./profile.js",
        packages : [
          {name:"dcordova"  , location:"./bower_components/dcordova"  },
          {name:"dworklight", location:"./bower_components/dworklight"}
        ],
        appLayers : [
          {
            name    : "dworklight.min",
            includes: ["dcordova","dworklight"],
            excludes: ['dworklight/env/preload']
          }
        ],
        libLayers : [
        ],
        baseLayerDeps : true,
        baseLayerName : "",
        baseLayerThreshold : 5
      }
    },

    bower: {
        install : {
          options: {
            targetDir  : "src",
            install    : true,
            cleanup    : true,
            verbose    : false
          }
        }
    },

    //-- Dojo-Grunt
    dojo: {
      dist: {
        options: {
          dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
          load: 'build', // Optional: Utility to bootstrap (Default: 'build')
          profile: 'auto.profile.js', // Profile for build
//        appConfigFile: '', // Optional: Config file for dojox/app
          package: '', // Optional: Location to search package.json (Default: nothing)
          packages: [], // Optional: Array of locations of package.json (Default: nothing)
          require: '', // Optional: Module to require for the build (Default: nothing)
          requires: [], // Optional: Array of modules to require for the build (Default: nothing)
          cwd: './', // Directory to execute build within
          dojoConfig: '', // Optional: Location of dojoConfig (Default: null),
          // Optional: Base Path to pass at the command line
          // Takes precedence over other basePaths
          // Default: null
          basePath: ''
        }
      },
      options: {
        // You can also specify options to be used in all your tasks
        dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
        load: 'build', // Optional: Utility to bootstrap (Default: 'build')
        profile: 'auto.profile.js', // Profile for build
        appConfigFile: '', // Optional: Config file for dojox/app
        package: '', // Optional: Location to search package.json (Default: nothing)
        packages: [], // Optional: Array of locations of package.json (Default: nothing)
        require: '', // Optional: Module to require for the build (Default: nothing)
        requires: [], // Optional: Array of modules to require for the build (Default: nothing)
        cwd: './', // Directory to execute build within
        dojoConfig: '', // Optional: Location of dojoConfig (Default: null),
        // Optional: Base Path to pass at the command line
        // Takes precedence over other basePaths
        // Default: null
        basePath: ''
      }
    },

    madge: {
      options: {
        format: 'amd'
      },
      all: ['./src']
    },

    shell : {
        runAnt: {                      // Target
            options: {                      // Options
              stdout: true
            },
            command: 'ant'
          }
        }

      });

  //-- Load up extensions
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-dojo');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-dojo-build-profile');

  //-- Default task(s).
  //  grunt.registerTask('default', ['bower','shell']);

};
