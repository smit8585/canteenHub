import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'canteen-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Database
const db = new Database('canteenhub.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    wallet_balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category_id TEXT NOT NULL,
    image_url TEXT,
    available BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'wallet',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    menu_item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed default admin and categories if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (id, email, password, name, role, wallet_balance)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), 'admin@canteen.com', hashedPassword, 'Admin', 'operator', 0);

  // Seed customer
  const customerPass = bcrypt.hashSync('customer123', 10);
  db.prepare(`
    INSERT INTO users (id, email, password, name, role, wallet_balance)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), 'customer@test.com', customerPass, 'Test Customer', 'customer', 500);
}

const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (categoryCount.count === 0) {
  const categories = [
    { name: 'Breakfast', order: 1 },
    { name: 'Lunch', order: 2 },
    { name: 'Snacks', order: 3 },
    { name: 'Beverages', order: 4 },
    { name: 'Desserts', order: 5 }
  ];
  
  categories.forEach(cat => {
    db.prepare('INSERT INTO categories (id, name, display_order) VALUES (?, ?, ?)').run(
      uuidv4(),
      cat.name,
      cat.order
    );
  });

  // Add sample menu items
  const breakfastId = db.prepare('SELECT id FROM categories WHERE name = ?').get('Breakfast').id;
  const snacksId = db.prepare('SELECT id FROM categories WHERE name = ?').get('Snacks').id;
  const beveragesId = db.prepare('SELECT id FROM categories WHERE name = ?').get('Beverages').id;

  const sampleItems = [
    { name: 'Idli Sambar', description: 'Soft steamed rice cakes with sambar', price: 40, category: breakfastId },
    { name: 'Masala Dosa', description: 'Crispy dosa with potato filling', price: 60, category: breakfastId },
    { name: 'Poha', description: 'Flattened rice with peanuts', price: 35, category: breakfastId },
    { name: 'Samosa', description: 'Crispy fried snack', price: 20, category: snacksId },
    { name: 'Vada Pav', description: 'Mumbai street food', price: 25, category: snacksId },
    { name: 'Chai', description: 'Indian tea', price: 15, category: beveragesId },
    { name: 'Coffee', description: 'Filter coffee', price: 20, category: beveragesId },
  ];

  sampleItems.forEach(item => {
    db.prepare(`
      INSERT INTO menu_items (id, name, description, price, category_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), item.name, item.description, item.price, item.category);
  });
}

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const operatorOnly = (req, res, next) => {
  if (req.user.role !== 'operator') {
    return res.status(403).json({ error: 'Operator access required' });
  }
  next();
};

// Routes

// Auth
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = uuidv4();

    db.prepare(`
      INSERT INTO users (id, email, password, name, role, wallet_balance)
      VALUES (?, ?, ?, ?, 'customer', 0)
    `).run(id, email, hashedPassword, name);

    const token = jwt.sign({ id, email, role: 'customer' }, JWT_SECRET);
    res.json({ token, user: { id, email, name, role: 'customer', wallet_balance: 0 } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet_balance: user.wallet_balance
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Categories
app.get('/api/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY display_order').all();
  res.json(categories);
});

