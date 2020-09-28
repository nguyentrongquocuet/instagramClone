const mongoose = require("mongoose");

const FollowingList = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  following: { type: mongoose.Schema.Types.Array },
  count: { type: Number, default: 0 },
});
module.exports = mongoose.model("FollowingList", FollowingList);
