const express = require("express");
const Product = require("./models/Product.js");
const User = require("./models/User.js");
const Order = require("./models/Order.js");
const { default: mongoose } = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");

const PORT = 3000;
const app = express();
app.use(bodyParser.json());

app.get("/products", async (req, res) => {
  let products = await Product.find({});
  return res.json(products);
});

app.post("/products", async (req, res) => {
  let products = new Product({ ...req.body });
  await products.save();
  return res.json(products);
});

app.put("/products/:id/stock", async (req, res) => {
  if (!req.body.stock) {
    return res.status(400).json({
      errors: {
        message: "stock is required",
      },
    });
  }
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id },
      { stock: req.body.stock },
      { new: true }
    );
    return res.json({
      message: "stock of product updated successfully",
      data: { id: product._id, name: product.name, stock: product.stock },
    });
  } catch (error) {}
});

app.post("/orders", async (req, res) => {
  try {
    const { product_id, user_id, qty } = req.body;

    if (!product_id || !user_id || !qty) {
      throw new Error("product_id, user_id and qty is required");
    }
    const product = await Product.findOne(
      new mongoose.Types.ObjectId(product_id)
    );

    const onStock = product.stock >= qty;
    if (!onStock) {
      throw new Error("not enough stock available");
    }
    const order = new Order({ product: product_id, user: user_id, qty: qty });
    await order.save();
    product.stock = product.stock - qty;
    await product.save();
    return res.json({
      message: "order product created successfully",
      data: { order },
    });
  } catch (error) {
    res.status(400).json({
      errors: {
        message: error.message,
      },
    });
  }
});

function calculateTotalsAndGrandTotal(orders) {
  let grandTotal = 0;
  const resultOrder = orders.map((order) => {
    let result = order.toObject();
    result.total = result.product.price * result.qty;
    const total = result.total;
    delete result.user;
    grandTotal += total;
    return result;
  });
  return { resultOrder, grandTotal };
}

app.get("/orders/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const orders = await Order.find({ user: userId }, { _id: 0, __v: 0 })
      .populate("user")
      .populate("product")
      .exec();
    const user = orders[0].user;
    const { resultOrder, grandTotal } = calculateTotalsAndGrandTotal(orders);
    const result = {};
    result.orders = resultOrder;
    result.grandTotal = grandTotal;
    result.order_by = user;
    return res.json({
      result,
    });
  } catch (error) {
    res.status(400).json({
      errors: {
        message: error.message,
      },
    });
  }
});

app.post("/users", async (req, res) => {
  const id = uuidv4();
  try {
    let user = new User({ id, ...req.body });
    await user.save();
    return res.json({
      message: "user created",
      data: {
        id: id,
      },
    });
  } catch (error) {
    return res.status(400).json({
      errors: {
        msg: error.message,
        code: 400,
      },
    });
  }
});

app.listen(PORT, () => {
  console.log("server running");
  mongoose
    .connect("mongodb://127.0.0.1/klontong")
    .then(() => console.log("mongodb connected"));
});
