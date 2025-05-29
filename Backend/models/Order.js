const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerEmail: {
    type: String,
    required: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
  },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      _id: String,
    },
  ],
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'received', 'sent'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
