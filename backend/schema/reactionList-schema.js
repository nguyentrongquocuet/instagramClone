const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reactionListSchema = new Schema({
  creatorId: { type: Schema.Types.ObjectId, required: true },
  reactionList: { type: Schema.Types.Array, default: [] },
  postId: { type: Schema.Types.ObjectId, unique: true },
  count: { type: Number, default: 0 },
});
module.exports = mongoose.model("ReactionList", reactionListSchema);
