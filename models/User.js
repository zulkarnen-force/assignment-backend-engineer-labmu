const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  created_date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", schema);

module.exports = User;
