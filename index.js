'use strict';

const ws = require('ws');
const BSON = require('bson');
const bson = new BSON();
const handleUpgrade = require('./lib/expressWebsocket');
const Request = require('./lib/request');
const Response = require('./lib/response');
const EventEmitter = require('events');
const $private = new WeakMap();

/**
 * Get the length of a message object. Used to fake the content-length header in socket.io routes.
 *
 * @private
 * @param {*} message     Message to get length of.  This is assumed to be an object.
 * @returns {number}      Message length.
 */
function _getContentLength(message) {
	let txt;

	try {
		txt = JSON.stringify(message || {});
	} catch(error) {
		try {
			txt = message.toString();
		} catch(error) {
			txt = " ";
		}
	}

	return txt.toString().length.toString();
}


function websocketMiddleware(req, res, next) {
	if (!!req.websocket || !req.headers || req.headers.upgrade === undefined || req.headers.upgrade.toLowerCase() !== 'websocket') {
		return next();
	}

	res.websocket((client, app)=>{
		client.on('message', rawData=>{
			let message, type;
			if (typeof rawData === 'string') {
				try {
					message = JSON.parse(rawData);
					type = 'json';
				} catch(err) {
					message = undefined;
				}
			} else {
				try {
					message = bson.deserialize(rawData);
					type = 'bson';
				} catch(err) {
					message = undefined;
				}
			}
			if (message && message.type) {
				if ((message.type === 'request') || (message.type === 'upload')) {
					if (!app.uploadTracking.has(message.id)) {
						if (message.type === 'upload') app.uploadTracking.set(message.id);
						message.data.headers = message.data.headers || {};
						Object.assign(message.data.headers, {
							'Content-Type': 'application/json',
							'Transfer-Encoding': 'identity',
							'Content-Length': _getContentLength(message.data.body)
						});

						let _req = new Request(req, message.data, message.id);
						let _res = new Response(_req, client, message.id, type);

						if (message.type = 'upload') {
							_req.fileName = message.data.fileName;
							_req.fileSize = message.data.fileSize;
						}

						app.handle(_req, _res);
					} else {
						app.uploadTracking.push(message.id, message.data.body);
					}
				}
			}
		});
	});
}

class uploadTracking extends EventEmitter {
	constructor() {
		super();
		$private.set(this, new Map());
	}

	push(id, chunk) {
		if (!this.has(id)) this.set(id);
		$private.get(this).get(id).push(chunk);
		this.emit(id, 'chunk');
	}

	set(id) {
		if (!this.has(id)) $private.get(this).set(id, []);
	}

	has(id) {
		return $private.get(this).has(id);
	}

	next(id) {
		if (this.has(id) && (this.size(id) > 0)) return $private.get(this).get(id).shift();
	}

	size(id) {
		if (this.has(id)) return $private.get(this).get(id).length;
		return 0;
	}

	clear(id) {
		$private.get(this).delete(id);
	}
}

function upgrade(server, app) {
	const wss = new ws.Server({ noServer: true });
	server.on('upgrade', handleUpgrade(app, wss));
	app.uploadTracking = new uploadTracking();
}

module.exports = {
	upgrade, websocketMiddleware
};
