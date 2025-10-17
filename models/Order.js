const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  paymentMethod: {
    type: String,
    enum: ['COD', 'ONLINE', 'CARD', 'UPI'],
    required: true,
  },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  orderStatus: { type: String, enum: ['Placed', 'Processing', 'Shipped', 'Delivered'], default: 'Placed' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
