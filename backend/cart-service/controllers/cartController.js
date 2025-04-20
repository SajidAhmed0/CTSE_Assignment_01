// const Cart = require("../models/Cart");

// // Get all carts
// exports.getAllCarts = async (req, res) => {
//   const carts = await Cart.find();
//   res.json(carts);
// };

// // Get cart by userId
// exports.getCartByUserId = async (req, res) => {
//   const cart = await Cart.findOne({ userId: req.params.userId });
//   if (!cart) return res.status(404).json({ message: 'Cart not found by userId' });
//   res.json(cart);
// };

// // Get cart by userName
// exports.getCartByUserName = async (req, res) => {
//   const cart = await Cart.findOne({ userName: req.params.userName });
//   if (!cart) return res.status(404).json({ message: 'Cart not found by userName' });
//   res.json(cart);
// };

// // Add or update cart
// exports.addToCart = async (req, res) => {
//   try {
//     const { userId, userName, items } = req.body;

//     // Calculate subtotal per item
//     const updatedItems = items.map(item => {
//       const priceAfterDiscount = item.unitPrice * (1 - (item.discountRate || 0) / 100);
//       const subtotal = priceAfterDiscount * item.quantity;
//       return {
//         ...item,
//         subtotal: parseFloat(subtotal.toFixed(2))
//       };
//     });

//     // Calculate total price
//     const totalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

//     let cart = await Cart.findOne({ userId });

//     if (cart) {
//       cart.items = updatedItems;
//       cart.totalPrice = totalPrice;
//       cart.userName = userName;
//     } else {
//       cart = new Cart({ userId, userName, items: updatedItems, totalPrice });
//     }

//     await cart.save();
//     res.status(200).json(cart);
//   } catch (error) {
//     res.status(500).json({ message: "Error saving cart", error });
//   }
// };

// // Delete cart by userId
// exports.deleteCartByUserId = async (req, res) => {
//   const deleted = await Cart.findOneAndDelete({ userId: req.params.userId });
//   if (!deleted) return res.status(404).json({ message: 'Cart not found to delete (by userId)' });
//   res.json({ message: "Cart deleted (by userId)" });
// };

// // Delete cart by userName
// exports.deleteCartByUserName = async (req, res) => {
//   const deleted = await Cart.findOneAndDelete({ userName: req.params.userName });
//   if (!deleted) return res.status(404).json({ message: 'Cart not found to delete (by userName)' });
//   res.json({ message: "Cart deleted (by userName)" });
// };


const Cart = require('../models/Cart');
const axios = require('axios');

// Update remaining quantity in Inventory service
const updateInventoryQuantity = async (pid, quantityChange) => {
  try {
    const res = await axios.get(`http://localhost:5005/inventory-service/pid/${pid}`);
    const item = res.data;
    const newRemaining = item.remainingQuantity + quantityChange;

    await axios.put(`http://localhost:5005/inventory-service/pid/${pid}`, {
      remainingQuantity: newRemaining
    });
  } catch (error) {
    console.error(`Inventory update failed for ${pid}:`, error.message);
  }
};

// Get all carts
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find();
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cart by userId
exports.getCartByUserId = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userid: req.params.userid });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete cart by userId and restore inventory
exports.deleteCartByUserId = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userid: req.params.userid });
    if (!cart) return res.status(404).json({ message: 'Cart not found to delete' });

    for (const item of cart.items) {
      await updateInventoryQuantity(item.pid, item.quantity);
    }

    await Cart.deleteOne({ userid: req.params.userid });
    res.json({ message: "Cart deleted and inventory restored" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or update cart
exports.addToCart = async (req, res) => {
  try {
    const { userid, items } = req.body;

    let subtotal = 0;
    let shippingCost = 0;
    let shippingWeight = 0;

    // Restore inventory from old cart
    const oldCart = await Cart.findOne({ userid });
    if (oldCart) {
      for (const oldItem of oldCart.items) {
        await updateInventoryQuantity(oldItem.pid, oldItem.quantity);
      }
    }

    const enrichedItems = await Promise.all(items.map(async (item) => {
      // Get product details
      const productRes = await axios.get(`http://localhost:5003/product-service/${item.pid}`);
      const product = productRes.data;

      const unitPrice = product.price;
      const discountRate = product.discountRate || 0;
      const weight = product.weight;

      const priceAfterDiscount = unitPrice * (1 - discountRate / 100);
      const itemSubtotal = priceAfterDiscount * item.quantity;

      const itemWeight = weight * item.quantity;
      const itemShipping = Math.ceil(itemWeight / 100) * 5;

      subtotal += itemSubtotal;
      shippingCost += itemShipping;
      shippingWeight += itemWeight;

      await updateInventoryQuantity(item.pid, -item.quantity);

      return {
        pid: item.pid,
        quantity: item.quantity,
        unitPrice,
        discountRate,
        weight,
        itemSubtotal: parseFloat(itemSubtotal.toFixed(2)),
        itemShipping
      };
    }));

    const totalPrice = parseFloat((subtotal + shippingCost).toFixed(2));

    let cart = await Cart.findOne({ userid });

    if (cart) {
      cart.items = enrichedItems;
      cart.subtotal = parseFloat(subtotal.toFixed(2));
      cart.shippingWeight = shippingWeight;
      cart.shippingCost = shippingCost;
      cart.totalPrice = totalPrice;
    } else {
      cart = new Cart({
        userid,
        items: enrichedItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shippingWeight,
        shippingCost,
        totalPrice
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Add to Cart Error:", error.message);
    res.status(500).json({ message: "Error saving cart", error: error.message });
  }
};

// Update cart using PUT
exports.updateCart = async (req, res) => {
  req.body.userid = req.params.userid;
  return exports.addToCart(req, res);
};

// ✅ Update Cart Status to Completed
exports.markCartAsCompleted = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userid: req.params.userid },
      { status: "Completed" },
      { new: true }
    );
    if (!cart) return res.status(404).json({ message: 'Cart not found to mark as completed' });
    res.json({ message: "Cart marked as completed", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all carts by status
exports.getCartsByStatus = async (req, res) => {
  try {
    const carts = await Cart.find({ status: req.params.status });
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manually update remaining quantity via route
exports.manualInventoryUpdate = async (req, res) => {
  const { pid } = req.params;
  const { quantityChange } = req.body;

  if (typeof quantityChange !== "number") {
    return res.status(400).json({ message: "quantityChange must be a number" });
  }

  try {
    const response = await axios.get(`http://localhost:5005/inventory-service/pid/${pid}`);
    const item = response.data;

    const newRemaining = item.remainingQuantity + quantityChange;

    const updated = await axios.put(`http://localhost:5005/inventory-service/pid/${pid}`, {
      remainingQuantity: newRemaining,
    });

    res.status(200).json({
      message: "Inventory updated successfully",
      updated: updated.data
    });
  } catch (error) {
    console.error(`Inventory update failed for ${pid}:`, error.message);
    res.status(500).json({ message: "Inventory update failed", error: error.message });
  }
};

// Get only the cart ID by userId
exports.getCartIdByUserId = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userid: req.params.userid }).select('_id');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json({ cartId: cart._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



