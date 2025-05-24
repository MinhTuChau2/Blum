const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema(
  {
    text: { type: String, default: '' },
    media: { type: [String], default: [] }, // Array of image/video filenames
    externalLinks: { type: [String], default: [] }, // ✅ NEW: External TikTok/media links
  },
  { timestamps: true }
);

module.exports = mongoose.model('About', aboutSchema);
