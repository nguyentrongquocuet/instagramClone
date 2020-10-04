const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const postSchema = new Schema({
  title: { type: String, required: true },
  imagePath: { type: String, required: true },
  creatorId: { type: Schema.Types.ObjectId, required: true },
  likeList: { type: Schema.Types.Array, default: [] },
  commentList: { type: Schema.Types.Array, default: [] },
  likecount: { type: Number, default: 0 },
  commentcount: { type: Number, default: 0 },
  index: { type: Number, default: 0 },
});
module.exports = mongoose.model("posts", postSchema);
