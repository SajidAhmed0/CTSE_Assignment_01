// const express = require('express');
// const router = express.Router();
// const {
//   getAllItems,
//   getItemById,
//   getItemByName,
//   getItemByProductId,
//   createItem,
//   updateItemByName,
//   updateItemByProductId,
//   deleteItemByName,
//   deleteItemByProductId
// } = require('../controllers/inventoryController');

// // Root CRUD
// router.route('/').get(getAllItems).post(createItem);

// // Get by Mongo _id
// router.route('/id/:id').get(getItemById);

// // Get/Update/Delete by name
// router.route('/name/:name')
//   .get(getItemByName)
//   .put(updateItemByName)
//   .delete(deleteItemByName);

// // Get/Update/Delete by productId
// router.route('/product/:productId')
//   .get(getItemByProductId)
//   .put(updateItemByProductId)
//   .delete(deleteItemByProductId);

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  getAllItems,
  createItem,
  getItemByPid,
  getItemByProductId,
  updateItemByPid,
  updateItemByProductId,
  deleteItemByPid,
  deleteItemByProductId,
  deleteItemById
} = require("../controllers/inventoryController");

router.route("/").get(getAllItems).post(createItem);
router
  .route("/pid/:pid")
  .get(getItemByPid)
  .put(updateItemByPid)
  .delete(deleteItemByPid);
router
  .route("/product/:productId")
  .get(getItemByProductId)
  .put(updateItemByProductId)
  .delete(deleteItemByProductId);

  // Delete inventory by MongoDB _id
router.delete("/id/:id", deleteItemById);

module.exports = router;
