import {randomString} from "./util";

let buffer = window.buffer;
let ready = false;
let bson;

const afterReady = new Set();
const defaultSocketId = 'main';
const endpoints = new Map();
const callbacks = new Map();
const acknowledgements = new Map();
const sendQueue = new Map();
const sockets = new Map();
const serializers = new Map();
const deserializers = new Map();
const status = new Map();
const SOCKETSTATUS = Object.freeze({
	CONNECTING: 1,
	RECONNECTING: 2,
	CLOSED: 3,
	CONNECTED: 4
});

class HTTP_ERROR extends Error {
	constructor(message, ...params) {
		super(message.message,...params);
		this.status = message.status;
	}
}

/**
 * Initiate this module, binding into all the correct global and framework points.
 */
function init() {
	const {
		jQuery=((!!window.$ && !!window.$.jQuery)?window.$:undefined),
		angular,
		bolt,
		document:doc
		} = window;

	if (!!jQuery) window.jQuery.websocket = new WebSocketService();
	if (!!angular) angular.module("websocket-express", []).factory("$websocket", ()=>new WebSocketService());
	if (!!bolt) {
		bolt.WebSocketService = WebSocketService;
		if (!!bolt.MODE && (bolt.MODE.has("DEVELOPMENT") || bolt.MODE.has("DEBUG"))) {
			bolt.WebSocketService.DEBUG = true;
		}
	}

	if (!!bolt && !!jQuery && !!angular) window.WebSocketService = WebSocketService;

	// This is extracted from jQuery.ready(), we want the works in all situations provided by jQuery without
	// the jQuery dependency. (@see https://github.com/jquery/jquery/blob/master/src/core/ready.js).
	function completed() {
		document.removeEventListener("DOMContentLoaded", completed);
		window.removeEventListener("load", completed);
		onReady();
	}

	if (doc.readyState==="complete" || (doc.readyState !=="loading" && !doc.documentElement.doScroll)) {
		window.setTimeout(onReady);
	} else {
		document.addEventListener( "DOMContentLoaded", completed );
		window.addEventListener( "load", completed );
	}
}

/**
 * Function to call when document is ready.  Only run once to perform all waiting websocket messages.
 */
function onReady() {
	setEndpoints();
	if (!!window.BSON && !!WebSocketServiceInstance) {
		WebSocketServiceInstance
			.addSerializer("bson", defaultBsonSerializer)
			.addDeserializer("bson", defaultBsonDeserializer);
	}
	ready = true;
	afterReady.forEach(callback=>callback());
	afterReady.clear();
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
 * Search through all the locations for websocket endpoint definitions setting these.  Will use defaults if non
 * found. These can be defined in <link rel="websocket-endpoint"> tags, where the title attribute is the endpoint
 * name and the href is the endpoint.
 */
function setEndpoints() {
	setDefaultEndPoint();

	let endpointLinkElements = window.document.querySelectorAll("link[rel=websocket-endpoint][href]");
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
	const [origin, baseElement] = [window.location.origin, window.document.querySelector("base[href]")];
	let url;
	if (baseElement) {
		const base = (baseElement.getAttribute("href") || "").trim().replace(origin, "");
		if (base !== "") url = `${origin}${base}`;
	} else {
		url = `${origin}/`;
	}

	url = url
		.replace("https://", "wss://")
		.replace("http://", "ws://");

	endpoints.set(defaultSocketId, url);
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
			const message = (response.body || response.statusMessage || "").trim();
			const status = (response.status || 400);
			return reject(new HTTP_ERROR({message, status}));
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
			if (!!WebSocketService.DEBUG) console.log("Trying reconnect");
			sockets.set(socketId, new WebSocket(url));
			connecting(sockets.get(socketId), url, socketId);
		}
	}, 1000*3);
}

