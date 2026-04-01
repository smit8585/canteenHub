# 🚀 CanteenHub Frontend - Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- Backend API running on port 3000

## Setup & Run (3 steps)

### 1. Install Dependencies
```bash
cd /root/.openclaw/workspace-incognito/canteenhub/frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Visit: **http://localhost:5173**

---

## Test Accounts

### As Customer
1. Click "Sign Up"
2. Create account with role: **Customer**
3. Access: Menu, Orders, Wallet

### As Operator
1. Click "Sign Up"
2. Create account with role: **Canteen Operator**
3. Access: Dashboard, Menu Management, Order Management

---

## Features Overview

### Customer Flow
1. **Login** → Choose "Customer" role
2. **Menu** → Browse items, add to cart
3. **Wallet** → Add money (needed for orders)
4. **Place Order** → Cart → "Place Order"
5. **Orders** → Track status

### Operator Flow
1. **Login** → Choose "Canteen Operator" role
2. **Dashboard** → View stats & recent orders
3. **Menu Management** → Add/Edit/Delete items
4. **Order Management** → Confirm/Ready/Complete orders

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

### Cannot Connect to Backend
- Ensure backend is running on port 3000
- Check backend logs for errors
- Verify API proxy in vite.config.js

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Production Build

```bash
# Build optimized bundle
npm run build

# Output: dist/ folder

# Preview production build locally
npm run preview
```

---

## API Endpoints Used

The frontend communicates with these backend endpoints:

**Auth**
- POST `/api/auth/register`
- POST `/api/auth/login`

**Menu**
- GET `/api/menu`
- POST `/api/menu` (operator)
- PUT `/api/menu/:id` (operator)
- DELETE `/api/menu/:id` (operator)

**Orders**
- GET `/api/orders`
- POST `/api/orders`
- PUT `/api/orders/:id/status` (operator)

**Wallet**
- GET `/api/wallet`
- POST `/api/wallet/add`

---

## Project Stats

- **2,239 lines** of React code
- **15 files** created
- **7 pages** (4 customer + 3 operator)
- **Dark theme** with responsive design
- **Role-based** access control

---

## Next Steps

1. **Customize**: Update colors in `src/global.css`
2. **Add Features**: Ratings, search, filters, etc.
3. **Deploy**: Build and serve with nginx/Apache
4. **Enhance**: Add real-time updates with WebSockets

---

**Need help?** Check README.md for detailed documentation.
