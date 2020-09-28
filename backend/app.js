const express = require("express");
const app = express();
const path = require("path");
const bp = require("body-parser");
const mongo = require("mongoose");
const { uri } = require("./config/mongo");
const postRoute = require("./router/post");
const userRoute = require("./router/user");
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
app.use((req, res, next) => {
  next();
});
app.use("/api/post", postRoute);
app.use("/api/user", userRoute);
module.exports = app;
