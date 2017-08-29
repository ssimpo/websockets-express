'use strict';

const locals = require('./locals');
const util = require('./util');
const mime = require('mime');
const vary = require('vary');
const deprecate = require('depd')('express');
const contentDisposition = require('content-disposition');

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

	},

	jsonp: function(body) {

	},

	links: function(links) {

	},

	location: function(path) {
		this.set('location', path);
	},

	redirect: function(status, path) {

	},

	render: function(view, locals, callback) {

	},

	send: function(body) {

	},

	sendFile: function(path, options, fn) {

	},

	sendStatus: function(statusCode) {

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
		this.status = code;
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
	constructor(req) {
		util.definePropertyFixed(this, 'locals', locals());
		util.definePropertyFixed(this, 'req', req);
		util.definePropertyFixed(this, 'app', req.app);
		util.defineProperty(this, 'headers', {});
		util.defineProperty(this, 'headersSent', false);
		util.defineProperty(this, 'status', 200);

		util.rebinder(WebsocketResponseAbstract, this, {methods: Object.keys(WebsocketResponseAbstract)});
	}
}

module.exports = WebsocketResponse;