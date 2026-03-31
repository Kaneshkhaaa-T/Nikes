const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const { generateOrderQR } = require("../utils/qrGenerator");

const router = express.Router();

// @route  POST /api/orders
// @desc   Create new order + generate QR
// @access Private
router.post("/", protect, async (req, res) => {
    try {
        const order = new Order({
            user: req.user._id,
            orderItems: req.body.orderItems,
            totalPrice: req.body.totalPrice,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
        });

        const createdOrder = await order.save();

        // Generate QR immediately after order creation
        const { secretCode, qrCodeImage } = await generateOrderQR(createdOrder._id);
        createdOrder.qrSecretCode = secretCode;
        createdOrder.qrCodeImage = qrCodeImage;
        await createdOrder.save();

        res.status(201).json(createdOrder);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// @route  GET /api/orders/my-orders
// @desc   Get logged-in user's orders
// @access Private
router.get("/my-orders", protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({
            createdAt: -1,
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route  POST /api/orders/verify-return
// @desc   Verify QR code during return pickup
// @access Private
router.post("/verify-return", protect, async (req, res) => {
    try {
        const { scannedPayload } = req.body;

        let parsed;
        try {
            parsed = JSON.parse(scannedPayload);
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid QR code format",
            });
        }

        const { orderId, secretCode } = parsed;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Core verification
        if (order.qrSecretCode !== secretCode) {
            order.returnStatus = "rejected";
            order.returnRejectedReason = "QR code does not match. Possible counterfeit.";
            await order.save();

            return res.status(200).json({
                success: false,
                verified: false,
                message: "Return REJECTED: QR code mismatch. Product may be counterfeit.",
                orderId,
            });
        }

        // Codes match — approve return
        order.returnStatus = "approved";
        order.returnVerifiedAt = new Date();
        await order.save();

        return res.status(200).json({
            success: true,
            verified: true,
            message: "Return APPROVED: Product verified successfully.",
            orderId,
            orderDetails: {
                totalPrice: order.totalPrice,
                orderItems: order.orderItems,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// @route  GET /api/orders/:id
// @desc   Get order details by ID
// @access Private
router.get("/:id", protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;