const mongoose = require('mongoose');
const Order = require('../models/Order');

module.exports = {
  /**
   * Process payment for a customer order
   */
  async makePayment(customerId, body) {
    const { orderId, paymentMethod, amount } = body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid order ID');
    }

    if (!['COD', 'CARD', 'UPI', 'ONLINE'].includes(paymentMethod)) {
      throw new Error('Invalid payment method');
    }

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Find order
    const order = await Order.findOne({ _id: orderId, customerId });
    if (!order) throw new Error('Order not found');

    // Check if already paid
    if (order.paymentStatus === 'Paid') {
      throw new Error('Order already paid');
    }

    // Validate amount
    if (order.totalAmount !== amount) {
      throw new Error(`Payment amount mismatch. Expected ${order.totalAmount}`);
    }

    // Simulate payment gateway success (you can integrate Razorpay/Stripe later)
    const paymentId = `PAY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Update order
    order.paymentStatus = 'Paid';
    order.paymentMethod = paymentMethod;
    order.paymentId = paymentId;
    order.paidAt = new Date();

    await order.save();

    // Return receipt
    return {
      receiptId: paymentId,
      orderId: order._id,
      paymentMethod: order.paymentMethod,
      amount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
    };
  },
};
