'use strict';

const $private = new (require('./privateMembers'))();

class WebsocketRequest {
	constructor(req) {
		$private.set(this, {
			req,
			app: req.app
		});
	}

	get app() {
		return $private.get(this, 'app');
	}

	get baseUrl() {
		//;
	}

	get body() {
		//;
	}

	set body(value) {
		//;
	}

	get cookies() {
		//;
	}

	set cookies(value) {
		//;
	}

	get fresh() {
		//;
	}

	get hostname() {
		//;
	}

	get ip() {
		//;
	}

	get ips() {
		//;
	}

	get originalUrl() {
		//
	}

	get params() {

	}

	get path() {

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

	get subdomains() {

	}

	get xhr() {

	}

	accepts(types) {

	}

	acceptsCharsets(charset) {

	}

	acceptsEncodings(encoding) {

	}

	acceptsLanguages(lang) {

	}

	get(value) {

	}

	is(type) {

	}

	param(name, defaultValue) {

	}

	range(size, options) {

	}
}

module.exports = WebsocketRequest;