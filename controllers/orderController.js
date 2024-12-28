const Order = require('../models/Order');
const razorpay = require('../utils/razorpay');

exports.createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, totalAmount } = req.body;
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `order_${Date.now()}`
    });

    // Create order in database
    const order = new Order({
      user: req.user.id,
      products,
      shippingAddress,
      totalAmount,
      razorpayOrderId: razorpayOrder.id
    });

    await order.save();
    res.status(201).json({ order, razorpayOrder });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Error creating order' });
  }
};