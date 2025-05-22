const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: String,
    author: String,
    content: String,
    image: String,
  },
  {
    timestamps: true, // ✅ Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Article', articleSchema);
