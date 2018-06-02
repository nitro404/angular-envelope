(function(root, factory) {
	if(typeof define === "function" && define.amd) { define(["angular"], factory); }
	else { factory(angular); }
}(this, function(angular) {

	"use strict";

	(function() {

		angular.module("envelope")

		.service("Envelope", function($http) {
			var self = this;

			var validMethods = ["HEAD", "GET", "POST", "PUT", "PATCH", "DELETE"]

			var defaultOptions = {
				baseUrl: null,
				authorization: null,
				timeout: 30000
			};

			self.hasBaseUrl = function() {
				return utilities.isNonEmptyString(defaultOptions.baseUrl);
			};

			self.getBaseUrl = function() {
				return defaultOptions.baseUrl;
			};

			self.setBaseUrl = function(url) {
				if(utilities.isEmptyString(url)) {
					return;
				}

				defaultOptions.baseUrl = url;
			};

			self.clearBaseUrl = function() {
				defaultOptions.baseUrl = null;
			};

			self.hasAuthorization = function() {
				return utilities.isNonEmptyString(defaultOptions.authorization);
			};

			self.getAuthorization = function() {
				return defaultOptions.authorization;
			};

			self.setAuthorizationToken = function(token) {
				if(utilities.isEmptyString(token)) { return; }

				defaultOptions.authorization = token;
			};

			self.setBasicAuthorization = function(userName, password) {
				if(utilities.isEmptyString(userName) || utilities.isEmptyString(password)) { return; }

				defaultOptions.authorization = "Basic " + btoa(userName + ":" + password);
			};

			self.clearAuthorization = function() {
				defaultOptions.authorization = null;
			};

			self.hasTimeout = function() {
				return utilities.isValid(defaultOptions.timeout);
			};

			self.getTimeout = function() {
				return defaultOptions.timeout;
			};

			self.setTimeout = function(timeout) {
				var formattedTimeout = utilities.parseInteger(timeout);

				if(utilities.isInvalidNumber(formattedTimeout) || formattedTimeout < 1) {
					return;
				}

				defaultOptions.timeout = formattedTimeout;
			};

			self.clearTimeout = function() {
				defaultOptions.timeout = null;
			};

			self.request = function(method, path, data, query, options, callback) {
				if(utilities.isFunction(data)) {
					callback = data;
					options = null;
					query = null;
					data = null;
				}
				else if(utilities.isFunction(query)) {
					callback = query;
					options = null;
					query = null;
				}
				else if(utilities.isFunction(options)) {
					callback = options;
					options = null;
				}

				if(!utilities.isFunction(callback)) {
					throw new Error("Missing or invalid callback function!");
				}

				if(utilities.isEmptyString(method)) {
					return callback(new Error("Missing or invalid method type."));
				}

				var formattedMethod = method.toUpperCase().trim();
				var isUpload = formattedMethod === "UPLOAD";

				if(isUpload) {
					formattedMethod = "POST";
				}

				var validMethod = false;

				for(var i=0;i<validMethods.length;i++) {
					if(formattedMethod === validMethods[i]) {
						validMethod = true;
						break;
					}
				}

				if(!validMethod) {
					return callback(new Error("Invalid method type: \"" + formattedMethod + "\" - expected one of: " + validMethods.join(", ") + "."));
				}

				var hasBody = formattedMethod === "POST" ||
							  formattedMethod === "PUT" ||
							  formattedMethod === "PATCH";

				if(utilities.isValid(data) && !hasBody) {
					options = query;
					query = data;
					data = null;
				}

				var newOptions = utilities.isObjectStrict(options) ? utilities.clone(options) : { };
				newOptions.method = formattedMethod;

				if(newOptions.timeout !== null && !Number.isInteger(newOptions.timeout)) {
					newOptions.timeout = defaultOptions.timeout;
				}

				if(utilities.isInvalid(newOptions.timeout)) {
					delete newOptions.timeout;
				}

				if(utilities.isEmptyString(newOptions.baseUrl) && utilities.isNonEmptyString(defaultOptions.baseUrl)) {
					newOptions.baseUrl = defaultOptions.baseUrl;
				}

				newOptions.url = utilities.joinPaths(utilities.isNonEmptyString(newOptions.baseUrl) ? newOptions.baseUrl : defaultOptions.baseUrl, path);

				if(utilities.isObject(query)) {
					newOptions.params = query;
				}

				if(hasBody && utilities.isValid(data)) {
					newOptions.data = data;
				}

				if(!utilities.isObject(newOptions.headers)) {
					newOptions.headers = { };
				}

				if(isUpload) {
					newOptions.transformRequest = angular.identity;

					newOptions.headers["Content-Type"] = undefined;
				}
				else if(utilities.isEmptyString(newOptions.headers["Content-Type"])) {
					newOptions.headers["Content-Type"] = "application/json";
				}

				if(utilities.isEmptyString(newOptions.headers["Accepts"])) {
					newOptions.headers["Accepts"] = "application/json";
				}

				if(utilities.isValid(newOptions.authorization)) {
					if(utilities.isNonEmptyString(newOptions.authorization)) {
						if(utilities.isNonEmptyString(newOptions.headers["Authorization"])) {
							console.error("Authorization specified in header data is being overridden by authorization at root level of options.");
						}

						newOptions.headers["Authorization"] = newOptions.authorization;
					}

					delete newOptions.authorization;
				}

				if(utilities.isEmptyString(newOptions.headers["Authorization"])) {
					if(utilities.isNonEmptyString(defaultOptions.authorization)) {
						newOptions.headers["Authorization"] = defaultOptions.authorization;
					}
				}

				$http(newOptions).then(
					function successCallback(response) {
						if(utilities.isObject(response.data) && utilities.isObject(response.data.error)) {
							return callback(utilities.createError(response.data.error, response.status), response.data, response);
						}

						return callback(null, response.data, response);
					},
					function errorCallback(response) {
						if(utilities.isObject(response.data)) {
							if(utilities.isObject(response.data.error)) {
								return callback(utilities.createError(response.data.error, response.status), response.data, response);
							}

							return callback(null, response.data, response);
						}

						return callback(utilities.createError("Server connection failed!", 500), null, response);
					}
				);
			};

			self.head = function(path, data, query, options, callback) {
				return self.request("HEAD", path, data, query, options, callback);
			};

			self.get = function(path, data, query, options, callback) {
				return self.request("GET", path, data, query, options, callback);
			};

			self.post = function(path, data, query, options, callback) {
				return self.request("POST", path, data, query, options, callback);
			};

			self.put = function(path, data, query, options, callback) {
				return self.request("PUT", path, data, query, options, callback);
			};

			self.patch = function(path, data, query, options, callback) {
				return self.request("PATCH", path, data, query, options, callback);
			};

			self.delete = function(path, data, query, options, callback) {
				return self.request("DELETE", path, data, query, options, callback);
			};

			self.upload = function(path, data, query, options, file, callback) {
				var fileDescriptor = new FormData();

				if(utilities.isValid(file)) {
					fileDescriptor.append("file", file);
				}

				if(utilities.isObject(data)) {
					angular.forEach(
						data,
						function(value, attribute) {
							if(attribute === "file") {
								continue;
							}

							fileDescriptor.append(attribute, data[attribute]);
						}
					);
				}

				return self.request("UPLOAD", path, fileDescriptor, query, options, callback);
			};

		});

	})();

}));
