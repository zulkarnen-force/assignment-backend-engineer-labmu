const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: { type: Number, required: true },
  unit: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  created_at: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", schema);

module.exports = Product;
