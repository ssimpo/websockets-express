'use strict';

const ws = require('ws');
const handleUpgrade = require('./lib/expressWebsocket');
const Request = require('./lib/request');
const Response = require('./lib/response');

function websocketMiddleware(req, res, next) {
  console.log(req.path, Object.keys(req.headers).sort().join(', ')+'\n\n');
  if (!req.headers || req.headers.upgrade === undefined || req.headers.upgrade.toLowerCase() !== 'websocket') return next();

  res.websocket((ws, app)=>{
    ws.on('message', rawData=>{
      const message = JSON.parse(rawData);

      console.log("Sending websocket message through express", message.path);

      let _req = new Request(req, message);
      let _res = new Response(_req);

      app.handle(_req, _res);
    });
  });
}

function upgrade(server, app) {
  const wss = new ws.Server({ noServer: true });
  server.on('upgrade', handleUpgrade(app, wss));
}

module.exports = {
  upgrade, websocketMiddleware
}