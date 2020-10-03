const express = require("./backend/app");
let SocketIO = require("./backend/config/socketconfig");
const app = express.init();
const server = require("http").createServer(app);
const port = process.env.PORT || 3000;
app.set("port", port);
SocketIO.init(server, app);

server.listen(port);
