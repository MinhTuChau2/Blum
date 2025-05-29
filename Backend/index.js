const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const Product = require('./models/Product');
const Article = require('./models/Article');
const User = require('./models/User');
const fs = require('fs');
const About = require('./models/About');
const Order = require('./models/Order');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve images from "uploads" folder

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// --- Image Upload Route ---
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// --- Article Routes ---

// POST: Create new article (with image URL)
app.post('/articles', async (req, res) => {
  console.log('Article creation data:', req.body); // See if image field is included

  try {
    const { title, content, author, image } = req.body;
    const article = new Article({ title, content, author, image });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add article' });
  }
});


// GET: All articles
app.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET: Single article
app.get('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// PUT: Update article
app.put('/articles/:id', async (req, res) => {
  try {
    const { title, content, author, image } = req.body;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { title, content, author, image },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE: Remove article
app.delete('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// --- Product Routes (Optional, clean up if needed) ---

app.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// --- User Routes ---

app.post('/users', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required' });

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(409).json({ error: 'Username already exists' });

    const user = new User({ username, password });
    await user.save();

    res.status(201).json({ id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// --- Login Route (Simple check, not secure) ---
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: username.trim(), password: password.trim() });
    if (!user) return res.status(401).json({ message: 'Invalid username or password' });
    res.json({ token: 'dummy-token' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const aboutUpload = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/about/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const aboutUploader = multer({ storage: aboutUpload });

// Ensure uploads/about directory exists
if (!fs.existsSync('uploads/about')) {
  fs.mkdirSync('uploads/about', { recursive: true });
}

// GET current about content
app.get('/about', async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About({ text: '', media: [] });
      await about.save();
    }
    res.json(about);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch about content' });
  }
});

// PUT update about content
app.put('/about', aboutUploader.array('media'), async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About();
    }

    about.text = req.body.text || '';

    // Handle media uploads
    if (req.files && req.files.length > 0) {
      const filenames = req.files.map((file) => file.filename);
      about.media.push(...filenames);
    }

    // Handle external links (support both array and single string)
    if (req.body.externalLinks) {
      if (Array.isArray(req.body.externalLinks)) {
        about.externalLinks = req.body.externalLinks;
      } else {
        about.externalLinks = [req.body.externalLinks];
      }
    }

    await about.save();
    res.json(about);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update about content' });
  }
});

// DELETE media file
app.delete('/about/media/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    const about = await About.findOne();
    if (!about) return res.status(404).json({ error: 'About not found' });

    about.media = about.media.filter((f) => f !== filename);
    await about.save();

    const filepath = path.join(__dirname, 'uploads/about/', filename);
    fs.unlink(filepath, (err) => {
      if (err) console.warn('File deletion failed:', err);
    });

    res.status(200).json({ message: 'Media deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Orders

app.post('/orders', async (req, res) => {
  try {
    const { customerEmail, items, total } = req.body;

    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    const order = new Order({
      customerEmail,
      items,
      total,
      status: 'pending', // default
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'received', 'sent'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.delete('/orders/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