function drop(socketId) {
	sockets.get(socketId).close();
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
		if (!!WebSocketService.DEBUG) console.log(`Opened ${url} for ${socketId}`);
		ws.addEventListener("close", close);
		ws.addEventListener("message", message);
		runSendQueue(socketId);
	}

	/**
	 * Close listener, try to reconnect.
	 */
	function close() {
		status.set(socketId, SOCKETSTATUS.CLOSED);
		if (!!WebSocketService.DEBUG) console.log(`Closed ${url} for ${socketId}`);
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
		const respond = message=>{
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
			respond(deserializers.get('json')(messageEvent.data));
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
 * Bson serializer.
 *
 * @param {*} data		Data to parse into BSON.
 * @returns {Buffer}	BSON from the data.
 */
function defaultBsonSerializer(data) {
	try {
		return bson.serialize(data);
	} catch(err) {
		throw new TypeError(`Could not convert data to bson for sending`);
	}
}

/**
 * Json serializer (default one applied by default to all new socket channels).
 *
 * @param {*} data		Data to parse into JSON.
 * @returns {string}	JSON from the data.
 */
function defaultJsonSerializer(data) {
	try {
		return JSON.stringify(data);
	} catch(err) {
		throw new TypeError(`Could not convert data to json for sending`);
	}
}

/**
 * Json deserializer (default one applied by default to all new socket channels).
 *
 * @param {string} data			Data to parse from JSON.
 * @returns {Object|Array|*}	Parsed data.
 */
function defaultJsonDeserializer(data) {
	try {
		return JSON.parse(data);
	} catch(err) {
		throw new TypeError(`Could not convert from json string.`);
	}
}

/**
 * Bson deserializer.
 *
 * @param {string} data			Data to parse from BSON..
 * @returns {Object|Array|*}	Parsed data.
 */
function defaultBsonDeserializer(data) {
	try {
		return bson.deserialize(data);
	} catch(err) {
		throw new TypeError(`Could not convert from json string.`);
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
		this.addSerializer("json", defaultJsonSerializer).addDeserializer("json", defaultJsonDeserializer);
		if (!!bson) this.addSerializer("bson", defaultBsonSerializer).addDeserializer("bson", defaultBsonDeserializer);
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

	drop(socketId=defaultSocketId) {
		drop(socketId);
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
			const id = randomString();
			acknowledgements.set(id, createAcknowledge(resolve, reject));
			const message = {type:"request", id, data};

			send(()=>{
				if (serializers.has(type)) return serializers.get(type)(message);
				throw new TypeError(`No parser for type ${type}`);
			}, socketId);
		});
	}

	requestJson(data, socketId=defaultSocketId) {
		return this.request(data, socketId, 'json');
	}

	requestBson(data, socketId=defaultSocketId) {
		return this.request(data, socketId, 'bson');
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
	 * Add a message serializer for given type.
	 *
	 * @param {string} type				Message type to add for.
	 * @param {Function} serializer		Serializer function to add.
	 * @returns {WebSocketService}		For chaining.
	 */
	addSerializer(type, serializer) {
		serializers.set(type, serializer);
		return this;
	}

	/**
	 * Remove a serializer for a given message type.
	 *
	 * @param {string} type				Message type to remove for.
	 * @returns {WebSocketService}		For chaining.
	 */
	removeSerializer(type) {
		serializers.delete(type);
		return this;
	}

	/**
	 * Add a message deserializer for given type.
	 *
	 * @param {string} type					Message type to add for.
	 * @param {Function} deserializer		Deserializer function to add.
	 * @returns {WebSocketService}			For chaining.
	 */
	addDeserializer(type, deserializer) {
		deserializers.set(type, deserializer);
		return this;
	}

	/**
	 * Remove a deserializer for a given message type.
	 *
	 * @param {string} type				Message type to remove for.
	 * @returns {WebSocketService}		For chaining.
	 */
	removeDeserializer(type) {
		deserializers.delete(type);
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

WebSocketService.DEBUG = false;

init();
