const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product'); 
const Article = require('./models/Article'); 
const User = require('./models/User'); // <-- add this

const multer = require('multer');
const path = require('path'); // ✅ Add this line
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());





app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Set up Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Handle image uploads
app.post('/upload', upload.single('image'), (req, res) => {
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// (Other routes like /products etc. go here)

// Start the server
app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// --- Product routes ---

// POST: Add new product
app.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// DELETE: Delete product by ID
app.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET: Fetch all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// --- Article routes ---

// POST: Add new article
app.post('/articles', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const article = new Article({ title, content, author });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add article' });
  }
});

// GET: Fetch all articles
app.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET: Fetch single article by ID
app.get('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// PUT: Update article by ID
app.put('/articles/:id', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { title, content, author },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE: Delete article by ID
app.delete('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// --- User routes ---

// POST: Add new user
app.post('/users', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const user = new User({ username, password });
    await user.save();

    // Return user data without password for security reasons
    res.status(201).json({ id: user._id, username: user.username });

  } catch (err) {
    console.error('Failed to add user:', err);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// GET: Fetch all users
app.get('/users', async (req, res) => {
  try {
    // Return users without passwords for security
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DELETE: Delete user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user with matching username and password
    const user = await User.findOne({ username: username.trim(), password: password.trim() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // User found — generate token or just respond success
    // For example, generate a simple JWT token if you want
    // Here just sending success for demonstration
    return res.json({ token: 'dummy-token' }); 

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Server start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
