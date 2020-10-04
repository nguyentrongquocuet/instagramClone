const mongoose = require("mongoose");

const User = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  avatarPath: { type: String },
});
module.exports = mongoose.model("users", User);
