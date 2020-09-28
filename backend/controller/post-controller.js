const commentListSchema = require("../schema/commentList-schema");
const postSchema = require("../schema/post-schema");
const reactionListSchema = require("../schema/reactionList-schema");
const userSchema = require("../schema/user-schema");
const userController = require("./user-controller");
exports.addPost = (req, res) => {
  const io = req.app.get("io");
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
  createReactionList(post)
    .then((out) => {
      io.emit("postchange", { operation: "add", postId: post._id });
      res.status(200).json({ ...out });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getPost = (req, res) => {
  const userId = req.decodedToken.token.userId;
  const part = parseInt(req.query.part);
  const postPerPart = parseInt(req.query.postPerPart);
  postSchema
    .find()
    .limit(postPerPart)
    .skip(postPerPart * part)
    .sort({ _id: -1 })
    .then(async (foundPosts) => {
      let totalSize = await postSchema.countDocuments();
      let transferredPost = [];
      for (let post of foundPosts) {
        const liked = await getLiked(post, userId);
        const creatorInfo = await userController.getUserInfo(post.creatorId);
        transferredPost.push({
          ...post._doc,
          ...liked,
          creator: creatorInfo,
        });
      }
      res.status(200).json({ posts: [...transferredPost], totalSize });
    });
};
exports.getPostById = (req, res) => {
  const userId = req.decodedToken.token.userId;
  postSchema.findById(req.params.id).then(async (foundPost) => {
    if (foundPost) {
      const liked = await getLiked(foundPost, userId);
      const creatorInfo = await userController.getUserInfo(foundPost.creatorId);
      res.status(200).json({
        ...foundPost._doc,
        ...liked,
        creator: creatorInfo,
      });
    }
  });
};
exports.addLike = (req, res) => {
  const io = req.app.get("io");
  const userId = req.decodedToken.token.userId;
  reactionListSchema
    .findOneAndUpdate(
      { postId: req.body.postId, reactionList: userId },
      {
        $pull: {
          reactionList: userId,
        },
        $inc: {
          count: -1,
        },
      }
    )
    .then((foundList) => {
      if (!foundList) {
        reactionListSchema
          .findOneAndUpdate(
            { postId: req.body.postId },
            {
              $push: {
                reactionList: userId,
              },
              $inc: {
                count: 1,
              },
            }
          )
          .then((foundList) => {
            io.emit("postchange", {
              operation: "update",
              postId: foundList.postId,
            });

            return res.status(200).json({ ...foundList });
          })
          .catch((err) => {
            return res.status(401).json({ error: err });
          });
      } else {
        io.emit("postchange", {
          operation: "update",
          postId: foundList.postId,
        });

        return res.status(200).json({ ...foundList });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(401).json({ error: err });
    });
};

exports.getLikedList = (req, res) => {
  getLikedUserList(res, req.params.id);
};
function createReactionList(post) {
  return new Promise((resolve, reject) => {
    post.save().then((savedPost) => {
      Promise.all([
        reactionListSchema.create({
          creatorId: savedPost.creatorId,
          postId: savedPost._id,
        }),
        commentListSchema.create({
          creatorId: savedPost.creatorId,
          postId: savedPost._id,
        }),
      ])
        .then(() => {
          resolve(savedPost);
        })
        .catch((err) => reject(err));
    });
  });
}

function getLiked(post, userId) {
  return new Promise((resolve, reject) => {
    reactionListSchema
      .findOne({ postId: post._id })
      .then((foundPost) => {
        if (foundPost) {
          resolve({
            isLiked: foundPost.reactionList.includes(userId),
            liked: foundPost.count,
          });
        }
      })
      .catch((err) => reject(err));
  });
}

async function getLikedUserList(res, postId) {
  let output = [];
  try {
    const likedListByUserId = await reactionListSchema.findOne({
      postId: postId,
    });
    for (let userId of likedListByUserId.reactionList) {
      try {
        let user = await userSchema.findById(userId);
        output.push({
          userId: user._id,
          username: user.username,
          name: user.name,
          avatarPath: user.avatarPath,
        });
      } catch (error) {
        return res.status(200).json("server error on load likedList");
      }
    }
    res.status(200).json([...output]);
  } catch (error) {
    return res.status(200).json("server error on load likedList");
  }
}
