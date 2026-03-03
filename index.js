const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: process.env.PORT ? Number(process.env.PORT) : 3000, host: '0.0.0.0' });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});