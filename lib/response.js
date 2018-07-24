'use strict';

const util = require('./util');
const mime = require('mime');
const vary = require('vary');
const deprecate = require('depd')('express');
const contentDisposition = require('content-disposition');
const statuses = require('statuses');

const clients = new WeakMap();
const messageIdIds = new WeakMap();
const messageRecieveType = new WeakMap();

/**
 * Create a new message as a response from given WebsocketResponse and body object.
 *
 * @param {WebsocketResponse} res		Response instance.
 * @param {Object|*} body				Body object.
 * @returns {Object}					New response message.
 */
function createResponseMessage(res, body) {
	return {
		id: messageIdIds.get(res),
		type: 'response',
		data: {
			path: res.req.originalUrl,
			body,
			headers: res.headers || {},
			status: res.statusCode,
			statusMessage: res.statusMessage || '',
			type: res.get('Content-Type') || 'application/json'
		}
	};
}

/**
 * Send a message, using the given response instance and message.
 *
 * @param {WebsocketResponse} res		The request object.
 * @param {Object} message				The message object.
 * @param {WebsocketResponse}			For chaining.
 */
function sendMessage(res, message) {
	const type = messageRecieveType.get(res);
	const client = clients.get(res);
	if (client) client.send(JSON.stringify(message));
	res.headersSent = true;
	return res;
}
/**
 * Mixin for WebsocketResponse instances.
 *
 * @type {Object}
 */
