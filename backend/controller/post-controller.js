const SocketIO = require("../config/socketconfig");
const postSchema = require("../schema/post-schema");
const userController = require("./user-controller");
exports.addPost = (req, res) => {
  const io = req.app.get("io");
  const userId = req.decodedToken.token.userId;
  const socketId = SocketIO.socketId.get(userId);
  const socket = req.app.get("io").sockets.connected[socketId];
  const file = req.file;
  let imagePath;
  if (file) {
    imagePath =
      req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;
  }

  const post = new postSchema({
    creatorId: req.decodedToken.token.userId,
    title: req.body.title,
    imagePath: imagePath,
  });
  post.save().then(async (savedPost) => {
    const creatorInfo = await userController.getUserInfo(savedPost.creatorId);
    const room = `post-${savedPost._id}`;
    socket.join(room);
    io.emit("post", {
      operation: "addpost",
      post: {
        ...savedPost._doc,
        creator: { ...creatorInfo },
      },
    });
    res.status(200).json({ message: "saved" });
  });
};
exports.getPost = async (req, res) => {
  console.log("getting post");
  const userId = req.decodedToken.token.userId;
  const socketId = SocketIO.socketId.get(userId);
  const socket = req.app.get("io").sockets.connected[socketId];
  const part = parseInt(req.query.part);
  const postPerPart = parseInt(req.query.postPerPart);
  postSchema
    .find()
    .limit(postPerPart)
    .skip(postPerPart * part)
    .sort({ _id: -1 })
    .then(async (foundPosts) => {
      let totalSize = await postSchema.countDocuments();
      for (let post of foundPosts) {
        const room = `post-${post._id}`;
        socket.join(room);
        let limit = 2;
        const creatorInfo = await userController.getUserInfo(post.creatorId);
        let commentList = [];
        for (let i = post.commentcount - 1; i >= 0; i--) {
          if (limit <= 0) break;
          const commentCreatorInfo = await userController.getUserInfo(
            post.commentList[i].userId
          );
          commentList.unshift({
            ...post.commentList[i],
            userData: commentCreatorInfo,
          });
          limit--;
        }

        socket.emit("post", {
          totalSize: totalSize,
          operation: "getonepost",
          post: { ...post._doc, creator: creatorInfo, commentList },
        });
      }
      res.status(200).json({ totalSize });
    });
};
exports.getPostById = (req, res) => {
  console.log(req.query.commentLimit);
  postSchema.findById(req.params.id).then(async (foundPost) => {
    if (foundPost) {
      const creatorInfo = await userController.getUserInfo(foundPost.creatorId);
      res.status(200).json({
        ...foundPost._doc,
        creator: creatorInfo,
      });
    }
  });
};
exports.addLike = async (req, res) => {
  const io = req.app.get("io");
  const room = `post-${req.body.postId}`;
  const userId = req.decodedToken.token.userId;
  const postId = req.body.postId;
  try {
    let postAfterUpdate = await postSchema.findOneAndUpdate(
      { _id: postId, likeList: userId },
      {
        $pull: {
          likeList: userId,
        },
        $inc: { likecount: -1 },
      },
      { new: true }
    );
    if (!postAfterUpdate) {
      postAfterUpdate = await postSchema.findByIdAndUpdate(
        postId,
        {
          $push: {
            likeList: userId,
          },
          $inc: { likecount: 1 },
        },
        { new: true }
      );
      io.to(room).emit("post", {
        operation: "addlike",
        postId: postId,
        userId: userId,
      });
    } else {
      io.to(room).emit("post", {
        operation: "unlike",
        postId: postId,
        userId: userId,
      });
    }

    res.status(200).json("liked");
  } catch (error) {
    console.log("ERROR FROM ADD LIKE", error);
  }
};
exports.addComment = async (req, res) => {
  const io = req.app.get("io");
  const postId = req.body.postId;
  const room = `post-${postId}`;
  const userId = req.decodedToken.token.userId;
  const comment = req.body.comment.trim();
  try {
    let post = await postSchema.findByIdAndUpdate(postId);
    await post.update(
      {
        $push: {
          commentList: {
            id: post.index,
            userId: userId,
            comment: comment,
          },
        },
        $inc: {
          commentcount: 1,
          index: 1,
        },
      },
      {
        new: true,
      }
    );
    const userData = await userController.getUserInfo(userId);
    io.to(room).emit("post", {
      operation: "addcomment",
      postId: postId,
      comment: comment,
      userId: userId,
      userData: userData,
      id: post.index,
    });
    res.status(200).json("added comment");
  } catch (error) {
    console.log("ERROR FROM ADD COMMENT", error);
  }
};
exports.deleteComment = async (req, res) => {
  const userId = req.decodedToken.token.userId;
  const postId = req.query.postId;
  const room = `post-${postId}`;
  const commentId = parseInt(req.query.commentId);
  const io = req.app.get("io");
  console.log(commentId);
  try {
    const postAfterUpdate = await postSchema.findOneAndUpdate(
      { _id: postId },
      {
        $pull: {
          commentList: { id: commentId, userId: userId },
        },
        $inc: {
          commentcount: -1,
        },
      },
      { new: true }
    );
    if (!postAfterUpdate) {
      res.status(401).json("unauthenticated");
    } else {
      io.to(room).emit("post", {
        operation: "deletecomment",
        postId: postId,
        comment: null,
        userId: userId,
        userData: null,
        id: commentId,
      });
      res.status(200).json("deleted");
    }
  } catch (error) {
    console.log("FROM DELETE COMMENT", error);
  }
};
exports.getLikedList = async (req, res) => {
  console.log(req.params);
  const userId = req.decodedToken.token.userId;
  const io = req.app.get("io");
  const socketId = SocketIO.socketId.get(userId);
  const socket = io.sockets.connected[socketId];
  let output = [];
  try {
    const foundPost = await postSchema.findById(req.params.id);
    console.log("getting likelist");
    for (let userId of foundPost.likeList) {
      let userData = await userController.getUserInfo(userId);
      socket.emit("post", {
        operation: "getlike",
        postId: foundPost._id,
        userData,
      });
    }
    res.status(200).json([...output]);
  } catch (error) {
    return res.status(200).json("server error on load likedList");
  }
};
exports.getFullComment = (req, res) => {
  console.log("getting comments");
  const userId = req.decodedToken.token.userId;
  const socketId = SocketIO.socketId.get(userId);
  const socket = req.app.get("io").sockets.connected[socketId];
  const postId = req.params.id;
  postSchema.findById(postId).then(async (foundPost) => {
    let commentList = [];
    for (let i = foundPost.commentcount - 1; i >= 0; i--) {
      const commentCreatorInfo = await userController.getUserInfo(
        foundPost.commentList[i].userId
      );
      socket.emit("post", {
        operation: "morecomment",
        comment: {
          ...foundPost.commentList[i],
          userData: commentCreatorInfo,
        },
      });
      commentList.push({
        ...foundPost.commentList[i],
        userData: commentCreatorInfo,
      });
    }

    res.status(200).json({ message: "get comment" });
  });
};
