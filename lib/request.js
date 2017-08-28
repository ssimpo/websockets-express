'use strict';

const $private = new (require('./privateMembers'))();
const requestHeaders = require('./requestHeaders');
const typeis = require('type-is');
const util = require('./util');

const rebind = {
	methods: ['accepts', 'acceptsCharsets', 'acceptsEncodings', 'acceptsLanguages'],
	properties: ['hostname', 'ip', 'ips', 'subdomains', 'cookies']
};

function rebinder(req, bindTo, properties) {
	properties.methods.forEach(method=>{
		bindTo[method] = req[method].bind(bindTo);
	});
	properties.properties.forEach(property=>{
		let descriptor = Object.getOwnPropertyDescriptor(req, property).bind(bindTo);
		descriptor.get = (!!descriptor.get ? descriptor.get.bind(bindTo) : ()=>(req[property]));
		descriptor.set = (!!descriptor.set ? descriptor.set.bind(bindTo) : value=>{req[property]=value;});
		Object.defineProperty(bindTo, property, descriptor);
	});
}

class WebsocketRequest {
	constructor(req, message) {
		let body = (util.isObject(message.body) ? Object.assign({}, message.body) : message.body || {});

		$private.set(this, {
			req,
			app: req.app,
			message,
			headers: requestHeaders(req, message),
			body,
			path: message.path
		});

		rebinder(req, this, rebind);
	}

	get app() {
		return $private.get(this, 'app');
	}

	get baseUrl() {
		//;
	}

	get body() {
		return $private.get(this, 'body');
	}

	set body(value) {
		return $private.set(this, 'body', value);
	}

	get fresh() {
		//;
	}

	get originalUrl() {
		//
	}

	get params() {

	}

	get path() {
		return $private(this, 'path');
	}

	get protocol() {

	}

	get query() {

	}

	get route() {

	}

	get secure() {

	}

	get signedCookies() {

	}

	get xhr() {
		return false;
	}

	get(header) {
		return $private(this, 'headers')[header];
	}

	is(type) {
		let arr = types;

		if (!Array.isArray(types)) {
			arr = new Array(arguments.length);
			for (var i = 0; i < arr.length; i++) arr[i] = arguments[i];
		}

		return typeis(this, arr);
	}

	param(name, defaultValue) {

	}

	range(size, options) {

	}
}

module.exports = WebsocketRequest;