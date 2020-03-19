# Angular Envelope

[![NPM version][npm-version-image]][npm-url]
[![Build Status][build-status-image]][build-status-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![Downloads][npm-downloads-image]][npm-url]

**This module has been deprecated, use [xhr-envelope][xhr-envelope-url] instead.**

A wrapper for the AngularJS $http service to allow for simpler RESTful API transactions.

## Client-Side Usage

Include the script in your main template file:
```html
<script src="/node_modules/angular-envelope/dist/envelope.js"></script>
```

Add the `envelope` dependency to the module you wish to use the service in, along with the `Envelope` service as a constructor argument:
```javascript
angular.module("meme-central", ["envelope"])

.config(function($stateProvider) {
	$stateProvider.state("memes", {
		url: "/memes",
		templateUrl: "memes.html",
		controller: "MemesController",
		controllerAs: "memesController"
	});
})

.controller("MemesController", function(Envelope) {
	var self = this;

	Envelope.setBaseUrl("http://127.0.0.1:3000");

	self.memes = [];

	self.getMemes = function() {
		return Envelope.get(
			"memes",
			{
				categoryId: 420
			},
			{
				timeout: 6969,
				headers: {
					Authorization: "dnkroz"
				}
			},
			function(error, data, response) {
				if(error) {
					return console.error(error);
				}

				self.memes = data;
			}
		);
	};

	self.forcedMeme = function() {
		return Envelope.post(
			"memes",
			{
				title: "Uganda Knuckles",
				phrase: "u do not kno da wae."
			},
			{
				authorization: "idspispopd"
			},
			function(error, data, response) {
				if(error) {
					return console.error(error);
				}

				self.memes.push(data);
			}
		);
	};
});
```

## Installation

To install this module:
```bash
npm install angular-envelope
```

[xhr-envelope-url]: https://github.com/nitro404/xhr-envelope

[npm-url]: https://www.npmjs.com/package/angular-envelope
[npm-version-image]: https://img.shields.io/npm/v/angular-envelope.svg
[npm-downloads-image]: http://img.shields.io/npm/dm/angular-envelope.svg

[build-status-url]: https://travis-ci.org/nitro404/angular-envelope
[build-status-image]: https://travis-ci.org/nitro404/angular-envelope.svg?branch=master

[coverage-url]: https://coveralls.io/github/nitro404/angular-envelope?branch=master
[coverage-image]: https://coveralls.io/repos/github/nitro404/angular-envelope/badge.svg?branch=master

[snyk-url]: https://snyk.io/test/github/nitro404/angular-envelope?targetFile=package.json
[snyk-image]: https://snyk.io/test/github/nitro404/angular-envelope/badge.svg?targetFile=package.json
