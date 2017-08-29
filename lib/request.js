'use strict';

const $private = new (require('./privateMembers'))();
const requestHeaders = require('./requestHeaders');
const typeis = require('type-is');
const util = require('./util');
const EventEmitter = require('events');

const rebind = {
	methods: ['accepts', 'acceptsCharsets', 'acceptsEncodings', 'acceptsLanguages', 'param'],
	properties: ['hostname', 'ip', 'ips', 'subdomains', 'cookies', 'signedCookies']
};

function rebinder(req, bindTo, properties) {
	properties.methods.forEach(method=>{
		bindTo[method] = req[method].bind(bindTo);
	});
	properties.properties.forEach(property=>Object.defineProperty(bindTo, property, {
    get: ()=>req[property],
    set: value=>{req[property] = value}
  }));
}

class WebsocketRequest extends EventEmitter {
	constructor(req, message) {
		super();

		this.method = message.method;
		this.headers = requestHeaders(req, message);
		this.websocketMessage = message;
		this.body = (util.isObject(message.body) ? Object.assign({}, message.body) : message.body || {});
		this.app = req.app;
		this.url = this.path = this.originalUrl = message.path;
		this.params = {};
		this.query = {};

		rebinder(req, this, rebind);
	}

	get fresh() {
		//;
	}

	get protocol() {
    return (this.secure ? 'wss' : 'ws');
  }

  get rawHeaders() {
    let headers = this.headers;
    return util.flatten(Object.keys(headers).map(headerName=>[headerName, headers[headerName]]));
  }

	get secure() {
    return $private.get(this, 'req').secure;
	}

  get websocket() {
    return true;
  }

	get xhr() {
		return false;
	}

	header(header) {
		return this.get(header);
	}

	get(header) {
		console.log("get()");
		return this.headers[header];
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