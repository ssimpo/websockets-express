'use strict';

const $private = new (require('./privateMembers'))();
const locals = require('./locals');
const util = require('./util');
const mime = require('mime');
const vary = require('vary');
const deprecate = require('depd')('express');
const contentDisposition = require('content-disposition');

class WebsocketResponse {
	constructor(req) {
		$private.set(this, {
			req,
			headersSent: false,
			locals: locals(),
			headers: {},
			status: 200
		});
	}

	get app() {
		return $private.get(this, 'req').app;
	}

	get headersSent() {
		return $private.get(this, 'headersSent');
	}

	set headersSent(value) {
		return $private.set(this, 'headersSent', !!value);
	}

	get locals() {
		return $private.get(this, 'locals');
	}

	append(field, val) {
		let prev = this.get(field);
		let value = val;

		if (prev) value = (Array.isArray(prev) ?
			prev.concat(val) :
			(Array.isArray(val) ? [prev].concat(val) : [prev, val])
		);

		return this.set(field, value);
	}

	attachment(filename) {
		if (filename) this.type(extname(filename));
		this.set('Content-Disposition', contentDisposition(filename));
		return this;
	}

	cookie(name, value, options) {

	}

	clearCookie(name, options) {

	}

	download(path, filename, fn) {

	}

	end(data, encoding) {

	}

	format(object) {

	}

	get(field) {
		return $private.get(this, 'headers')[field];
	}

	json(body) {

	}

	jsonp(body) {

	}

	links(links) {

	}

	location(path) {
		this.set('location', path);
	}

	redirect(status, path) {

	}

	render(view, locals, callback) {

	}

	send(body) {

	}

	sendFile(path, options, fn) {

	}

	sendStatus(statusCode) {

	}

	set(field, value) {
		const headers = $private.get(this, 'headers');
		if (util.isObject(field)) {
			Object.keys(field).forEach(header=>{
				headers[header] = field[header];
			});
		} else {
			headers[field] = value;
		}
	}

	status(code) {
		$private.set(this, 'status', code);
		return this;
	}

	type(type) {
		return this.set('Content-Type', ((type.indexOf('/') === -1) ? mime.lookup(type) : type));
	}

	vary(field) {
		if (!field || (Array.isArray(field) && !field.length)) {
			deprecate('res.vary(): Provide a field name');
			return this;
		}
		vary(this, field);
		return this;
	}
}

module.exports = WebsocketResponse;