const WebsocketResponseAbstract = {
	/**
	 * Append additional header `field` with value `val`.
	 *
	 * Example:
	 *
	 *    res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
	 *    res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
	 *    res.append('Warning', '199 Miscellaneous warning');
	 *
	 * @public
	 * @param {String} field			Field to set.
	 * @param {String|Array} val		Value to set.
	 * @return {WebsocketResponse} 		For chaining.
	 */
	append: function(field, val) {
		let prev = this.get(field);
		let value = val;

		if (prev) value = (Array.isArray(prev) ?
				prev.concat(val) :
				(Array.isArray(val) ? [prev].concat(val) : [prev, val])
		);

		return this.set(field, value);
	},

	/**
	 * Set _Content-Disposition_ header to _attachment_ with optional `filename`.
	 *
	 * @public
	 * @param {String} filename			Filename to set it to.
	 * @return {WebsocketResponse}		For chaining.
	 */
	attachment: function(filename) {
		if (filename) this.type(extname(filename));
		this.set('Content-Disposition', contentDisposition(filename));
		return this;
	},

	cookie: function(name, value, options) {

	},

	clearCookie: function(name, options) {

	},

	download: function(path, filename, fn) {

	},

	end: function(data, encoding) {

	},

	format: function(object) {

	},

	/**
	 * Get a specific header value.
	 *
	 * @param {string} field		The header to het.
	 * @returns {*}					The header value.
	 */
	get: function(field) {
		return this.headers[field];
	},

	/**
	 * Get a specific header value.
	 *
	 * @param {string} field		The header to het.
	 * @returns {*}					The header value.
	 */
	getHeader: function(field) {
		return this.get(field);
	},

	/**
	 * Get all the header names.
	 *
	 * @returns {Array.<string>}		Array of header names.
	 */
	getHeaderNames: function() {
		return Object.keys(this.headers).sort();
	},

	/**
	 * Get all the headers.
	 *
	 * @returns {Object}		The headers object.
	 */
	getHeaders: function() {
		return this.headers;
	},

	/**
	 * Test if response has a particular header.
	 *
	 * @param {string} header		Header to test.
	 * @returns {boolean}			Does it have given header?
	 */
	hasHeader: function(header) {
		return (header in this.headers);
	},

	/**
	 * Send JSON response.
	 *
	 * Examples:
	 *
	 *     res.json(null);
	 *     res.json({ user: 'tj' });
	 *
	 * @public
	 * @param {string|number|boolean|object} body		Body to send.
	 * @return {WebsocketResponse} 						For chaining.
	 */
	json: function(body) {
		this.type('application/json');
		return this.send(body);
	},

	/**
	 * Send JSON response with JSONP callback support.
	 *
	 * Examples:
	 *
	 *     res.jsonp(null);
	 *     res.jsonp({ user: 'tj' });
	 *
	 * @public
	 * @param {string|number|boolean|object} body		Body to send.
	 * @return {WebsocketResponse} 						For chaining
	 */
	jsonp: function(body) {
		this.type('application/javascript');
		let response = createResponseMessage(this, body);
		response.data.callback = this.app.get('jsonp callback name') || 'callback';
		return this.send(body);
	},

	links: function(links) {

	},

	/**
	 * Set the location header to `url`.
	 *
	 * The given `url` can also be "back", which redirects to the _Referrer_ or _Referer_ headers or "/".
	 *
	 * Examples:
	 *
	 *    res.location('/foo/bar').;
	 *    res.location('http://example.com');
	 *    res.location('../login');
	 *
	 * @public
	 * @param {String} url				Url to set location to.
	 * @return {WebsocketResponse} 		For chaining
	 */
	location: function(path) {
		this.set('location', path);
	},

	/**
	 * Redirect to the given `url` with optional response `status` defaulting to 302.
	 *
	 * The resulting `url` is determined by `res.location()`, so it will play nicely with mounted apps, relative paths,
	 * `"back"` etc.
	 *
	 * Examples:
	 *
	 *    res.redirect('/foo/bar');
	 *    res.redirect('http://example.com');
	 *    res.redirect(301, 'http://example.com');
	 *    res.redirect('../login'); // /blog/post/1 -> /blog/login
	 *
	 * @public
	 * @param {number} [status=302]		Status to send.
	 * @param {string} path				Path to redirect to.
	 * @return {WebsocketResponse} 		For chaining.
	 */
	redirect: function(status, path) {
		if (!path) [status, path] = [302, status];
		this.status(status);
		this.type('plain/text');
		this.send(path);
	},

	render: function(view, locals, callback) {

	},

	/**
	 * Send a response.
	 *
	 * Examples:
	 *
	 *     res.send(Buffer.from('wahoo'));
	 *     res.send({ some: 'json' });
	 *     res.send('<p>some html</p>');
	 *
	 * @public
	 * @param {string|number|boolean|object|Buffer} body		Message body to send.
	 * @return {WebsocketResponse} 								For chaining.
	 */
	send: function(body) {
		return sendMessage(this, createResponseMessage(this, body));
	},

	sendFile: function(path, options, fn) {

	},

	/**
	 * Send given HTTP status code and message.
	 *
	 * Sets the response status to `statusCode` and the body of the response to the standard description from node's
	 * http.STATUS_CODES or the statusCode number if no description.
	 *
	 * Examples:
	 *
	 *     res.sendStatus(200);
	 *
	 * @public
	 * @param {number} statusCode														Code to send.
	 * @param {string} [statusMessage=statuses[statusCode] || this.statusMessage]		Message to send.
	 * @return {WebsocketResponse} 														For chaining.
	 */
	sendStatus: function(statusCode, statusMessage=statuses[statusCode] || this.statusMessage) {
		this.status(statusCode);
		this.type('plain/text');
		this.send(statusMessage);
	},

	/**
	 * Set header `field` to `val`, or parse an object of header fields.
	 *
	 * Examples:
	 *
	 *    res.set('Foo', ['bar', 'baz']);
	 *    res.set('Accept', 'application/json');
	 *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
	 *
	 * @public
	 * @param {String|Object} field		Header to set
	 * @param {String|Array} val		Value to set header to.
	 * @return {WebsocketResponse} 		For chaining.
	 */
	set: function(field, value) {
		const headers = this.headers;
		if (util.isObject(field)) {
			Object.keys(field).forEach(header=>{
				headers[header] = field[header];
			});
		} else {
			headers[field] = value;
		}
	},

	/**
	 * Set header `field` to `val`, or parse an object of header fields.
	 *
	 * Examples:
	 *
	 *    res.set('Foo', ['bar', 'baz']);
	 *    res.set('Accept', 'application/json');
	 *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
	 *
	 * @public
	 * @param {String|Object} field		Header to set
	 * @param {String|Array} val		Value to set header to.
	 * @return {WebsocketResponse} 		For chaining.
	 */
	setHeader: function(header, value) {
		return this.set(header, value);
	},

	/**
	 * Set status `code`.
	 *
	 * @public
	 * @param {Number} code				Status code.
	 * @return {WebsocketResponse}		For chaining.
	 */
	status: function(code) {
		this.statusCode = code;
		this.statusMessage = statuses[code];
		return this;
	},

	/**
	 * Set _Content-Type_ response header with `type` through `mime.lookup()` when it does not contain "/", or set the
	 * Content-Type to `type` otherwise.
	 *
	 * Examples:
	 *
	 *     res.type('.html');
	 *     res.type('html');
	 *     res.type('json');
	 *     res.type('application/json');
	 *     res.type('png');
	 *
	 * @public
	 * @param {String} type				Mimetype string.
	 * @return {WebsocketResponse}		For chaining.
	 */
	type: function(type) {
		return this.set('Content-Type', ((type.indexOf('/') === -1) ? mime.lookup(type) : type));
	},

	/**
	 * Add `field` to Vary. If already present in the Vary set, then this call is simply ignored.
	 *
	 * @public
	 * @param {Array|String} field		Field to vary.
	 * @return {WebsocketResponse}		For chaining.
	 */
	vary: function(field) {
		if (!field || (Array.isArray(field) && !field.length)) {
			deprecate('res.vary(): Provide a field name');
			return this;
		}
		vary(this, field);
		return this;
	}
};

class WebsocketResponse {
	constructor(req, client, messageId, type) {
		util.defineProperty(this, ['headers', 'headersSent', 'statusCode', 'statusMessage'], [{}, false, 200, 'Ok']);
		util.definePropertyFixed(
			this,
			['locals', 'req', 'app', 'websocketClient'],
			[{}, req, req.app, client]
		);

		util.rebinder(WebsocketResponseAbstract, this, {methods: Object.keys(WebsocketResponseAbstract)});

		clients.set(this, client);
		messageIdIds.set(this, messageId);
		messageRecieveType.set(this, type)
	}
}

module.exports = WebsocketResponse;