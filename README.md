# 🍽️ CanteenHub - Digital Canteen Management System

A complete canteen management platform with customer ordering and operator dashboard.

## Features

### Customer Portal
- Browse menu by categories
- Add items to cart
- Place orders with wallet
- Track order status in real-time
- View order history
- Manage wallet balance

### Operator Dashboard
- Menu management (CRUD)
- Order management (update status)
- Sales analytics
- Real-time order tracking
- Category management

## Tech Stack
- React 18 + React Router
- Node.js + Express
- SQLite database
- JWT authentication
- Responsive design

## Quick Start

### Installation
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Running
```bash
# Backend (Terminal 1)
cd backend
npm start
# Runs on http://localhost:3000

# Frontend (Terminal 2)
cd frontend
npm run dev
# Runs on http://localhost:5173
```

## Default Credentials

**Operator:**
- Email: admin@canteen.com
- Password: admin123

**Customer:**
- Email: customer@test.com
- Password: customer123
- Wallet: ₹500

## Database Schema

- **users** - Customer & operator accounts
- **categories** - Menu categories
- **menu_items** - Food items
- **orders** - Customer orders
- **order_items** - Order line items
- **transactions** - Wallet transactions

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new customer
- POST `/api/auth/login` - Login

### Menu
- GET `/api/menu` - Get all items
- POST `/api/menu` - Create item (operator only)
- PUT `/api/menu/:id` - Update item (operator only)
- DELETE `/api/menu/:id` - Delete item (operator only)

### Orders
- GET `/api/orders` - Get orders
- POST `/api/orders` - Place order
- PUT `/api/orders/:id/status` - Update status (operator only)

### Wallet
- GET `/api/wallet` - Get balance & transactions
- POST `/api/wallet/add` - Add money

### Analytics
- GET `/api/analytics/dashboard` - Dashboard stats (operator only)

## Order Status Flow

```
pending → preparing → ready → completed
         ↓
     cancelled
```

## License
MIT
