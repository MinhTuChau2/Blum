const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    category: { type: String, trim: true },
    stock: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Index for full-text search across name, description, and category
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
