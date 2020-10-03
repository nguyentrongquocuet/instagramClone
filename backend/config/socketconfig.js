class SocketIO {
  init(server, app) {
    this.socketId = new Map();
    this.io = require("socket.io")(server);
    app.set("io", this.io);
    this.io.on("connection", (socket) => {
      console.log("user connected ", socket.id);
      socket.on("auth", (userId) => {
        console.log(userId);
        if (userId) {
          socket.auth = true;
          this.socketId.set(userId, socket.id);
          console.log("oke");
          socket.emit("socketId", { socketId: socket.id });
        } else {
          socket.auth = false;
          console.log("not oke");
        }
      });
    });
  }
}
module.exports = new SocketIO();
