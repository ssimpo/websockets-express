import {unique, flatten} from './util';

const ignoreHeaders = ['upgrade', 'sec-websocket-key', 'sec-websocket-version', 'sec-websocket-extensions'];
const addHeaders = {
	Connection: 'keep-alive'
};

/**
 * Should a given request header be excluded in the new generated request? Used to remove upgrade style headers from
 * the generated request.
 *
 * @param {string} header		Header name to test.
 * @returns {boolean}			Should it be excluded.
 */
function excludeHeader(header) {
	return (Object.keys(addHeaders).includes(header.toString()) || ignoreHeaders.includes(header.toString().toLowerCase()));
}

/**
 * Given a request object and a message object, return a rawHeaders property for the request.
 *
 * @param {WebsocketRequest} req		The request to get rawHeaders on.
 * @param {Object} message				The associated websocket message.
 * @returns {Array.<string>}			The rawHeaders array.
 */
export function rawHeadersFactory(req, message) {
	let filterNext = false;

	return flatten(...Object.keys(addHeaders).map(headerName=>[headerName, addHeaders[headerName]])).concat(
		req.rawHeaders.map(header=>{
			if (!filterNext && !excludeHeader(header)) return header;
			filterNext = !filterNext;
		}).filter(
			header=>header
		)
	).concat(
		flatten(...Object.keys(message.headers).map(headerName=>[headerName, message.headers[headerName]])).map(header=>{
			if (!filterNext && !excludeHeader(header)) return header;
			filterNext = !filterNext;
		}).filter(
			header=>header
		)
	);
}

/**
 * Factory for generating headers for WebsocketRequest.
 *
 * @param {WebsocketRequest} req		The request to generate headers on.
 * @param {Object} message				The associated websocket message.
 * @returns {Proxy}						Headers object.
 */
export function requestHeadersFactory(req, message) {
	let headers = {};

	Object.keys(req.headers).forEach(_header=>{
		let header = _header.toLocaleLowerCase();
		if (!ignoreHeaders.includes(header)) headers[header] = req.headers[_header];
	});
	Object.keys(message.headers || {}).forEach(key=>{
		headers[key.toLocaleLowerCase()] = message.headers[key];
	});
	Object.keys(addHeaders).forEach(key=>{
		headers[key.toLocaleLowerCase()] = addHeaders[key];
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
			return unique(Reflect.ownKeys(target).concat(reqHeaders));
		}
	});
}