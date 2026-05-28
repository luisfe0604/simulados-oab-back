require("dotenv").config();
const http = require('http');//api teste
const app = require("./app");

const {
  initWebSocket
} = require('./modules/useTestsGenerics/websocket/websocket');//api teste

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);//api teste

initWebSocket(server);//api teste

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
