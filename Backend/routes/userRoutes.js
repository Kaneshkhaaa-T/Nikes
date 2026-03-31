const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {protect} = require("../middleware/authMiddleware");
const router = express.Router();

// @route POST/api/users/register
// @description - Register a new user
// @access - Public

router.post("/register", async (req, res) => {
const { name, email, password } = req.body;
    try {
    // Registration logic
    let user = await User.findOne({email});
    if(user) return res.status(400).json({ message: "User Already Exist" });

    user = new User({ name, email, password });
    await user.save();
    
    //create JWT payload
    const payload = { user: {id: user._id,role: user.role} };

    //Sign and return the token along with user data
    jwt.sign(payload,process.env.JWT_SECRET, {expiresIn: "40h"},(err,token) => {
        if(err) throw err;
        //send the user and token in response
        res.status(201).json({
            user:{
                _id: user._id,
                name:user.name,
                email: user.email,
                role: user.role,
            },
            token,
        })
    } );

    } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
    }
});

// @route POST/api/users/login
// @description - Authenticate user
// @access - Public

router.post("/login", async (req, res) => {
const { name, email, password } = req.body;
    try {
    // Registration logic
    let user = await User.findOne({email});
    if(!user) return res.status(400).json({ message: "Invail credentials " });
    const isMatch = await user.matchPassword(password);
    
    if(!isMatch) return res.status(400).json({ message: "Invail password credentials " });

     //create JWT payload
    const payload = { user: {id: user._id,role: user.role} };

    //Sign and return the token along with user data
    jwt.sign(payload,process.env.JWT_SECRET, {expiresIn: "40h"},(err,token) => {
        if(err) throw err;
        //send the user and token in response
        res.json({
            user:{
                _id: user._id,
                name:user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } );

    } catch(error) {
        console.log(error);
    res.status(500).send("Server Error");
    }

});


// @route GET/api/users/login
// @description - Get logged-in user's profile {Protected Route}
// @access - Private

router.post("/profile" , protect, async (req, res) => {
    res.json(req.user);
});

// routes/userRoutes.js  (inside your create order handler)
const { generateOrderQR } = require('../utils/qrGenerator');
const Order = require('../models/Order');

// After order is saved to DB:
router.post('/orders', protect, async (req, res) => {
  try {
    const order = new Order({
      user: req.user._id,
      orderItems: req.body.orderItems,
      totalPrice: req.body.totalPrice,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
    });

    const createdOrder = await order.save();

    // --- Generate QR immediately after order creation ---
    const { secretCode, qrCodeImage } = await generateOrderQR(createdOrder._id);

    createdOrder.qrSecretCode = secretCode;
    createdOrder.qrCodeImage = qrCodeImage;
    await createdOrder.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// routes/userRoutes.js  (add this new route)

// POST /api/orders/verify-return
router.post('/orders/verify-return', protect, async (req, res) => {
  try {
    const { scannedPayload } = req.body;
    // scannedPayload is the raw string from QR scan

    let parsed;
    try {
      parsed = JSON.parse(scannedPayload);
    } catch {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid QR code format' 
      });
    }

    const { orderId, secretCode } = parsed;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // --- The core verification ---
    if (order.qrSecretCode !== secretCode) {
      // Update order to rejected
      order.returnStatus = 'rejected';
      order.returnRejectedReason = 'QR code does not match. Possible counterfeit.';
      await order.save();

      return res.status(200).json({
        success: false,
        verified: false,
        message: 'Return REJECTED: QR code mismatch. Product may be counterfeit.',
        orderId,
      });
    }

    // Codes match — approve return
    order.returnStatus = 'approved';
    order.returnVerifiedAt = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Return APPROVED: Product verified successfully.',
      orderId,
      orderDetails: {
        totalPrice: order.totalPrice,
        orderItems: order.orderItems,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;