// const express = require("express");
// const {
//     createOrder,
//     getAllOrders,
//     getOrderById,
//     updateOrder,
//     deleteOrder
// } = require("../controllers/orderController");

// const router = express.Router();

// router.post("/", createOrder);
// router.get("/", getAllOrders);
// router.get("/:id", getOrderById);
// router.put("/:id", updateOrder);
// router.delete("/:id", deleteOrder);

// module.exports = router;


const express = require("express");
const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderAddress,
    deleteOrder,
    completeOrder,
    cancelOrder,
    getCompletedOrders
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrderAddress);
router.delete("/:id", deleteOrder);
router.put('/:id/complete-order', completeOrder);
router.put('/:id/cancel-order', cancelOrder);
router.get('/orders/completed', getCompletedOrders);

module.exports = router;