app.post('/api/categories', authMiddleware, operatorOnly, (req, res) => {
  try {
    const { name, display_order } = req.body;
    const id = uuidv4();
    db.prepare('INSERT INTO categories (id, name, display_order) VALUES (?, ?, ?)').run(id, name, display_order || 999);
    res.json({ id, name, display_order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Menu Items
app.get('/api/menu', (req, res) => {
  const items = db.prepare(`
    SELECT m.*, c.name as category_name
    FROM menu_items m
    JOIN categories c ON m.category_id = c.id
    WHERE m.available = 1
    ORDER BY c.display_order, m.name
  `).all();
  res.json(items);
});

app.get('/api/menu/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

app.post('/api/menu', authMiddleware, operatorOnly, (req, res) => {
  try {
    const { name, description, price, category_id, image_url } = req.body;
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO menu_items (id, name, description, price, category_id, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, description, price, category_id, image_url || null);

    res.json({ id, name, description, price, category_id, image_url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/menu/:id', authMiddleware, operatorOnly, (req, res) => {
  try {
    const { name, description, price, category_id, available, image_url } = req.body;
    
    db.prepare(`
      UPDATE menu_items
      SET name = ?, description = ?, price = ?, category_id = ?, available = ?, image_url = ?
      WHERE id = ?
    `).run(name, description, price, category_id, available ? 1 : 0, image_url, req.params.id);

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/menu/:id', authMiddleware, operatorOnly, (req, res) => {
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Orders
app.get('/api/orders', authMiddleware, (req, res) => {
  let orders;
  
  if (req.user.role === 'operator') {
    orders = db.prepare(`
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `).all();
  } else {
    orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  }

  // Get order items for each order
  orders.forEach(order => {
    order.items = db.prepare(`
      SELECT oi.*, m.name as item_name
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `).all(order.id);
  });

  res.json(orders);
});

app.post('/api/orders', authMiddleware, (req, res) => {
  try {
    const { items } = req.body; // [{menu_item_id, quantity}]
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    
    // Calculate total
    let totalAmount = 0;
    const orderItems = [];

    items.forEach(item => {
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(item.menu_item_id);
      if (!menuItem || !menuItem.available) {
        throw new Error(`Item ${item.menu_item_id} not available`);
      }
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: menuItem.price
      });
    });

    if (user.wallet_balance < totalAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    const orderId = uuidv4();
    
    db.prepare('BEGIN').run();
    
    try {
      // Create order
      db.prepare(`
        INSERT INTO orders (id, user_id, total_amount, status)
        VALUES (?, ?, ?, 'pending')
      `).run(orderId, req.user.id, totalAmount);

      // Add order items
      orderItems.forEach(item => {
        db.prepare(`
          INSERT INTO order_items (id, order_id, menu_item_id, quantity, price)
          VALUES (?, ?, ?, ?, ?)
        `).run(uuidv4(), orderId, item.menu_item_id, item.quantity, item.price);
      });

      // Deduct from wallet
      db.prepare('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?').run(totalAmount, req.user.id);

      // Add transaction
      db.prepare(`
        INSERT INTO transactions (id, user_id, amount, type, description)
        VALUES (?, ?, ?, 'debit', ?)
      `).run(uuidv4(), req.user.id, totalAmount, `Order #${orderId.substring(0, 8)}`);

      db.prepare('COMMIT').run();

      res.json({ orderId, totalAmount, status: 'pending' });
    } catch (error) {
      db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', authMiddleware, operatorOnly, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (status === 'completed') {
      db.prepare('UPDATE orders SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
    } else {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Wallet
app.get('/api/wallet', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT wallet_balance FROM users WHERE id = ?').get(req.user.id);
  const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.user.id);
  res.json({ balance: user.wallet_balance, transactions });
});

app.post('/api/wallet/add', authMiddleware, (req, res) => {
  try {
    const { amount } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?').run(amount, req.user.id);
    
    db.prepare(`
      INSERT INTO transactions (id, user_id, amount, type, description)
      VALUES (?, ?, ?, 'credit', 'Wallet recharge')
    `).run(uuidv4(), req.user.id, amount);

    const user = db.prepare('SELECT wallet_balance FROM users WHERE id = ?').get(req.user.id);
    res.json({ balance: user.wallet_balance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Analytics (Operator only)
app.get('/api/analytics/dashboard', authMiddleware, operatorOnly, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const todaySales = db.prepare(`
    SELECT SUM(total_amount) as total
    FROM orders
    WHERE DATE(created_at) = ?
  `).get(today);

  const todayOrders = db.prepare(`
    SELECT COUNT(*) as count
    FROM orders
    WHERE DATE(created_at) = ?
  `).get(today);

  const pendingOrders = db.prepare(`
    SELECT COUNT(*) as count
    FROM orders
    WHERE status IN ('pending', 'preparing')
  `).get();

  const topItems = db.prepare(`
    SELECT m.name, SUM(oi.quantity) as total_quantity, SUM(oi.quantity * oi.price) as total_sales
    FROM order_items oi
    JOIN menu_items m ON oi.menu_item_id = m.id
    JOIN orders o ON oi.order_id = o.id
    WHERE DATE(o.created_at) = ?
    GROUP BY m.id
    ORDER BY total_quantity DESC
    LIMIT 5
  `).all(today);

  const recentOrders = db.prepare(`
    SELECT o.*, u.name as customer_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 10
  `).all();

  res.json({
    todaySales: todaySales.total || 0,
    todayOrders: todayOrders.count || 0,
    pendingOrders: pendingOrders.count || 0,
    topItems,
    recentOrders
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🍽️  CanteenHub running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n📝 Default credentials:');
  console.log('   Operator: admin@canteen.com / admin123');
  console.log('   Customer: customer@test.com / customer123');
});
