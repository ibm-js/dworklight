# dworklight : Dojo - Worklight Libraries
This project contains several modules to assist in using Dojo within the IBM Worklight platform.

## Status

No official release yet.

## Licensing

This project is distributed by the Dojo Foundation and licensed under the Dojo dual license [BSD/AFLv2 license](http://dojotoolkit.org/license).
All contributions require a [Dojo Foundation CLA](http://dojofoundation.org/about/claForm).

## Dependencies

This project requires the following other projects to run:
 * dojo
 * dojox/mobile

## Installation

* Manual installation by dropping dworklight as a sibling of the top level Dojo modules:
 * dojo
 * dworklight

 To install the latest master, go to the root Dojo installation directory and clone dworklight from github

 git clone git://github.com/ibm-dojo/dworklight.git

## Documentation

TODO, but here's the general modules

See the [kfbishop/dworklight-testapp](https://github.com/kfbishop/dworklight-testapp) project for tests and usage of the dworklight modules within a actual Worklight app.

### activity
Simple activity control that allows for native or Dojo basic activity indicators.

### console
WL console logging adapter

### deviceReady
Device Ready detection (taken from dcordova project)

### request
WL Adapter integration to feel more like a normal dojo/request style

### require
WL Custom AMD require support

### sniff
'Has' feature detection for WL

### env
Environment specific modules

#### env/android
Android specific support. Currently support back button handling

#### env/preload
Preloader to mock WL env and set device type.

### stores
Worklight Stores

#### stores/WorklightStore
API to enable direct access ot both JSONStore and EncryptedCache

## Credits

* Karl Bishop (IBM CCLA)
* Chris Felix (IBM CCLA)
