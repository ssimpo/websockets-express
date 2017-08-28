'use strict';

const WebSocket = require('ws');
const http = require('http');
const Request = require('./lib/request');
const Response = require('./lib/response');

function upgrade(server, app) {
	let wss = new WebSocket.Server({
		server,
		perMessageDeflate: false
	});

	wss.on('connection', (ws, req)=>{
		console.log('connected');

		ws.on('message', rawData=>{
			const message = JSON.parse(rawData);

			app.handle(new Request(req, message), new Response(req));

			console.log('MESSAGE', message.type);
		});
	});

	return wss;
}


module.exports = {
	upgrade
};