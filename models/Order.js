const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  id: String,
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  qty: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  created_date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", schema);

module.exports = Order;
