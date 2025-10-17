const mongoose = require('mongoose');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

/**
 * Description: Handles customer cart operations
 */
module.exports = {
  /**
   * Add product to customer cart
   */
  async addToCart(customerId, productId, quantity) {
    // 1️⃣ Validate product ID and quantity
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    // 2️⃣ Check product existence
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    // 3️⃣ Find or create customer's cart
    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({ customerId, items: [] });
    }

    // 4️⃣ Check if product already in cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += Number(quantity);
    } else {
      // Add new item
      cart.items.push({ productId, quantity });
    }

    // 5️⃣ Save updated cart
    cart.updatedAt = new Date();
    await cart.save();

    // 6️⃣ Populate product details for response
    const populatedCart = await cart.populate('items.productId', 'name price images');

    return populatedCart;
  },
  /**
 * Get customer's cart
 */
async getCart(customerId) {
  // 1️⃣ Find customer's cart
  const cart = await Cart.findOne({ customerId }).populate('items.productId', 'name price images');

  // 2️⃣ If no cart found, return empty structure
  if (!cart) {
    return {
      customerId,
      items: [],
      totalItems: 0,
      totalAmount: 0,
    };
  }

  // 3️⃣ Calculate totals
  const totalAmount = cart.items.reduce((sum, item) => {
    const price = item.productId?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // 4️⃣ Return formatted cart
  return {
     cartId: cart._id,  
    customerId: cart.customerId,
    items: cart.items.map((item) => ({
      productId: item.productId?._id,
      name: item.productId?.name,
      price: item.productId?.price,
      quantity: item.quantity,
      images: item.productId?.images || [],
    })),
    totalItems,
    totalAmount,
    updatedAt: cart.updatedAt,
  };
},
/**
 * Update quantity for a specific item in the customer's cart
 */
async updateCartItem(customerId, itemId, quantity) {
  if (quantity <= 0) throw new Error('Quantity must be greater than zero');

  const cart = await Cart.findOne({ customerId });
  if (!cart) throw new Error('Cart not found');

  const item = cart.items.id(itemId);
  if (!item) throw new Error('Item not found');

  item.quantity = quantity;
  cart.updatedAt = new Date();
  await cart.save();

  const populatedCart = await cart.populate('items.productId', 'name price images');

  return populatedCart;
},
/**
 * Remove a specific item from the customer's cart
 */
async removeFromCart(customerId, itemId) {
  const cart = await Cart.findOne({ customerId });
  if (!cart) throw new Error('Cart not found');

  const item = cart.items.id(itemId);
  if (!item) throw new Error('Item not found');

  // Remove the item from cart
  cart.items = cart.items.filter(
    (item) => item._id.toString() !== itemId.toString()
    );
  cart.updatedAt = new Date();
  await cart.save();

  const populatedCart = await cart.populate('items.productId', 'name price images');
  return populatedCart;
},
};
