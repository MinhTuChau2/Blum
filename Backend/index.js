const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Product = require('./models/Product');
const Article = require('./models/Article');
const User = require('./models/User');
const About = require('./models/About');
const Order = require('./models/Order');
const auth = require('./middleware/auth');

const app = express();

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- CORS & Middleware ---
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001', 'https://blum-frontend.onrender.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));

app.use(express.json());

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// --- Helper: Extract Cloudinary Public ID ---
const extractPublicIdFromUrl = (url) => {
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const pathAndExt = parts[1].replace(/^v\d+\//, ''); // Strip version tag v12345/
    const publicId = pathAndExt.substring(0, pathAndExt.lastIndexOf('.'));
    return publicId;
  } catch (e) {
    return null;
  }
};

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.status(200).send('Blum Backend is running!');
});

// --- Login Route (JWT & bcrypt) ---
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password.trim());
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'blum_fallback_secret_key_2026',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// --- Image Upload Route (Protected) ---
app.post('/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const cld_upload_stream = cloudinary.uploader.upload_stream(
    { folder: 'blum_uploads' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: 'Cloudinary upload failed' });
      }
      res.json({ imageUrl: result.secure_url });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
});

// --- Article Routes ---

// GET: All articles (Public)
app.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET: Single article (Public)
app.get('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST: Create article (Protected)
app.post('/articles', auth, async (req, res) => {
  try {
    const { title, content, author, image } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const article = new Article({ title, content, author, image });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add article' });
  }
});

// PUT: Update article (Protected)
app.put('/articles/:id', auth, async (req, res) => {
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

// DELETE: Remove article (Protected)
app.delete('/articles/:id', auth, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// --- Product Routes ---

// GET: Products with search, filtering, and optional pagination (Public)
app.get('/products', async (req, res) => {
  try {
    const { search, category, page, limit, sort } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // If pagination params are provided
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 10);
      const skip = (pageNum - 1) * limitNum;

      const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : { createdAt: -1 };

      const [products, total] = await Promise.all([
        Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
        Product.countDocuments(query),
      ]);

      return res.json({
        products,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST: Add product (Protected)
app.post('/products', auth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// PUT: Update product (Protected)
app.put('/products/:id', auth, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE: Delete product (Protected)
app.delete('/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// --- User Routes (Protected) ---

app.post('/users', auth, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required' });

    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser)
      return res.status(409).json({ error: 'Username already exists' });

    const user = new User({ username: username.trim(), password: password.trim() });
    await user.save();

    res.status(201).json({ id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

app.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.delete('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// --- About Routes ---

// GET: Current about content (Public)
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

// PUT: Update about content (Protected)
app.put('/about', auth, upload.array('media'), async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) about = new About();

    about.text = req.body.text || '';

    let uploadedUrls = [];
    if (req.files?.length) {
      uploadedUrls = await Promise.all(
        req.files.map(file =>
          new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: 'about_media' },
              (err, result) => err ? reject(err) : resolve(result.secure_url)
            ).end(file.buffer);
          })
        )
      );
    }

    const mediaOrder = req.body.mediaOrder
      ? Array.isArray(req.body.mediaOrder)
        ? req.body.mediaOrder
        : [req.body.mediaOrder]
      : [];

    about.media = [
      ...mediaOrder,
      ...uploadedUrls.filter(url => !mediaOrder.includes(url))
    ];

    if (req.body.externalLinks) {
      about.externalLinks = Array.isArray(req.body.externalLinks)
        ? req.body.externalLinks
        : [req.body.externalLinks];
    }

    await about.save();
    res.json(about);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update about content' });
  }
});

// DELETE: Media URL from about.media + Cloudinary deletion (Protected)
app.delete('/about/media', auth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Media URL required' });

    const about = await About.findOne();
    if (!about) return res.status(404).json({ error: 'About not found' });

    about.media = about.media.filter(mediaUrl => mediaUrl !== url);
    await about.save();

    // Clean up Cloudinary file
    const publicId = extractPublicIdFromUrl(url);
    if (publicId) {
      cloudinary.uploader.destroy(publicId, (err, result) => {
        if (err) console.error('Cloudinary destroy error:', err);
        else console.log('Cloudinary destroy result:', result);
      });
    }

    res.status(200).json({ message: 'Media URL removed and asset cleaned from Cloudinary' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// --- Orders Routes ---

// POST: Create Order (Public for customer checkout)
app.post('/orders', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items, total } = req.body;

    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const order = new Order({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      total: total || 0,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET: All Orders (Protected)
app.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT: Update order status & payment status (Protected)
app.put('/orders/:id/status', auth, async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber } = req.body;
    let updateFields = {};

    if (status) {
      const allowedStatuses = ['pending', 'received', 'processing', 'shipped', 'delivered', 'cancelled', 'sent'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      updateFields.status = status;
    }

    if (paymentStatus) {
      if (!['unpaid', 'paid', 'refunded'].includes(paymentStatus)) {
        return res.status(400).json({ error: 'Invalid payment status' });
      }
      updateFields.paymentStatus = paymentStatus;
    }

    if (trackingNumber !== undefined) {
      updateFields.trackingNumber = trackingNumber;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
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

// DELETE: Order (Protected)
app.delete('/orders/:id', auth, async (req, res) => {
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

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
