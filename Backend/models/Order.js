const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, trim: true },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    customerPhone: { type: String, trim: true },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        _id: String,
      },
    ],
    total: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    trackingNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'received', 'processing', 'shipped', 'delivered', 'cancelled', 'sent'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
