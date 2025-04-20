// const Inventory = require('../models/Inventory');

// // GET all inventory items
// exports.getAllItems = async (req, res) => {
//   const items = await Inventory.find();
//   res.json(items);
// };

// // GET by MongoDB _id
// exports.getItemById = async (req, res) => {
//   const item = await Inventory.findById(req.params.id);
//   if (!item) return res.status(404).json({ message: 'Item not found by ID' });
//   res.json(item);
// };

// // GET by name
// exports.getItemByName = async (req, res) => {
//   const item = await Inventory.findOne({ name: req.params.name });
//   if (!item) return res.status(404).json({ message: 'Item not found by name' });
//   res.json(item);
// };

// // GET by productId
// exports.getItemByProductId = async (req, res) => {
//   const item = await Inventory.findOne({ productId: req.params.productId });
//   if (!item) return res.status(404).json({ message: 'Item not found by productId' });
//   res.json(item);
// };

// // CREATE new inventory item
// exports.createItem = async (req, res) => {
//   try {
//     const newItem = new Inventory(req.body);
//     const saved = await newItem.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // UPDATE by name
// exports.updateItemByName = async (req, res) => {
//   const updated = await Inventory.findOneAndUpdate({ name: req.params.name }, req.body, { new: true });
//   if (!updated) return res.status(404).json({ message: 'Item not found to update (by name)' });
//   res.json(updated);
// };

// // UPDATE by productId
// exports.updateItemByProductId = async (req, res) => {
//   const updated = await Inventory.findOneAndUpdate({ productId: req.params.productId }, req.body, { new: true });
//   if (!updated) return res.status(404).json({ message: 'Item not found to update (by productId)' });
//   res.json(updated);
// };

// // DELETE by name
// exports.deleteItemByName = async (req, res) => {
//   const deleted = await Inventory.findOneAndDelete({ name: req.params.name });
//   if (!deleted) return res.status(404).json({ message: 'Item not found to delete (by name)' });
//   res.json({ message: 'Item deleted by name' });
// };

// // DELETE by productId
// exports.deleteItemByProductId = async (req, res) => {
//   const deleted = await Inventory.findOneAndDelete({ productId: req.params.productId });
//   if (!deleted) return res.status(404).json({ message: 'Item not found to delete (by productId)' });
//   res.json({ message: 'Item deleted by productId' });
// };


const Inventory = require("../models/Inventory");
const axios = require("axios");

// GET all inventory items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE only with pid
exports.createItem = async (req, res) => {
  try {
    const { pid, quantity, remainingQuantity, productId } = req.body;
    const newItem = new Inventory({
      pid,
      quantity,
      remainingQuantity,
      productId,
    });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET by pid
exports.getItemByPid = async (req, res) => {
  try {
    const item = await Inventory.findOne({ pid: req.params.pid });
    if (!item)
      return res.status(404).json({ message: "Item not found by pid" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET by productId
exports.getItemByProductId = async (req, res) => {
  try {
    const item = await Inventory.findOne({ productId: req.params.productId });
    if (!item)
      return res.status(404).json({ message: "Item not found by productId" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE by pid → Add new quantity to existing quantity + remainingQuantity
exports.updateItemByPid = async (req, res) => {
  try {
    const { quantity } = req.body;

    const item = await Inventory.findOne({ pid: req.params.pid });
    if (!item) {
      return res.status(404).json({ message: "Item not found to update (by pid)" });
    }

    const updated = await Inventory.findOneAndUpdate(
      { pid: req.params.pid },
      {
        quantity: item.quantity + quantity,
        remainingQuantity: (item.remainingQuantity || 0) + quantity
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE by productId → Add new quantity to existing quantity + remainingQuantity
exports.updateItemByProductId = async (req, res) => {
  try {
    const { quantity } = req.body;

    const item = await Inventory.findOne({ productId: req.params.productId });
    if (!item) {
      return res.status(404).json({ message: "Item not found to update (by productId)" });
    }

    const updated = await Inventory.findOneAndUpdate(
      { productId: req.params.productId },
      {
        quantity: item.quantity + quantity,
        remainingQuantity: (item.remainingQuantity || 0) + quantity
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// DELETE by pid
exports.deleteItemByPid = async (req, res) => {
  try {
    const item = await Inventory.findOneAndDelete({ pid: req.params.pid });
    if (!item)
      return res
        .status(404)
        .json({ message: "Item not found to delete (by pid)" });
    res.json({ message: "Deleted successfully by pid" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE by productId
exports.deleteItemByProductId = async (req, res) => {
  try {
    const item = await Inventory.findOneAndDelete({
      productId: req.params.productId,
    });
    if (!item)
      return res
        .status(404)
        .json({ message: "Item not found to delete (by productId)" });
    res.json({ message: "Deleted successfully by productId" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE inventory item by MongoDB _id
exports.deleteItemById = async (req, res) => {
  try {
    const deleted = await Inventory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Inventory item not found by _id' });
    res.json({ message: 'Inventory item deleted successfully by _id' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

