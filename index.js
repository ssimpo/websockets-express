'use strict';

const ws = require('ws');
const handleUpgrade = require('./lib/expressWebsocket');
const Request = require('./lib/request');
const Response = require('./lib/response');

function websocketMiddleware(req, res, next) {
	if (!!req.websocket || !req.headers || req.headers.upgrade === undefined || req.headers.upgrade.toLowerCase() !== 'websocket') {
		return next();
	}

	res.websocket((client, app)=>{
		client.on('message', rawData=>{
			const message = JSON.parse(rawData);

			if (message.type = 'request') {
				let _req = new Request(req, message.data);
				let _res = new Response(_req, client, message.id);
				app.handle(_req, _res);
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
