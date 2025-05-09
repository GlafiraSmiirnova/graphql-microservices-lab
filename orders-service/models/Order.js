const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    productId: String,
    userId: String,
    quantity: Number,
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'SHIPPED'],
      default: 'PENDING',
      uppercase: true
    }
  });

module.exports = mongoose.model('Order', orderSchema);
