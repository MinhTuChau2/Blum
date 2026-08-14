const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  image: { type: String, default: '' },
});

const aboutSchema = new mongoose.Schema(
  {
    text: { type: String, default: '' },
    media: { type: [String], default: [] }, // Array of image/video filenames
    externalLinks: { type: [String], default: [] }, // External TikTok/media links
    projects: { type: [projectSchema], default: [] }, // My Projects section
  },
  { timestamps: true }
);

module.exports = mongoose.model('About', aboutSchema);
