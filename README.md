
# dworklight : Dojo - Worklight Libraries
This project contains several modules to assist in using Dojo within the IBM Worklight platform.

[Discuss or ask questions](http://ost.io/@ibm-dojo/dworklight)

## Status

No official release yet.

## Licensing

This project is distributed by the Dojo Foundation and licensed under the ["New" BSD License](https://github.com/ibm-dojo/dcordova/blob/master/LICENSE).
All contributions require a [Dojo Foundation CLA](http://dojofoundation.org/about/claForm).

## Dependencies

This project requires the following other projects to run:
 * dojo
 * dojox/mobile
 * dcordova


## Installation

Prerequisites:
- [NodeJS](http://nodejs.org/) for NPM install.
	- The magic goo that makes all things true
- [Grunt]() Command Line automation framework
	- `npm install -g grunt-cli`
- [Bower](http://bower.io/) package management
	- `npm install -g bower`


Developers - Manual installation procedure:

1. Ensure prereqs are installed
2. Install this project by cloning from github
	- `git clone git://github.com/ibm-dojo/dworklight.git`
	- `cd dworklight`
3. Install external required packages
	- `npm install`
4. Put required modules in the right places
	- `grunt bower`


* Manual installation by dropping dworklight as a sibling of the top level Dojo modules:
 * dojo
 * dcordova
 * dworklight

 To install the latest master, go to the root Dojo installation directory and clone dworklight from github

 `git clone git://github.com/ibm-dojo/dworklight.git`
 `git clone git://github.com/ibm-dojo/cordova.git`

## Documentation

TODO, but here's the general modules

See the [kfbishop/dworklight-testapp](https://github.com/kfbishop/dworklight-testapp) project for tests and usage of the dworklight modules within a actual Worklight app.

### activity

Simple activity control that allows for native or Dojo basic activity indicators.

### console

Worklight console logging adapter. Enables use of standard console.xxx() commands that will be output correctly on the Android LogCat and XCode loggers.  Also enables multiple arguments with clean JSON encoding of WL.Logger.Xxx() commands.

### features
'Has' feature detection for Worklight. Provides dozens of has tests to properly identify the Worklight operating environment.

### request
Worklight Adapter integration to feel more like a normal dojo/request style. Standard *promise* style callback are supported over the unique Worklight adapter invocation style calls.

### require
Worklight Custom AMD require support. Allows for remotely hosted modules located in the Worklight *mobilewebapp* environment to be loaded in a hybrid application, regardless of hosting location.

### env
Environment specific modules.

#### env/android
Android specific support. Currently support back button handling.

#### env/preload
Preloader to mock Worklight env and set device type.

### stores
Worklight Stores

#### stores/WorklightStore
API to enable direct access ot both JSONStore and EncryptedCache

## Credits

* Karl Bishop (IBM CCLA)
* Chris Felix (IBM CCLA)
