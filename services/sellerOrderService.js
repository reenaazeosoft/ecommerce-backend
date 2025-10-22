const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

module.exports = {
  /**
   * Fetch all orders containing seller’s products
   */
  async getAllSellerOrders(query, seller) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    // Step 1: find all product IDs belonging to seller
    const sellerProducts = await Product.find({ sellerId: seller.id }).select('_id');
    const productIds = sellerProducts.map(p => p._id);

    if (productIds.length === 0) {
      return { total: 0, orders: [] };
    }

    // Step 2: build order filter
    const filter = { 'items.productId': { $in: productIds } };
    if (status) filter.orderStatus = status;
    if (search) {
      filter.$or = [
        { 'shippingAddress': new RegExp(search, 'i') },
        { 'items.name': new RegExp(search, 'i') }
      ];
    }

    // Step 3: fetch orders
    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments(filter);

    if (!orders || orders.length === 0) return null;

    // Step 4: format response
    return {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      orders: orders.map(o => ({
        orderId: o._id,
        customer: o.customerId,
        totalAmount: o.totalAmount,
        orderStatus: o.orderStatus,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
        items: o.items
          .filter(i => productIds.some(pid => pid.equals(i.productId?._id)))
          .map(i => ({
            productId: i.productId?._id,
            name: i.productId?.name,
            price: i.price,
            quantity: i.quantity,
            images: i.productId?.images || [],
          })),
      })),
    };
  },
  async getSellerOrderById(seller, orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid order ID');
    }

    // find all product IDs that belong to this seller
    const sellerProducts = await Product.find({ sellerId: seller.id }).select('_id');
    const productIds = sellerProducts.map(p => p._id);

    if (productIds.length === 0) return null;

    // find order that contains at least one of those products
    const order = await Order.findOne({
      _id: orderId,
      'items.productId': { $in: productIds },
    })
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name price images stock')
      .lean();

    if (!order) return null;

    // filter only the seller’s products from the order items
    const sellerItems = order.items.filter(i =>
      productIds.some(pid => pid.equals(i.productId?._id))
    );

    return {
      orderId: order._id,
      customer: order.customerId,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      items: sellerItems.map(i => ({
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
 * Update order status (Seller)
 */
async updateSellerOrderStatus(seller, orderId, newStatus) {
  const validStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Invalid order ID');
  }

  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
  }

  // Get all products for this seller
  const sellerProducts = await Product.find({ sellerId: seller.id }).select('_id');
  const productIds = sellerProducts.map(p => p._id);

  if (productIds.length === 0) throw new Error('No products found for seller');

  // Find the order that includes the seller’s products
  const order = await Order.findOne({
    _id: orderId,
    'items.productId': { $in: productIds },
  });

  if (!order) throw new Error('Order not found');

  // Prevent invalid backward transitions
  const allowedTransitions = {
    Placed: ['Processing', 'Cancelled'],
    Processing: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered'],
    Delivered: [],
    Cancelled: [],
  };

  if (!allowedTransitions[order.orderStatus].includes(newStatus)) {
    const err = new Error(`Invalid status change from ${order.orderStatus} to ${newStatus}`);
    err.statusCode = 409; // Conflict
    throw err;
  }

  // Update the order status
  order.orderStatus = newStatus;
  await order.save();

  return {
    orderId: order._id,
    orderStatus: order.orderStatus,
    updatedAt: order.updatedAt,
  };
},
};
