const WebSocket = require('ws');
const db = require('../db');

const clients = new Set();

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);

    console.log('Novo cliente WebSocket conectado');

    ws.on('close', () => {
      clients.delete(ws);
    });
  });
}

async function broadcastMesasAtualizadas() {
  try {
    const result = await db.query('SELECT * FROM mesas ORDER BY id');

    const payload = JSON.stringify({
      type: 'mesas:update',
      mesas: result.rows
    });

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  } catch (error) {
    console.error('Erro ao buscar mesas para broadcast:', error);
  }
}

module.exports = {
  initWebSocket,
  broadcastMesasAtualizadas
};