const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentListSchema = new Schema({
  creatorId: { type: Schema.Types.ObjectId, required: true },
  commentList: { type: Schema.Types.Array, default: [] },
  postId: { type: Schema.Types.ObjectId, unique: true },
  count: { type: Number, default: 0 },
});
module.exports = mongoose.model("CommentList", commentListSchema);
