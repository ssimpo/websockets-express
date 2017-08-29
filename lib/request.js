'use strict';

const requestHeaders = require('./requestHeaders');
const typeis = require('type-is');
const util = require('./util');
const EventEmitter = require('events');

const rebind = {
	methods: ['accepts', 'acceptsCharsets', 'acceptsEncodings', 'acceptsLanguages', 'param'],
	properties: ['hostname', 'ip', 'ips', 'subdomains', 'cookies', 'signedCookies']
};


function getBody(message) {
	return util.isObject(message.body) ? Object.assign({}, message.body) : (message.body || {});
}

function getRawHeaders(headers) {
	return util.flatten(Object.keys(headers).map(headerName=>[headerName, headers[headerName]]));
}

const WebsocketRequestAbstract = {
	get: function(header) {
		return this.headers[header];
	},

	is: function (type) {
		let arr = types;

		if (!Array.isArray(types)) {
			arr = new Array(arguments.length);
			for (var i = 0; i < arr.length; i++) arr[i] = arguments[i];
		}

		return typeis(this, arr);
	}
};

class WebsocketRequest extends EventEmitter {
	constructor(req, message) {
		super();

		util.definePropertyFixed(this, 'app', req.app);
		util.defineProperty(this, 'body', getBody(message), true);
		util.definePropertyFixed(this, 'headers', requestHeaders(req, message));
		util.defineProperty(this, 'method', message.method);
		util.defineProperty(this, 'originalUrl', message.path);
		util.defineProperty(this, 'params', {});
		util.defineProperty(this, 'path', message.path);
		util.definePropertyFixed(this, 'protocol', (req.secure ? 'wss' : 'ws'));
		util.defineProperty(this, 'query', {});
		util.definePropertyFixed(this, 'rawHeaders', getRawHeaders(this.headers));
		util.definePropertyFixed(this, 'secure', req.secure);
		util.defineProperty(this, 'url', message.path);
		util.definePropertyFixed(this, 'websocket', true);
		util.definePropertyFixed(this, 'websocketMessage', message);
		util.definePropertyFixed(this, 'websocketRequest', req);
		util.definePropertyFixed(this, 'xhr', false);

		util.rebinder(WebsocketRequestAbstract, this, {methods: Object.keys(WebsocketRequestAbstract)});
		util.rebinder(req, this, rebind);
	}
}

module.exports = WebsocketRequest;