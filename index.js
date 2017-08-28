'use strict';

const WebSocket = require('ws');
const http = require('http');

/**
 * Add getHeader() method to socket response object.  This is part of faking the express response object in
 * socket.io routes. Added method duplicates the express getHeader() method for use in socket.io route.
 *
 * @public
 * @param {Object} res        An express like response object.  This is not an express response object but is like one.
 * @returns {Object}          The express like response object, mutated to include getHeader() method.
 */
function socketIoGetHeaderMethod(res) {
	return headerName=>{
		res.headers[headerName];
	};
}

/**
 * Add status() method to socket response object.  This is part of faking the express response object in socket.io
 * routes. Added method duplicates the express status() method for use in socket.io route.
 *
 * @public
 * @param {Object} res        An express like response object.  This is not an express response object but is like one.
 * @returns {Object}          The express like response object, mutated to include status() method.
 */
function socketIoStatusMethod(res) {
	return statusCode=>{
		res.statusCode=statusCode;
		return res;
	};
}

function upgrade(server, app) {
	let wss = new WebSocket.Server({
		server,
		perMessageDeflate: false
	});

	wss.on('connection', (ws, req)=>{
		console.log('connected');

		ws.on('message', rawData=>{
			const message = JSON.parse(rawData);

			let res = {};

			Object.assign(res, {
				end: ()=>{},
				headers: {},
				headersSent: false,
				isWebSocket: true,
				redirect:(status, redirect)=>{
					if (res.statusCode !== 401) res.statusCode = status;
					message.path = redirect;
					return res.send({messageId: message.messageId});
				},
				send: ()=>{},
				set: (headerName, value)=>{
					res.headers[headerName] = value;
				},
				status: socketIoStatusMethod(res),
				statusCode: 200,
				type: ()=>{},
				websocket: ws,
				setHeader: (headerName, value)=>{
					res.headers[headerName] = value;
				}
			});

			app.handle(Object.assign({}, req, {
				method: message.method,
				path: message.path
			}), res);

			console.log('MESSAGE', message.type);
		});
	});

	return wss;
}


module.exports = {
	upgrade
};