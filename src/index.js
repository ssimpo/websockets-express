(function(global, $){
	'use strict';

	const defaultSocketId = 'main';
	const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
	const callbacks = new Map();
	const acknowledgements = new Map();
	const sendQueue = new Map();
	const sockets = new Map();

	/**
	 * Generate a random string of specified length.
	 *
	 * @public
	 * @param {integer} [length=32] The length of string to return.
	 * @returns {string}            The random string.r
	 */
	function randomString(length=32) {
		if (! length) length = Math.floor(Math.random() * chars.length);

		let str = '';
		for (let i = 0; i < length; i++) str += chars[Math.floor(Math.random() * chars.length)];
		return str;
	}

	function createAcknowledge(resolve, reject) {
		return (err, response)=>{
			if (err) return reject(err);
			if ((response.status || 200) >= 400) return reject(err);
			return resolve(response);
		};
	}

	function ready(id=defaultSocketId) {
		if (!sockets.has(id)) return;
		const ws = sockets.get(id);
		return ((ws.readyState === ws.OPEN) ? ws : undefined);
	}

	function runSendQueue(id=defaultSocketId) {
		const _sendQueue = sendQueue.get(id);
		const ws = ready(id);
		if (_sendQueue && ws) {
			_sendQueue.forEach(message=>ws.send(message));
			_sendQueue.clear();
			sendQueue.delete(id);
		}
	}

	function send(message, id=defaultSocketId) {
		const ws = ready(id);
		if (ws) return ws.send(message);
		if (!sendQueue.has(id)) sendQueue.set(id, new Set());
		sendQueue.get(id).add(message);
	}

	function getCallbacks(type, id=defaultSocketId) {
		if (!callbacks.has(id)) callbacks.set(id, new Map());
		if (!callbacks.get(id).has(type)) callbacks.get(id).set(type, new Set());
		return callbacks.get(id).get(type);
	}

	function removeCallback(callbacks, callback) {
		callbacks.forEach(callbacks=>callbacks.delete(callback));
	}

	let websocketService = {
		connect: (url, id=defaultSocketId)=>{
			if (!sockets.has(id)) sockets.set(id, new WebSocket(url));
			const ws = sockets.get(id);

			ws.addEventListener('open', ()=>{
				ws.addEventListener('message', messageEvent=>{
					let message = JSON.parse(messageEvent.data);
					if (!message.id) {
						if (callbacks.has(message.type)) {
							callbacks.get(type).forEach(callbacks=>callback(message.data));
						}
					} else {
						if (acknowledgements.has(message.id)) {
							let acknowledgement = acknowledgements.get(message.id);
							if (message.type === 'error') {
								acknowledgement(message.data, null);
							} else {
								acknowledgement(null, message.data);
							}
							acknowledgements.delete(message.id);
						}
					}
				});

				runSendQueue(id);
			});
		},

		listen: (callback, type, id=defaultSocketId)=>{
			getCallbacks(type, id).add(callback);
			return ()=>getCallbacks(type, id).delete(callback);
		},

		removeListener: (callback, id)=>{
			if (id && callbacks.has(id)) return removeCallback(callbacks.get(id), callback);
			callbacks.forEach(callbacks=>removeCallback(callbacks, callback));
		},

		request: (path, body="", method="get")=>{
			return new Promise((resolve, reject)=>{
				let id = randomString();
				acknowledgements.set(id, createAcknowledge(resolve, reject));
				send(JSON.stringify({type:"request", id, data: {method, path, body}}));
			});
		}
	};

	if ($) $.websocket = websocketService;
	//if (global.angular) global.angular.module("websocket-express").factory("$websocket", websocketService);

})(window, window.jQuery);
