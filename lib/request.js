'use strict';

const requestHeaders = require('./requestHeaders');
const typeis = require('type-is');
const util = require('./util');
const EventEmitter = require('events');

const originalRequests = new WeakMap();
const originalMessages = new WeakMap();

const rebind = {
	methods: ['accepts', 'acceptsCharsets', 'acceptsEncodings', 'acceptsLanguages', 'param'],
	properties: ['hostname', 'ip', 'ips', 'subdomains', 'cookies', 'signedCookies', 'sessionID', 'session']
};


/**
 * Get the request body from a message object.
 *
 * @param {Object} message			Message object to get from.
 * @returns {Object}				The message body object.
 */
function getBody(message) {
	return util.isObject(message.body) ? Object.assign({}, message.body) : (message.body || {});
}

/**
 * Object to mixin to the Request object.
 *
 * @type {Object}
 */
const WebsocketRequestAbstract = {
	/**
	 * Get a header value.
	 *
	 * @param {string} header		The header to get.
	 * @returns {*}					The header value.
	 */
	get: function(header) {
		return this.headers[header];
	},

	/**
	 * Is the message of a given mime-type?
	 *
	 * @param {string|Array.<string>}		Mimetype(s) to match.
	 * @returns {boolean}					Does the request match one of the given mimetypes?
	 */
	is: function (...types) {
		return typeis(this, types);
	}
};

class WebsocketRequest extends EventEmitter {
	constructor(req, message, messageId) {
		super();

		util.defineProperty(this, 'body', getBody(message), true);
		util.defineProperty(
			this,
			['method', 'originalUrl', 'params', 'path', 'query', 'url'],
			[message.method, message.path, {}, message.path, {}, message.path]
		);

		util.definePropertyFixed(
			this,
			['app', 'headers', 'messageId', 'protocol', 'rawHeaders', 'secure', 'websocket', 'xhr', '_req'],
			[
				req.app,
				requestHeaders.requestHeadersFactory(req, message),
				messageId,
				(req.secure ? 'wss' : 'ws'),
				requestHeaders.rawHeadersFactory(req, message),
				req.secure,
				true,
				false,
				req
			]
		);

		util.rebinder(WebsocketRequestAbstract, this, {methods: Object.keys(WebsocketRequestAbstract)});
		util.rebinder(req, this, rebind);

		originalRequests.set(this, req);
		originalMessages.set(this, message);
	}
}

module.exports = WebsocketRequest;