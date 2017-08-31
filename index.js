'use strict';

const ws = require('ws');
const BSON = require('bson');
const bson = new BSON();
const handleUpgrade = require('./lib/expressWebsocket');
const Request = require('./lib/request');
const Response = require('./lib/response');


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
				if (message.type = 'request') {
					message.data.headers = message.data.headers || {};
					Object.assign(message.data.headers, {
						'Content-Type': 'application/json',
						'Transfer-Encoding': 'identity',
						'Content-Length': _getContentLength(message.data.body)
					});

					let _req = new Request(req, message.data);
					let _res = new Response(_req, client, message.id, type);

					app.handle(_req, _res);
				}
			}
		});
	});
}

function upgrade(server, app) {
	const wss = new ws.Server({ noServer: true });
	server.on('upgrade', handleUpgrade(app, wss));
}

module.exports = {
	upgrade, websocketMiddleware
};
