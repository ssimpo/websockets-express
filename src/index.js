(function(global, $){
	'use strict';

	let buffer = global.buffer;
	let ready = false;

	const afterReady = new Set();
	const defaultSocketId = 'main';
	const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
	const endpoints = new Map();
	const callbacks = new Map();
	const acknowledgements = new Map();
	const sendQueue = new Map();
	const sockets = new Map();
	const parsers = new Map();
	const status = new Map();
	const SOCKETSTATUS = Object.freeze({
		CONNECTING: 1,
		RECONNECTING: 2,
		CLOSED: 3,
		CONNECTED: 4
	});


	/**
	 * Initiate this module, binding into all the correct global and framework points.
	 */
	function init() {
		global.document.addEventListener("DOMContentLoaded", onReady);
		if ($) $.websocket = new WebSocketService();
		if (global.angular) global.angular.module("websocket-express", []).factory("$websocket", ()=>new WebSocketService());

		if (!$ && !global.angular) {
			if (global.bolt) {
				global.bolt.WebSocketService = WebSocketService;
			} else {
				global.BoltWebSocketService = WebSocketService;
			}
		}
	}

	/**
	 * Function to call when document is ready.  Only run once to perform all waiting websocket messages.
	 */
	function onReady() {
		setEndpoints();
		ready = true;
		afterReady.forEach(callback=>callback());
		afterReady.clear();
		global.document.removeEventListener("DOMContentLoaded", init);
	}


	/**
	 * Search through all the locations for websocket endpoint definitions setting these.  Will use defaults if non
	 * found. These can be defined in <link rel="websocket-endpoint"> tags, where the title attribute is the endpoint
	 * name and the href is the endpoint.
	 */
	function setEndpoints() {
		setDefaultEndPoint();

		let endpointLinkElements = global.document.querySelectorAll("link[rel=websocket-endpoint][href]");
		if (endpointLinkElements.length) {
			for (let n=0; n < endpointLinkElements.length; n++) {
				let url = (endpointLinkElements[n].getAttribute("href") || "").trim();
				if (url !== "") {
					let title = (endpointLinkElements[n].getAttribute("title") || "").trim();
					if (title === "") title = defaultSocketId;
					endpoints.set(title, url);
				}
			}
		}
	}

	/**
	 * Set the endpoint of the default endpoint, searching all the definition points for this.
	 */
	function setDefaultEndPoint() {
		let origin = global.location.origin;
		let baseElement = global.document.querySelector("base[href]");
		let url;
		if (baseElement) {
			let base = (baseElement.getAttribute("href") || "").trim().replace(origin, "");
			if (base !== "") url = origin+base;
		} else {
			url = origin+'/';
		}

		url = url.replace("https://", "wss://").replace("http://", "ws://");

		endpoints.set(defaultSocketId, url);
	}

	/**
	 * Check if a status property is not one of a number of enum values.
	 *
	 * @param {*} status			Status to check.
	 * @param {Object} enumeral		Enum to check within.
	 * @param {Arrray} checks		Enum values to check.
	 * @returns {boolean}			Does it pass the test.
	 */
	function notEnum(status, enumeral, checks) {
		let _status = true;
		checks.forEach(check=>{
			_status = _status && (status !== enumeral[check])
		});
		return _status;
	}

	/**
	 * Generate a random integer between a start end end value.
	 *
	 * @param {integer} end				The start of the range.
	 * @param {integer} [start=0]		The end of the range.
	 * @returns {integer}				Random generated number.
	 */
	function randomInt(end, start=0) {
		return Math.floor(Math.random() * end) + start;
	}

	/**
	 * Generate a randomstring.
	 *
	 * @param {integer} [length=32]		The length of string to generate.
	 * @returns {string}				Random generated string.
	 */
	function randomString(length=32) {
		return (new Array(length)).fill(0).map(()=>chars[randomInt(chars.length - 1)]).join('');
	}

	/**
	 * Create an acknowledge handler.
	 *
	 * @param {Function} resolve		Promise resolve handler.
	 * @param {Function} reject			Promise rejection handler.
	 * @returns {Function}				The handler.
	 */
	function createAcknowledge(resolve, reject) {
		return (err, response)=>{
			if (err) return reject(err);
			if ((response.status || 200) >= 400) {
				if (err) return reject(err);
				let errMessage = (response.statusMessage || "").trim();
				return reject(errMessage);
			}
			return resolve(response);
		};
	}

	/**
	 * Is given websocket ready for transporting data?
	 *
	 * @param {string} [socketId=defaultSocketId]		The socket id to test.
	 * @returns {boolean}								Is it ready?
	 */
	function socketReady(socketId=defaultSocketId) {
		if (!sockets.has(socketId)) return undefined;
		const ws = sockets.get(socketId);
		return ((ws.readyState === ws.OPEN) ? ws : undefined);
	}

	/**
	 * Send all the messages for a given socket that are in the queue.
	 *
	 * @param {string} [socketId=defaultSocketId]		The socket id to send messages for.
	 */
	function runSendQueue(socketId=defaultSocketId) {
		const _sendQueue = sendQueue.get(socketId);
		const ws = socketReady(socketId);
		if (_sendQueue && ws) {
			_sendQueue.forEach(messageFunction=>ws.send(messageFunction()));
			_sendQueue.clear();
			sendQueue.delete(socketId);
		}
	}

	/**
	 * Send a given message on a given socket.
	 *
	 * @param {Function} messageFunction				Message function to call to generate the message.
	 * @param {string} [socketId=defaultSocketId]		The socket to send on.
	 */
	function send(messageFunction, socketId=defaultSocketId) {
		const ws = socketReady(socketId);
		if (ws) return ws.send(messageFunction());
		if (!sendQueue.has(socketId)) sendQueue.set(socketId, new Set());
		sendQueue.get(socketId).add(messageFunction);
	}

	/**
	 * Get callbacksfor given listen type on given socket.
	 * @param {string} type								The type to get for.
	 * @param {string} [socketId=defaultSocketId]		The socket to get callbacks for.
	 * @returns {Array.<Function>}						Array of callbacks.
	 */
	function getCallbacks(type, socketId=defaultSocketId) {
		if (!callbacks.has(socketId)) callbacks.set(socketId, new Map());
		if (!callbacks.get(socketId).has(type)) callbacks.get(socketId).set(type, new Set());
		return callbacks.get(socketId).get(type);
	}

	/**
	 * Remove the given callback from a callback set.
	 *
	 * @param {Set.<Set>} callbacks		Callback to search through.
	 * @param {Function} callback		Callback to remove.
	 */
	function removeCallback(callbacks, callback) {
		callbacks.forEach(callbacks=>callbacks.delete(callback));
	}

	/**
	 * Get the endpoint url for the given socket id.
	 *
	 * @param {string} [url]			The url to set endpoint to.
	 * @param {string} socketId			The socket id to set endpoint on.
	 * @returns {string}				The endpoint url for given socket id.
	 */
	function setEnpointUrl(url, socketId) {
		if (url) {
			if (!ready) {
				afterReady.add(()=>endpoints.set(socketId, url));
			} else {
				endpoints.set(socketId, url);
			}
		}
		if (!url && !endpoints.has(socketId)) throw new URIError(`No websocket endpoint for ${socketId}`);
		if (!url && endpoints.has(socketId)) url = endpoints.get(socketId);

		return url;
	}

	/**
	 * Try reconnecting to given socket after it has dropped.
	 *
	 * @param {string} url			The endpoint url for websocket.
	 * @param {string} socketId		The socket id.
	 */
	function reconnect(url, socketId) {
		sockets.delete(socketId);
		setTimeout(()=>{
			if (notEnum(status.get(socketId), SOCKETSTATUS, ['CONNECTING', 'RECONNECTING', 'CONNECTED'])) {
				status.set(socketId, SOCKETSTATUS.RECONNECTING);
				console.log("Trying reconnect");
				sockets.set(socketId, new WebSocket(url));
				connecting(sockets.get(socketId), url, socketId);
			}
		}, 1000*3);
	}

	/**
	 * Handle websocket connection, errors and reconnection.
	 *
	 * @param {WebSocket} ws			The websocket to handle.
	 * @param {string} url				The endpoint to connect to.
	 * @param {string} socketId			The socket id to set.
	 */
	function connecting(ws, url, socketId) {
		/**
		 * After open listener, setup message handling and send the message queue.
		 */
		function open() {
			status.set(socketId, SOCKETSTATUS.CONNECTED);
			console.log(`Opened ${url} for ${socketId}`);
			ws.addEventListener("close", close);
			ws.addEventListener("message", message);
			runSendQueue(socketId);
		}

		/**
		 * Close listener, try to reconnect.
		 */
		function close() {
			status.set(socketId, SOCKETSTATUS.CLOSED);
			console.log(`Closed ${url} for ${socketId}`);
			ws.removeEventListener("open", open);
			ws.removeEventListener("close", message);
			ws.removeEventListener("message", message);
			reconnect(url, socketId, ws);
		}

		/**
		 * Handle any websocket errors.
		 *
		 * @param {Error} err		Error message to handle.
		 */
		function error(err) {
			console.error(`Error on ${url} for ${socketId}`, err);
			return close();
		}

		/**
		 * Handle a message event
		 *
		 * @param {Event} messageEvent		The message event to handle.
		 */
		function message(messageEvent) {
			const respond = (message)=>{
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
			};

			if (typeof messageEvent.data === 'string') {
				respond(JSON.parse(messageEvent.data));
			} else if (messageEvent.data instanceof Blob) {
				let reader = new FileReader();
				reader.onload = function() {
					respond(new buffer.Buffer(new Uint8Array(this.result)));
				};
				reader.readAsArrayBuffer(messageEvent.data);
			}
		}

		ws.addEventListener("error", error);
		ws.addEventListener("open", open);
	}

	/**
	 * Connect to a given endpoint for socket id supplied.
	 *
	 * @param {string} [url]	The endpoint to connect to.
	 * @param socketId			The socket id to connecct for.
	 */
	function connect(url, socketId) {
		url = setEnpointUrl(url, socketId);
		if (notEnum(status.get(socketId), SOCKETSTATUS, ['CONNECTING', 'RECONNECTING', 'CONNECTED'])) {
			status.set(socketId, SOCKETSTATUS.CONNECTING);
			if (!sockets.has(socketId)) sockets.set(socketId, new WebSocket(url));
			connecting(sockets.get(socketId), url, socketId);
		}
	}

	/**
	 * Json parser (default one applied by default to all new socket channels).
	 *
	 * @param {*} data		Data to parse into JSON.
	 * @returns {string}	JSON from the data.
	 */
	function defaultJsonParser(data) {
		try {
			return JSON.stringify(data);
		} catch(err) {
			throw new TypeError(`Could not convert data to json for sending`);
		}
	}

	let WebSocketServiceInstance;

	/**
	 * Websocket handler service
	 *
	 * @singleton
	 */
	class WebSocketService {
		constructor() {
			if (!WebSocketServiceInstance) WebSocketServiceInstance = this;
			this.addParser("json", defaultJsonParser);
			return WebSocketServiceInstance;
		}

		/**
		 * Connect to a given endpoint for given socket-id.
		 *
		 * @param {string} url								Endpoint to connect to.
		 * @param {string} [socketId=defaultSocketId]		Socket id to connect for.
		 */
		connect(url, socketId=defaultSocketId) {
			if (!url && !ready) return afterReady.add(()=>connect(url, socketId));
			connect(url, socketId);
		}

		/**
		 * Add a listener for given message type on given socket.
		 *
		 * @param {Function} callback		Listener callback.
		 * @param {string} type				Message type to listen for.
		 * @param {string} socketId			Socket id to use.
		 * @returns {Function}				Unlisten function.
		 */
		listen(callback, type, socketId=defaultSocketId) {
			getCallbacks(type, socketId).add(callback);
			return ()=>getCallbacks(type, socketId).delete(callback);
		}

		/**
		 * Remove a given listener on the given socket.
		 *
		 * @param {Function} callback		Listener to remove.
		 * @param {string} socketId			Socket id to remove listener on.
		 */
		removeListener(callback, socketId) {
			if (socketId && callbacks.has(socketId)) return removeCallback(callbacks.get(socketId), callback);
			callbacks.forEach(callbacks=>removeCallback(callbacks, callback));
		}

		/**
		 * Send a request on the given socket.
		 *
		 * @param {Object} data							Data to send.
		 * @param {string} [socketId=defaultSocketId]	Socket to send on.
		 * @param {string} [type=json]					Type of data to send.
		 * @returns {Promise.<Object>}					Promise resolving to server response.
		 */
		request(data, socketId=defaultSocketId, type='json') {
			data.method = data.method || "get";

			return new Promise((resolve, reject)=>{
				let id = randomString();
				acknowledgements.set(id, createAcknowledge(resolve, reject));
				let message = {type:"request", id, data};
				let messageFunction = ()=>{
					if (parsers.has(type)) {
						const _message = parsers.get(type)(message);
						return _message;
					}
					throw new TypeError(`No parser for type ${type}`);
				};
				send(messageFunction, socketId);
			});
		}

		requestJson(data, socketId=defaultSocketId) {
			return this.request(data, socketId, 'json');
		}

		/**
		 * Is given socket open and ready?
		 *
		 * @param {string} [socketId=defaultSocketId]		Socket to test for readiness.
		 * @returns {boolean}								Is it ready?
		 */
		ready(socketId=defaultSocketId) {
			return !!socketReady(socketId);
		}

		/**
		 * Add an endpoint url for a given id.
		 *
		 * @param {string} id				The id set endpoint on.
		 * @param {string} url				The endpoint url.
		 * @param {WebSocketService}		For chaining.
		 */
		addEndpoint(id, url) {
			endpoints.set(id, url);
			return this;
		}

		/**
		 * remove an endpoint for a given id.
		 *
		 * @param {string} id				The id to remove an endpoint for.
		 * @param {WebSocketService}		For chaining.
		 */
		removeEndpoint(id) {
			endpoints.delete(id);
			return this;
		}

		/**
		 * Add a message parser for given type.
		 *
		 * @param {string} type				Message type to add for.
		 * @param {Function} parser			Parser function to add.
		 * @returns {WebSocketService}		For chaining.
		 */
		addParser(type, parser) {
			parsers.set(type, parser);
			return this;
		}

		/**
		 * Remove a parser for a given message type.
		 *
		 * @param {string} type				Message type to remove for.
		 * @returns {WebSocketService}		For chaining.
		 */
		removeParser(type) {
			parsers.delete(type);
			return this;
		}

		/**
		 * Get the default socket id.
		 *
		 * @returns {string}
		 */
		get defaultSocketId() {
			return defaultSocketId;
		}

		/**
		 * Get the object type string.
		 *
		 * @returns {string}
		 */
		get [Symbol.toStringTag]() {
			return "WebSocketService";
		}
	}

	init();
})(window, window.jQuery);
