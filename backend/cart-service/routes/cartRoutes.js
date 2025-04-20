// const express = require("express");
// const router = express.Router();
// const {
//   getAllCarts,
//   getCartByUserId,
//   getCartByUserName,
//   addToCart,
//   deleteCartByUserId,
//   deleteCartByUserName
// } = require("../controllers/cartController");

// // All carts
// router.get("/", getAllCarts);

// // CRUD by userId
// router.get("/user-id/:userId", getCartByUserId);
// router.delete("/user-id/:userId", deleteCartByUserId);

// // CRUD by userName
// router.get("/user-name/:userName", getCartByUserName);
// router.delete("/user-name/:userName", deleteCartByUserName);

// // Add or update cart
// router.post("/", addToCart);

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  getAllCarts,
  getCartByUserId,
  addToCart,
  deleteCartByUserId,
  updateCart,
  markCartAsCompleted,
  getCartsByStatus,
  manualInventoryUpdate,
  getCartIdByUserId,
} = require("../controllers/cartController");

router.get("/", getAllCarts);
router.get("/:userid", getCartByUserId);
router.post("/", addToCart);
router.put("/:userid", updateCart);
router.delete("/:userid", deleteCartByUserId);

// ✅ New status-based routes
router.put("/:userid/complete", markCartAsCompleted);
router.get("/status/:status", getCartsByStatus);

// ✅ New manual inventory update route
router.put("/inventory-update/:pid", manualInventoryUpdate);

// Route to get cart ID by user ID
router.get("/:userid/cart-id", getCartIdByUserId);



module.exports = router;
