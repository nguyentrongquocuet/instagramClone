const mongoose = require("mongoose");

const FollowerList = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  follower: { type: mongoose.Schema.Types.Array },
  count: { type: Number, default: 0 },
});
module.exports = mongoose.model("FollowerList", FollowerList);
