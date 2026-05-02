import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI;
let dbConnected = false;

// قاعدة بيانات مؤقتة للتشغيل في حالة فشل الاتصال بـ Atlas
const localDb = {
  restaurants: [] as any[],
  menuItems: [] as any[],
};

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas');
      dbConnected = true;
    })
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
      console.warn('🚀 Switching to DEMO MODE (Local Memory). Data will not persist.');
      dbConnected = false;
    });
}

// Schemas
const restaurantSchema = new mongoose.Schema({
  name: String,
  ownerName: String,
  email: String,
  subdomain: { type: String, unique: true },
  menuUrl: String, // رابط المنيو الخارجي
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // افتراضي شهر
  createdAt: { type: Date, default: Date.now },
});

const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  name: String,
  price: Number,
  image: String,
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// 1. Check Subscription Status
app.get('/api/check/:subdomain', async (req, res) => {
  try {
    let restaurant;
    if (dbConnected) {
      restaurant = await Restaurant.findOne({ subdomain: req.params.subdomain });
    } else {
      restaurant = localDb.restaurants.find(r => r.subdomain === req.params.subdomain);
    }

    if (!restaurant) {
      return res.json({ 
        isActive: false, 
        message: "المطعم غير موجود" 
      });
    }

    const now = new Date();
    const isExpired = new Date(restaurant.expiresAt) < now;

    if (!restaurant.isActive || isExpired) {
      // إذا كان منتهي، نحدث الحالة في الخلفية لو كنا في DB
      if (dbConnected && restaurant.isActive && isExpired) {
        restaurant.isActive = false;
        await restaurant.save();
      } else if (!dbConnected && restaurant.isActive && isExpired) {
        restaurant.isActive = false;
      }

      return res.json({ 
        isActive: false, 
        message: "❌ الاشتراك غير مفعل",
        whatsapp: "https://wa.me/966550340929",
        phone: "966550340929"
      });
    }

    res.json({ 
      isActive: true,
      menuUrl: restaurant.menuUrl 
    });
  } catch (err) {
    res.status(500).json({ isActive: false, message: "خطأ في السيرفر" });
  }
});

// 2. Add Restaurant
app.post('/api/restaurants', async (req, res) => {
  try {
    const { name, ownerName, email, subdomain, menuUrl } = req.body;
    const data = {
      name,
      ownerName,
      email,
      subdomain,
      menuUrl,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: new Date(),
      _id: new mongoose.Types.ObjectId()
    };

    if (dbConnected) {
      const restaurant = new Restaurant(data);
      await restaurant.save();
      res.status(201).json(restaurant);
    } else {
      localDb.restaurants.push(data);
      res.status(201).json(data);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error adding restaurant' });
  }
});

// 3. Get All Restaurants
app.get('/api/restaurants', async (req, res) => {
  try {
    if (dbConnected) {
      const restaurants = await Restaurant.find().sort('-createdAt');
      res.json(restaurants);
    } else {
      res.json([...localDb.restaurants].reverse());
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurants' });
  }
});

// 4. Toggle Status
app.put('/api/restaurants/:id/toggle', async (req, res) => {
  try {
    if (dbConnected) {
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) return res.status(404).json({ message: 'Not found' });
      restaurant.isActive = !restaurant.isActive;
      await restaurant.save();
      res.json(restaurant);
    } else {
      const restaurant = localDb.restaurants.find(r => r._id.toString() === req.params.id);
      if (!restaurant) return res.status(404).json({ message: 'Not found' });
      restaurant.isActive = !restaurant.isActive;
      res.json(restaurant);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// 5. Extend Subscription (30 Days)
app.put('/api/restaurants/:id/extend', async (req, res) => {
  try {
    if (dbConnected) {
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) return res.status(404).json({ message: 'Not found' });
      
      const currentExpiry = new Date(restaurant.expiresAt) > new Date() ? new Date(restaurant.expiresAt) : new Date();
      restaurant.expiresAt = new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000);
      restaurant.isActive = true;
      
      await restaurant.save();
      res.json(restaurant);
    } else {
      const restaurant = localDb.restaurants.find(r => r._id.toString() === req.params.id);
      if (!restaurant) return res.status(404).json({ message: 'Not found' });
      
      const currentExpiry = new Date(restaurant.expiresAt) > new Date() ? new Date(restaurant.expiresAt) : new Date();
      restaurant.expiresAt = new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000);
      restaurant.isActive = true;
      
      res.json(restaurant);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// 6. Delete Restaurant
app.delete('/api/restaurants/:id', async (req, res) => {
  try {
    if (dbConnected) {
      await Restaurant.findByIdAndDelete(req.params.id);
    } else {
      localDb.restaurants = localDb.restaurants.filter(r => r._id.toString() !== req.params.id);
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting' });
  }
});

// 5. Add Menu Item
app.post('/api/menu', async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error adding menu item' });
  }
});

// 6. Get Menu Items
app.get('/api/menu/:restaurantId', async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.restaurantId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu items' });
  }
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

startServer();
