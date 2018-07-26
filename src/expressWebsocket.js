import http from 'http';
import ws from 'ws';

export function handleUpgrade(app, wss=new ws.Server({noServer:true})) {
  // https://github.com/websockets/ws/blob/master/lib/WebSocketServer.js#L77
  return function (req, socket, upgradeHead) {
    const res = new http.ServerResponse(req);
    res.assignSocket(socket);

    // avoid hanging onto upgradeHead as this will keep the entire
    // slab buffer used by node alive
    const head = new Buffer(upgradeHead.length);
    upgradeHead.copy(head);

    res.on('finish', ()=>res.socket.destroy());

    res.websocket = cb=>wss.handleUpgrade(req, socket, head, client=>{
      wss.emit('connection', client);
      if (cb) cb(client, app);
    });

    return app(req, res);
  };
};
