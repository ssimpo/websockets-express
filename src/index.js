(function(global, $){
	'use strict';

	let BSON, bson;
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


	function init() {
		if (global.require && !global.define) {
			BSON = require('bson');
			bson = new BSON.BSON();
			global.document.addEventListener("DOMContentLoaded", onReady);
		} else if (global.define && (global.require || global.requireJs)) {
			(requireJs || require)(['bson'], BSON=>{
				BSON = require('bson');
				bson = new BSON.BSON();
				global.document.addEventListener("DOMContentLoaded", onReady);
			});
		}

		const wss = new WebSocketService();
		if ($) $.websocket = wss;
		if (global.angular) global.angular.module("websocket-express", []).factory("$websocket", wss);
		if (typeof global.define === "function") global.define(wss);
		if (global.module && global.module.exports) global.module.exports(wss);
	}

	function onReady() {
		setEndpoints();
		ready = true;
		afterReady.forEach(callback=>callback());
		afterReady.clear();
		global.document.removeEventListener("DOMContentLoaded", init);
	}


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
			if ((response.status || 200) >= 400) {
				if (err) return reject(err);
				let errMessage = (response.statusMessage || "").trim();
				return reject(errMessage);
			}
			return resolve(response);
		};
	}

	function socketReady(socketId=defaultSocketId) {
		if (!sockets.has(socketId)) return undefined;
		const ws = sockets.get(socketId);
		return ((ws.readyState === ws.OPEN) ? ws : undefined);
	}

	function runSendQueue(socketId=defaultSocketId) {
		const _sendQueue = sendQueue.get(socketId);
		const ws = socketReady(socketId);
		if (_sendQueue && ws) {
			_sendQueue.forEach(messageFunction=>ws.send(messageFunction()));
			_sendQueue.clear();
			sendQueue.delete(socketId);
		}
	}

	function send(messageFunction, socketId=defaultSocketId) {
		const ws = socketReady(socketId);
		if (ws) return ws.send(messageFunction());
		if (!sendQueue.has(socketId)) sendQueue.set(socketId, new Set());
		sendQueue.get(socketId).add(messageFunction);
	}

	function getCallbacks(type, socketId=defaultSocketId) {
		if (!callbacks.has(socketId)) callbacks.set(socketId, new Map());
		if (!callbacks.get(socketId).has(type)) callbacks.get(socketId).set(type, new Set());
		return callbacks.get(socketId).get(type);
	}

	function removeCallback(callbacks, callback) {
		callbacks.forEach(callbacks=>callbacks.delete(callback));
	}

	function getConnectUrl(url, socketId) {
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

	function connect(url, socketId) {
		url = getConnectUrl(url, socketId);
		if (!sockets.has(socketId)) sockets.set(socketId, new WebSocket(url));
		const ws = sockets.get(socketId);

		ws.addEventListener("open", ()=>{
			ws.addEventListener("message", messageEvent=>{
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
						respond(bson.deserialize(new Uint8Array(this.result)));
					};
					reader.readAsArrayBuffer(messageEvent.data);
				}
			});

			runSendQueue(socketId);
		});
	}

	let WebSocketServiceInstance;

	class WebSocketService {
		constructor() {
			if (!WebSocketServiceInstance) WebSocketServiceInstance = this;

			this.addParser("json", data=>{
				try {
					return JSON.stringify(data);
				} catch(err) {
					throw new TypeError(`Could not convert data to json for sending`);
				}
			});

			this.addParser("bson", data=>{
				try {
					return bson.serialize(data);
				} catch(err) {
					throw new TypeError(`Could not convert data to bson for sending`);
				}
			});

			return WebSocketServiceInstance;
		}

		connect(url, socketId=defaultSocketId) {
			if (!url && !ready) {
				afterReady.add(()=>connect(url, socketId));
			} else {
				connect(url, socketId);
			}
		}

		listen(callback, type, socketId=defaultSocketId) {
			getCallbacks(type, socketId).add(callback);
			return ()=>getCallbacks(type, socketId).delete(callback);
		}

		removeListener(callback, socketId) {
			if (socketId && callbacks.has(socketId)) return removeCallback(callbacks.get(socketId), callback);
			callbacks.forEach(callbacks=>removeCallback(callbacks, callback));
		}

		request(data, socketId=defaultSocketId, type='json') {
			data.method = data.method || "get";

			return new Promise((resolve, reject)=>{
				let id = randomString();
				acknowledgements.set(id, createAcknowledge(resolve, reject));
				let message = {type:"request", id, data};
				let messageFunction = ()=>{
					if (parsers.has(type)) return parsers.get(type)(message);
					throw new TypeError(`No parser for type ${type}`);
				};
				send(messageFunction, socketId);
			});
		}

		addEndpoint(id, url) {
			endpoints.set(id, url);
		}

		removeEndpoint(id, url) {
			return endpoints.delete(id);
		}

		addParser(type, parser) {
			parsers.set(type, parser);
		}

		removeParser(type, parser) {
			return parsers.delete(type);
		}

		get defaultSocketId() {
			return defaultSocketId;
		}

		get [Symbol.toStringTag]() {
			return "WebSocketService";
		}
	}

	init();
})(window, window.jQuery);
