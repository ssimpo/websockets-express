'use strict';

const locals = require('./locals');
const util = require('./util');
const mime = require('mime');
const vary = require('vary');
const deprecate = require('depd')('express');
const contentDisposition = require('content-disposition');
const BSON = require('bson');
const bson = new BSON();

const clients = new WeakMap();
const messageIdIds = new WeakMap();
const messageRecieveType = new WeakMap();

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

function sendMessage(res, message) {
	const type = messageRecieveType.get(res);
	const client = clients.get(res);
	if (client) {
		if (type === 'bson') {
			client.send(bson.serialize(message));
		} else if (type === 'json') {
			client.send(JSON.stringify(message));
		}
	}
}

const WebsocketResponseAbstract = {
	append: function(field, val) {
		let prev = this.get(field);
		let value = val;

		if (prev) value = (Array.isArray(prev) ?
				prev.concat(val) :
				(Array.isArray(val) ? [prev].concat(val) : [prev, val])
		);

		return this.set(field, value);
	},

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

	get: function(field) {
		return this.headers[field];
	},

	getHeader: function(field) {
		return this.get(field);
	},

	getHeaderNames: function() {
		return Object.keys(this.headers).sort();
	},

	getHeaders: function() {
		return this.headers;
	},

	hasHeader: function(header) {
		return (header in this.headers);
	},

	json: function(body) {
		this.type('application/json');
		return this.send(body);
	},

	jsonp: function(body) {
		this.type('application/javascript');
		let response = createResponseMessage(this, body);
		response.data.callback = this.app.get('jsonp callback name') || 'callback';
		return this.send(body);
	},

	links: function(links) {

	},

	location: function(path) {
		this.set('location', path);
	},

	redirect: function(status, path) {
		this.status(status);
		this.type('plain/text');
		this.send(path);
	},

	render: function(view, locals, callback) {

	},

	send: function(body) {
		sendMessage(this, createResponseMessage(this, body));
		return this;
	},

	sendFile: function(path, options, fn) {

	},

	sendStatus: function(statusCode) {
		this.status(statusCode);
		this.type('plain/text');
		this.send(this.statusMessage);
	},

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

	setHeader: function(header, value) {
		return this.set(header, value);
	},

	status: function(code) {
		this.statusCode = code;
		return this;
	},

	type: function(type) {
		return this.set('Content-Type', ((type.indexOf('/') === -1) ? mime.lookup(type) : type));
	},

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
		util.definePropertyFixed(this, 'locals', locals());
		util.definePropertyFixed(this, 'req', req);
		util.definePropertyFixed(this, 'app', req.app);
		util.defineProperty(this, 'headers', {});
		util.defineProperty(this, 'headersSent', false);
		util.defineProperty(this, 'statusCode', 200);
		util.defineProperty(this, 'statusMessage', 'Ok');
		util.definePropertyFixed(this, 'websocketClient', client);

		util.rebinder(WebsocketResponseAbstract, this, {methods: Object.keys(WebsocketResponseAbstract)});

		clients.set(this, client);
		messageIdIds.set(this, messageId);
		messageRecieveType.set(this, type)
	}
}

module.exports = WebsocketResponse;