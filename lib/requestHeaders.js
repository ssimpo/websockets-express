'use strict';

const util = require('./util');

function requestHeadersFactory(req, message) {
	let headers = {};
	let _headers = Object.assign({}, req.headers, message.headers || {});
	Object.keys(_headers).forEach(key=>{
		headers[key.toLocaleLowerCase()] = _headers[key];
	});

	return new Proxy(headers, {
		get: (target, property, receiver)=>{
			return Reflect.get(target, property, receiver) || Reflect.get(req.headers, property, receiver);
		},

		set: (target, property, value, receiver)=>{
			return Reflect.set(target, property, value, receiver);
		},

		has: (target, property)=>{
			return Reflect.has(target, property) || Reflect.has(req.headers, property);
		},

		getOwnPropertyDescriptor(target, property) {
			if (Reflect.has(target, property)) return Reflect.getOwnPropertyDescriptor(target, property);
			if (Reflect.has(req, property)) return Reflect.getOwnPropertyDescriptor(req.headers, property);
		},

		ownKeys(target) {
			return util.unique(Reflect.ownKeys(target).concat(Reflect.ownKeys(req.headers)));
		}
	});
}

module.exports = requestHeadersFactory;