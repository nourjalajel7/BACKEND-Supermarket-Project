const express = require("express");
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");
const { cartItemValidator, cartQuantityValidator } = require("../validators/requestValidators");

const router = express.Router();

router.use(protect);
router.get("/", getCart);
router.post("/", cartItemValidator, addToCart);
router.put("/:productId", cartQuantityValidator, updateCartItem);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
