const route = require("express").Router();
const controller = require("../controller/user-controller");
const authMiddleware = require("../middleware/authMiddleware");
const imageMiddlerware = require("../middleware/imageMiddlerware");

route.post("/check", authMiddleware, controller.checkAccount);
route.post("/login", controller.login);
route.post("/signup", imageMiddlerware, controller.signup);
module.exports = route;
