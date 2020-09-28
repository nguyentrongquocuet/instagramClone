const app = require("./backend/app");
const socketIo = require("socket.io");

const server = require("http").createServer(app);
const port = process.env.PORT || 3000;
app.set("port", port);
const io = socketIo(server);
app.set("io", io);
io.on("connection", (socket) => {
  console.log("user connected");
  socket.emit("test", "here is a test");
});
server.listen(port);
