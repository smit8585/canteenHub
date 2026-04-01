# 🍽️ CanteenHub - Quick Start

## ✅ Your App is Running!

**Frontend:** http://localhost:5174
**Backend:** http://localhost:3000

---

## 🔐 Login Credentials

### Customer Account
- **Email:** customer@test.com
- **Password:** customer123
- **Wallet:** ₹500 (pre-loaded)

### Operator/Admin Account
- **Email:** admin@canteen.com
- **Password:** admin123

---

## 🎯 Try It Out!

### As a Customer:

1. **Open:** http://localhost:5174
2. **Login** with customer credentials
3. **Browse Menu** - See items by category
4. **Add to Cart** - Click items to add
5. **Place Order** - Checkout with wallet
6. **Track Status** - Watch order progress
7. **View History** - See past orders

### As an Operator:

1. **Login** with admin credentials
2. **Dashboard** - View today's sales & orders
3. **Manage Menu** - Add/edit/delete items
4. **Manage Orders** - Update order status:
   - Pending → Preparing → Ready → Completed
5. **Analytics** - See top items & sales

---

## 📱 Features

### Customer Portal
- ✅ Menu browsing by category
- ✅ Shopping cart
- ✅ Wallet payments
- ✅ Real-time order tracking
- ✅ Order history
- ✅ Wallet top-up

### Operator Dashboard
- ✅ Sales analytics
- ✅ Order management
- ✅ Menu CRUD operations
- ✅ Category management
- ✅ Real-time order view

---

## 🛠️ Development

### Start Servers:
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

### Database:
- SQLite database: `backend/canteenhub.db`
- Auto-created with sample data
- Pre-loaded with 5 categories & 7 items

---

## 🎨 Sample Menu Items

**Breakfast:**
- Idli Sambar - ₹40
- Masala Dosa - ₹60
- Poha - ₹35

**Snacks:**
- Samosa - ₹20
- Vada Pav - ₹25

**Beverages:**
- Chai - ₹15
- Coffee - ₹20

---

## 📊 Order Flow

```
Customer places order
    ↓
Operator sees in dashboard
    ↓
Updates: Pending → Preparing
    ↓
Updates: Preparing → Ready
    ↓
Customer picks up
    ↓
Operator marks: Ready → Completed
```

---

## 💡 Tips

1. **Customer wallet** is pre-loaded with ₹500
2. **Add more items** as operator to test menu management
3. **Place multiple orders** to see analytics
4. **Try different status updates** to see real-time changes
5. **Mobile responsive** - try on phone browser

---

## 🚀 What's Next?

- Deploy to Railway (like FlowTest)
- Add real payment gateway
- Add image uploads for menu items
- SMS/Email notifications
- QR code ordering
- Table management
- Kitchen display screen

---

**Enjoy your canteen! 🍽️**
