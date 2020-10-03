const SocketIO = require("../config/socketconfig");
const postSchema = require("../schema/post-schema");
const userSchema = require("../schema/user-schema");
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
    console.log(savedPost, creatorInfo); // savedPost= {...savedPost, creator: {...creatorInfo}};
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
exports.getPost = (req, res) => {
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
        const creatorInfo = await userController.getUserInfo(post.creatorId);
        let commentList = [];
        for (let comment of post.commentList) {
          const commentCreatorInfo = await userController.getUserInfo(
            comment.userId
          );
          commentList.push({
            ...comment,
            userData: commentCreatorInfo,
          });
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
    console.log(postAfterUpdate);

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
    await postSchema.findByIdAndUpdate(
      postId,
      {
        $push: {
          commentList: {
            userId: userId,
            comment: comment,
          },
        },
        $inc: {
          commentcount: 1,
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
    });
    res.status(200).json("added comment");
  } catch (error) {
    console.log("ERROR FROM ADD COMMENT", error);
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
  getCommentList(req.params.id, -1).then((fullComment) => {
    console.log("fullcomment", fullComment);
    res.status(200).json({ message: "getted full comments", fullComment });
  });
};

async function getLikedUserList(res, postId) {}
async function getCommentList(postId, count) {
  console.log("count laf", count);
  let output = [];

  try {
    const commentDoc = await commentListSchema.findOne({
      postId: postId,
    });
    let listSize = commentDoc.commentList.length;
    console.log(listSize);
    let from;
    if (count < 0 || count > listSize) {
      from = 0;
    } else {
      from = listSize - count;
    }
    console.log(listSize);
    let comments = commentDoc.commentList;
    for (let i = from; i < listSize; i++) {
      let user = await userSchema.findById(comments[i].userId);
      output.push({
        userData: {
          userId: user._id,
          username: user.username,
          name: user.name,
          avatarPath: user.avatarPath,
        },
        comment: comments[i].comment,
      });
    }
    return { totalComment: listSize, list: output };
  } catch (error) {
    console.log("ERROR IN GET COMMENT LIST", error);
  }
}
