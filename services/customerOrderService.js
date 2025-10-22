const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

module.exports = {
  /**
   * Place order from customer's cart
   */
  async placeOrder(customerId, { shippingAddress, paymentMethod, cartId }) {
    // 1️⃣ Validate input
    if (!shippingAddress || !shippingAddress.trim()) throw new Error('Shipping address is required');
    const validMethods = ['COD', 'ONLINE', 'CARD', 'UPI'];
    if (!validMethods.includes(paymentMethod)) throw new Error('Invalid payment method');

    // 2️⃣ Validate cart
    if (!mongoose.Types.ObjectId.isValid(cartId)) throw new Error('Invalid cart ID');
    const cart = await Cart.findOne({ _id: cartId, customerId }).populate('items.productId', 'name price stock');
    if (!cart) throw new Error('Cart not found');
    if (!cart.items.length) throw new Error('Cart is empty');

    // 3️⃣ Calculate total and verify stock
    let totalAmount = 0;
    for (const item of cart.items) {
      const product = item.productId;
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product?.name || 'Unknown'}`);
      }
      totalAmount += product.price * item.quantity;
    }

    // 4️⃣ Create order items
    const orderItems = cart.items.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
    }));

    // 5️⃣ Deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // 6️⃣ Create order
    const order = new Order({
      customerId,
      cartId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Placed',
    });

    await order.save();

    // 7️⃣ Clear cart
    cart.items = [];
    await cart.save();

    // 8️⃣ Return summary
    return {
      orderId: order._id,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
    };
  },
  /**
 * Get all customer orders with pagination & filter
 */
async getAllCustomerOrders(customerId, { page = 1, limit = 10, status }) {
  const skip = (page - 1) * limit;

  const filter = { customerId };
  if (status) filter.orderStatus = status; // Optional filter (Placed, Shipped, Delivered, etc.)

  const [orders, totalCount] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('items.productId', 'name images price')
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    page: Number(page),
    limit: Number(limit),
    totalOrders: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    orders: orders.map((order) => ({
      orderId: order._id,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        productId: i.productId?._id,
        name: i.productId?.name,
        price: i.price,
        quantity: i.quantity,
        images: i.productId?.images || [],
      })),
    })),
  };
},
/**
 * Get a single order by ID (Customer)
 */
async getCustomerOrderById(customerId, orderId) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Invalid order ID');
  }

  const order = await Order.findOne({ _id: orderId, customerId })
    .populate('items.productId', 'name price images stock')
    .lean();

  if (!order) return null;

  return {
    orderId: order._id,
    totalAmount: order.totalAmount,
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt,
    items: order.items.map((i) => ({
      productId: i.productId?._id,
      name: i.productId?.name,
      price: i.price,
      quantity: i.quantity,
      images: i.productId?.images || [],
      stockLeft: i.productId?.stock,
    })),
  };
},
/**
 * Cancel Order (Customer)
 */
async cancelCustomerOrder(customerId, orderId, reason) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Invalid order ID');
  }

  const order = await Order.findOne({ _id: orderId, customerId });
  if (!order) throw new Error('Order not found');

  // Allowed cancellations: only before shipping
  const nonCancellableStatuses = ['Shipped', 'Delivered', 'Cancelled'];
  if (nonCancellableStatuses.includes(order.orderStatus)) {
    const err = new Error(`Cannot cancel an order with status '${order.orderStatus}'`);
    err.statusCode = 409; // conflict
    throw err;
  }

  // Update order
  order.orderStatus = 'Cancelled';
  order.cancelReason = reason || 'Cancelled by customer';
  order.cancelledAt = new Date();

  await order.save();

  return {
    orderId: order._id,
    orderStatus: order.orderStatus,
    cancelReason: order.cancelReason,
    cancelledAt: order.cancelledAt,
  };
},
/**
 * Track Order (Customer)
 */
async trackCustomerOrder(customerId, orderId) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Invalid order ID');
  }

  const order = await Order.findOne({ _id: orderId, customerId })
    .select(
      'orderStatus paymentStatus paymentMethod totalAmount shippingAddress createdAt updatedAt cancelledAt cancelReason deliveredAt shippedAt processingAt'
    )
    .lean();

  if (!order) throw new Error('Order not found');

  // build timeline tracking info (you can extend this later)
  const trackingSteps = [
    {
      status: 'Placed',
      timestamp: order.createdAt,
      message: 'Order placed successfully by customer',
    },
  ];

  if (order.processingAt) {
    trackingSteps.push({
      status: 'Processing',
      timestamp: order.processingAt,
      message: 'Seller is preparing your order',
    });
  }

  if (order.shippedAt) {
    trackingSteps.push({
      status: 'Shipped',
      timestamp: order.shippedAt,
      message: 'Order shipped and on its way',
    });
  }

  if (order.deliveredAt) {
    trackingSteps.push({
      status: 'Delivered',
      timestamp: order.deliveredAt,
      message: 'Order delivered successfully',
    });
  }

  if (order.orderStatus === 'Cancelled') {
    trackingSteps.push({
      status: 'Cancelled',
      timestamp: order.cancelledAt,
      message: order.cancelReason || 'Order cancelled',
    });
  }

  return {
    orderId: order._id,
    currentStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    trackingSteps,
  };
}
};

