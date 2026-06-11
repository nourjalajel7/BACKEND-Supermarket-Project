const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const calculateCart = (cart) => {
  const items = cart.items.map((item) => {
    const product = item.product;
    const price = product.price * (1 - product.discountPercent / 100);
    const subtotal = Number((price * item.quantity).toFixed(2));

    return {
      product,
      quantity: item.quantity,
      price: Number(price.toFixed(2)),
      subtotal
    };
  });

  return {
    user: cart.user,
    items,
    totalPrice: Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2))
  };
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id, items: [] } },
      { returnDocument: "after", upsert: true }
    ).populate("items.product");

    res.json(calculateCart(cart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < Number(quantity)) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id, items: [] } },
      { returnDocument: "after", upsert: true }
    );

    const item = cart.items.find((cartItem) => cartItem.product.toString() === productId);

    if (item) {
      item.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    await cart.populate("items.product");

    res.status(201).json(calculateCart(cart));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((cartItem) => cartItem.product.toString() === req.params.productId);

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter((cartItem) => cartItem.product.toString() !== req.params.productId);
    } else {
      const product = await Product.findById(req.params.productId);

      if (!product || product.quantity < Number(quantity)) {
        return res.status(400).json({ message: "Not enough stock" });
      }

      item.quantity = Number(quantity);
    }

    await cart.save();
    await cart.populate("items.product");

    res.json(calculateCart(cart));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate("items.product");

    res.json(calculateCart(cart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { returnDocument: "after" }).populate("items.product");
    res.json(calculateCart(cart || { user: req.user._id, items: [] }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
