# CanteenHub Frontend - File Structure

```
canteenhub/frontend/
│
├── index.html                 # HTML entry point
├── package.json              # Dependencies & scripts
├── vite.config.js           # Vite config with API proxy
├── README.md                # Documentation
├── .gitignore              # Git ignore rules
│
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Router & route protection
    ├── global.css          # Dark theme styles
    │
    ├── utils/
    │   └── auth.js         # Auth functions & axios setup
    │
    └── pages/
        ├── customer/
        │   ├── Login.jsx       # Login/Register (both roles)
        │   ├── Menu.jsx        # Browse menu, cart, place order
        │   ├── Orders.jsx      # Order history & status
        │   └── Wallet.jsx      # Balance, add money, transactions
        │
        └── operator/
            ├── Dashboard.jsx         # Stats & recent orders
            ├── MenuManagement.jsx    # CRUD menu items
            └── OrderManagement.jsx   # Update order status
```

## File Count
- **15 files** created
- **3 customer pages** (+ shared Login)
- **3 operator pages**
- **1 auth utility** with axios config
- **1 global CSS** with dark theme
- **Complete routing** with role-based protection

## Routes

### Public
- `/login` - Login/Register

### Customer Routes (protected)
- `/menu` - Browse & order
- `/orders` - Order history
- `/wallet` - Wallet management

### Operator Routes (protected)
- `/operator/dashboard` - Overview
- `/operator/menu-management` - Menu CRUD
- `/operator/order-management` - Order status updates

## Key Features Implemented

✅ JWT authentication with auto-refresh  
✅ Role-based access control  
✅ Protected routes  
✅ API proxy to backend  
✅ Dark theme UI  
✅ Mobile responsive  
✅ Lucide icons  
✅ Axios interceptors  
✅ Local storage for auth  
✅ Error handling  
✅ Success messages  
✅ Loading states  
✅ Empty states  
✅ Real-time data refresh  

## Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "lucide-react": "^0.294.0",
  "@vitejs/plugin-react": "^4.2.1",
  "vite": "^5.0.8"
}
```

## Getting Started

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000 (proxied)
