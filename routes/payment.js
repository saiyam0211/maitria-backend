// server/routes/payment.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const auth = require("../middleware/auth");
const Order = require("../models/Order");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount, currency, receipt, shippingInfo } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    // Store order details in your database
    await Order.create({
      userId: req.user._id,
      razorpayOrderId: order.id,
      amount,
      shippingInfo,
      status: "pending",
    });

    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Verify Payment
router.post("/verify", auth, async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      shippingInfo,
      product,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Update order status in your database
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "completed",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        product,
      },
      { new: true }
    );

    res.json({
      success: true,
      orderId: order._id,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

module.exports = router;
