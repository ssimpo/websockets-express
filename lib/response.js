'use strict';

const $private = new (require('./privateMembers'))();
const locals = require('./locals');
const util = require('./util');

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

	append(feild, value) {

	}

	attachment(filename) {

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

	}

	vary(field) {

	}
}

module.exports = WebsocketResponse;