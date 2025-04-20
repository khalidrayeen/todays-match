const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// WebSocket handling
let groupsData = [];
let backgroundUrl = '';

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const parsed = JSON.parse(message);

    if (parsed.type === 'start') {
      groupsData = parsed.data;
      backgroundUrl = parsed.bgUrl || '';
    
      // Broadcast with round included
      broadcast(JSON.stringify({
        type: 'start',
        data: groupsData,
        bgUrl: backgroundUrl,
        round: parsed.round || '' // <- include round name
      }));
    }
    
  });
});

function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// ✅ Use Glitch's provided PORT
const PORT = process.env.PORT || 6001;
server.listen(PORT, function () {
  console.log(`Server running at http://localhost:${PORT}/admin.html`);
});
