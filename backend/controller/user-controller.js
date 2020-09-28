const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { resolve } = require("path");
const { salt } = require("../config/bcrypt-salt");
const followerListSchema = require("../schema/followerList-schema");
const followingListSchema = require("../schema/followingList-schema");
const userSchema = require("../schema/user-schema");

const key = require("../config/json-key").key;
exports.login = (req, res) => {
  const username = req.body.username;
  const password = req.body.password.toString();
  userSchema.findOne({ username: username }).then((foundDoc) => {
    if (!foundDoc) return res.status(401).json({ message: "email not exist" });
    else {
      bcrypt.compare(password, foundDoc.password).then((isMatched) => {
        if (isMatched) {
          const payload = {
            userId: foundDoc._id,
          };
          const token = jwt.sign(payload, key, {
            expiresIn: 3600,
          });
          return res.status(200).json({
            token: token,
            username: foundDoc.username,
            userId: foundDoc._id,
            expiresIn: 3600,
            name: foundDoc.name,
            avatarPath: foundDoc.avatarPath,
          });
        } else {
          return res.status(401).json({
            message: "invalid password",
          });
        }
      });
    }
  });
};

exports.signup = async (req, res) => {
  if (req.body.password !== req.body.repassword)
    return res.status(401).json({ message: "two passwords not match" });
  userSchema.findOne({ username: req.body.username }).then((doc) => {
    if (doc) return res.status(401).json({ message: "email has been used" });
    else {
      bcrypt.hash(req.body.password.toString(), salt).then((hashed) => {
        let imagePath;
        if (req.file) {
          imagePath =
            req.protocol +
            "://" +
            req.get("host") +
            "/images/" +
            req.file.filename;
        } else {
          imagePath =
            req.protocol +
            "://" +
            req.get("host") +
            "/images/" +
            "default-avatar.png";
        }
        console.log(imagePath);
        const user = new userSchema({
          username: req.body.username,
          password: hashed,
          name: req.body.name,
          avatarPath: imagePath,
        });
        creatFollowList(user).then((out) => {
          res.status(200).json({ out });
        });
      });
    }
  });
};

exports.checkAccount = (req, res) => {
  const userId = req.decodedToken.token.userId;
  userSchema.findById(userId).then((foundDoc) => {
    if (foundDoc) {
      const payload = {
        userId: foundDoc._id,
      };
      const token = jwt.sign(payload, key, {
        expiresIn: 3600,
      });
      return res.status(200).json({
        token: token,
        username: foundDoc.username,
        userId: foundDoc._id,
        expiresIn: 3600,
        name: foundDoc.name,
        avatarPath: foundDoc.avatarPath,
      });
    } else {
      return res.status(401).json({ message: "not authorized" });
    }
  });
};

function creatFollowList(user) {
  return new Promise((resolve, reject) => {
    user.save().then((savedDoc) => {
      Promise.all([
        followerListSchema.create({ userId: savedDoc._id }),
        followingListSchema.create({ userId: savedDoc._id }),
      ])
        .then(() => {
          resolve(savedDoc);
        })
        .catch((err) => reject(err));
    });
  });
}

exports.getUserInfo = async (userId) => {
  return new Promise((resolve, reject) => {
    userSchema
      .findById(userId)
      .then((foundUser) => {
        if (foundUser) {
          resolve(foundUser);
        } else {
          reject("user not found");
        }
      })
      .catch((err) => reject(err));
  });
};
