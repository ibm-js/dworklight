{
  "stripConsole": "normal",
  "copyTests": false,
  "cssOptimize": "comments",
  "packages": [
    {
      "name": "dojo",
      "location": "./dojo"
    },
    {
      "name": "dijit",
      "location": "./dijit"
    },
    {
      "name": "dojox",
      "location": "./dojox"
    },
    {
      "name": "dcordova",
      "location": "./bower_components/dcordova"
    },
    {
      "name": "dworklight",
      "location": "./bower_components/dworklight"
    }
  ],
  "layers": {
    "dojo/dojo": {
      "include": [
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/selector/acme"
      ],
      "customBase": true
    }
  }
}