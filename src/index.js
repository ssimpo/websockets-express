(function(global, $){
	'use strict';

	let ready = false;

	const afterReady = new Set();
	const defaultSocketId = 'main';
	const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
	const endpoints = new Map();
	const callbacks = new Map();
	const acknowledgements = new Map();
	const sendQueue = new Map();
	const sockets = new Map();


	function init() {
		global.document.addEventListener("DOMContentLoaded", onReady);

		const websocketService = construct();
		if ($) $.websocket = websocketService;
		if (global.angular) global.angular.module("websocket-express", []).factory("$websocket", websocketService);
		if (typeof global.define === 'function') global.define(construct);
		if (global.module && global.module.exports) global.module.exports(websocketService);
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
			if ((response.status || 200) >= 400) return reject(err);
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
			_sendQueue.forEach(message=>ws.send(message));
			_sendQueue.clear();
			sendQueue.delete(socketId);
		}
	}

	function send(message, socketId=defaultSocketId) {
		const ws = socketReady(socketId);
		if (ws) return ws.send(message);
		if (!sendQueue.has(socketId)) sendQueue.set(socketId, new Set());
		sendQueue.get(socketId).add(message);
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
		if (!url && !endpoints.has(socketId)) throw `No websocket endpoint for ${socketId}`;
		if (!url && endpoints.has(socketId)) url = endpoints.get(socketId);

		return url;
	}

	function connect(url, socketId) {
		url = getConnectUrl(url, socketId);
		if (!sockets.has(socketId)) sockets.set(socketId, new WebSocket(url));
		const ws = sockets.get(socketId);

		ws.addEventListener("open", ()=>{
			ws.addEventListener("message", messageEvent=>{
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

			runSendQueue(socketId);
		});
	}

	function construct() {
		return {
			connect: (url, socketId=defaultSocketId)=>{
				if (!url && !ready) {
					afterReady.add(()=>connect(url, socketId));
				} else {
					connect(url, socketId);
				}
			},

			listen: (callback, type, socketId=defaultSocketId)=>{
				getCallbacks(type, socketId).add(callback);
				return ()=>getCallbacks(type, socketId).delete(callback);
			},

			removeListener: (callback, socketId)=>{
				if (socketId && callbacks.has(socketId)) return removeCallback(callbacks.get(socketId), callback);
				callbacks.forEach(callbacks=>removeCallback(callbacks, callback));
			},

			request: (data, socketId=defaultSocketId)=>{
				data.method = data.method || "get";

				return new Promise((resolve, reject)=>{
					let id = randomString();
					acknowledgements.set(id, createAcknowledge(resolve, reject));
					send(JSON.stringify({type:"request", id, data}), socketId);
				});
			}
		};
	}

	init();
})(window, window.jQuery);
