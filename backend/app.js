const express = require("express");
const path = require("path");
const bp = require("body-parser");
const mongo = require("mongoose");
const { uri } = require("./config/mongo");
const postRoute = require("./router/post");
const userRoute = require("./router/user");

module.exports.init = () => {
  require("dotenv").config();
  const app = express();
  app.use(bp.json());
  mongo
    .connect(uri)
    .then(() => {
      console.log("connected to mongodb");
    })
    .catch(() => {
      console.log("cannot connect to mongodb");
    });
  app.use("/images", express.static(path.join("backend/images")));
  app.use("/avatar", express.static(path.join("backend/avatar")));
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS, PUT"
    );
    next();
  });

  let Pusher = require("pusher");
  let pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    useTLS: true,
  });
  app.set("pusher", pusher);
  app.post("/pusher/auth", function (req, res) {
    console.log(req.body);
    var socketId = req.body.socket_id;
    var channel = req.body.channel_name;
    var auth = pusher.authenticate(socketId, channel);
    res.send(auth);
  });
  app.use("/api/post", postRoute);
  app.use("/api/user", userRoute);

  return app;
};
