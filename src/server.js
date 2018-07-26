import ws from 'ws';
import {handleUpgrade} from './expressWebsocket';
import {WebsocketRequest as Request} from './request';
import {WebsocketResponse as Response} from './response';
import crypto from 'crypto';
import {getContentLength, makeArray, randomString, isString} from './util';


function isWebsocket(req) {
	return !(
		!!req.websocket ||
		!req.headers ||
		(req.headers.upgrade === undefined) ||
		(req.headers.upgrade.toLowerCase() !== 'websocket')
	);
}

function parseMessage(rawData) {
	if (isString(rawData)) {
		try {
			return ['json', JSON.parse(rawData)];
		} catch(err) {}
	}
	return ['unknown', undefined];
}

function generateMessageId(message, req) {
	const shasum = crypto.createHash('sha1');
	shasum.update(`${message.id}${req.sessionID}`);
	return shasum.digest('hex');
}

function handleRequest({message, app, req, client, messageId, type}) {
	message.data.headers = Object.assign(message.data.headers || {}, {
		'Content-Type': 'application/json',
		'Transfer-Encoding': 'identity',
		'Content-Length': getContentLength(message.data.body)
	});

	const _req = new Request(req, message.data, messageId, client.id);
	const _res = new Response(_req, client, message.id, type);

	app.handle(_req, _res);
}

export function websocketMiddleware(req, res, next) {
	if (!isWebsocket(req)) return next();

	res.websocket((client, app)=>{
		client.id = randomString();
		app.getWebsocketClient = id=>makeArray((app.wss || {}).clients).find(client=>(client.id === id));

		client.on('message', rawData=>{
			const [type, message] = parseMessage(rawData);

			if (!!message && !!message.type) {
				const messageId = generateMessageId(message, req);
				if (message.type === 'request') return handleRequest({message, app, req, client, messageId, type});
			}
		});
	});
}

export function upgrade(server, app) {
	const wss = new ws.Server({noServer:true});
	server.on('upgrade', handleUpgrade(app, wss));
	return wss;
}