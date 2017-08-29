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

	return new Proxy(headers, {
		get: (target, property, receiver)=>{
			return Reflect.get(target, property, receiver) ||
				((!ignoreHeaders.includes(property)) ? Reflect.get(req.headers, property, receiver) : undefined);
		},

		set: (target, property, value, receiver)=>{
			return Reflect.set(target, property, value, receiver);
		},

		has: (target, property)=>{
			return Reflect.has(target, property) ||
				((!ignoreHeaders.includes(property)) ? Reflect.has(req.headers, property) : undefined);
		},

		getOwnPropertyDescriptor(target, property) {
			if (Reflect.has(target, property)) return Reflect.getOwnPropertyDescriptor(target, property);
			if (!ignoreHeaders.includes(property) && Reflect.has(req.headers, property)) {
				return Reflect.getOwnPropertyDescriptor(req.headers, property);
			}
		},

		ownKeys(target) {
			let reqHeaders = Reflect.ownKeys(req.headers).filter(header=>!ignoreHeaders.includes(header));
			return util.unique(Reflect.ownKeys(target).concat(reqHeaders));
		}
	});
}

module.exports = requestHeadersFactory;