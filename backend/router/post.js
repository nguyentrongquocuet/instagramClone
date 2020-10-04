const route = require("express").Router();
const imageMiddleware = require("../middleware/imageMiddlerware");
const controller = require("../controller/post-controller");
const authMiddleware = require("../middleware/authMiddleware");

route.post("", authMiddleware, imageMiddleware, controller.addPost);
route.get("", authMiddleware, controller.getPost);
route.get("/:id", authMiddleware, controller.getPostById);
route.get("/like/:id", authMiddleware, controller.getLikedList);
route.post("/like", authMiddleware, controller.addLike);
route.post("/comment", authMiddleware, controller.addComment);
route.get("/comment/:id", authMiddleware, controller.getFullComment);
route.delete("/comment", authMiddleware, controller.deleteComment);
module.exports = route;
