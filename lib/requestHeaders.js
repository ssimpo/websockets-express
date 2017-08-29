'use strict';

const util = require('./util');

const ignoreHeaders = ['upgrade', 'sec-websocket-key', 'sec-websocket-version'];

function requestHeadersFactory(req, message) {
	let headers = {};

	Object.keys(req.headers).forEach(_header=>{
		let header = _header.toLocaleLowerCase();
		if (!ignoreHeaders.includes(header)) headers[header] = req.headers[_header];
	});
	Object.keys(message.headers || {}).forEach(key=>{
		headers[key.toLocaleLowerCase()] = message.headers[key];
	});

	return headers;
}

module.exports = requestHeadersFactory;