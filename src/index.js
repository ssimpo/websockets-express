(function($){
	'use strict';

	let ws;
	let callbacks = new Map();
	let acknowledgements = new Map();
	let sendQueue = new Set();
	let ready = false;

	/**
	 * Generate a random string of specified length.
	 *
	 * @public
	 * @param {integer} [length=32] The length of string to return.
	 * @returns {string}            The random string.r
	 */
	function randomString(length=32) {
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

		if (! length) {
			length = Math.floor(Math.random() * chars.length);
		}

		var str = '';
		for (var i = 0; i < length; i++) {
			str += chars[Math.floor(Math.random() * chars.length)];
		}
		return str;
	}

	function createAcknowledge(resolve, reject) {
		return (err, response)=>{
			if (err) return reject(err);
			if ((response.status || 200) >= 400) return reject(err);
			return resolve(response);
		};
	}

	function send(message) {
		if (ready) {
			ws.send(message);
		} else {
			sendQueue.add(message);
		}
	}

	$.websocket = {
		connect: url=>{
			if (!ws) {
				ws = new WebSocket(url);

				ws.addEventListener('open', ()=>{
					ready = true;

					ws.addEventListener('message', messageEvent=>{
						let message = JSON.parse(messageEvent.data);
						if (!message.id) {
							if (callbacks.has(message.type)) callbacks.get(type).forEach(callbacks=>callback(message.data));
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

					sendQueue.forEach(message=>ws.send(message));
				});
			}
		},

		listen: (callback, type)=>{
			if (!callbacks.has(type)) callbacks.set(type, new Set());
			callbacks.get(type).add(callback);
			return ()=>callback.get(type).delete(callback);
		},

		removeListener: callback=>{
			callbacks.forEach(callbacks=>{
				if (callbacks.has(callback)) callbacks.delete(callback);
			});
		},

		request: (path, method="get")=>{
			return new Promise((resolve, reject)=>{
				let id = randomString();
				acknowledgements.set(id, createAcknowledge(resolve, reject));
				send(JSON.stringify({type:"request", id, data: {method, path}}));
			});
		}
	};

})(jQuery);
