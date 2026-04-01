# CanteenHub Frontend

Modern React frontend for the CanteenHub canteen ordering system.

## Features

### Customer Features
- **Login/Register**: Secure authentication for customers and operators
- **Menu Browsing**: View available food items with prices and descriptions
- **Shopping Cart**: Add/remove items with quantity management
- **Order Placement**: Place orders using wallet balance
- **Order Tracking**: View order history and status
- **Wallet Management**: Add funds and view transaction history

### Operator Features
- **Dashboard**: Overview of orders, revenue, and menu items
- **Menu Management**: Add, edit, delete, and toggle availability of items
- **Order Management**: View and update order status (pending → confirmed → ready → completed)
- **Real-time Stats**: Track pending orders and daily revenue

## Tech Stack

- **React 18** - UI framework
- **React Router 6** - Navigation
- **Axios** - API communication
- **Lucide React** - Modern icons
- **Vite** - Fast build tool

## Setup

### Prerequisites
- Node.js 16+ and npm
- Backend API running on port 3000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on http://localhost:5173

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── pages/
│   ├── customer/
│   │   ├── Login.jsx        # Authentication page
│   │   ├── Menu.jsx         # Browse menu & cart
│   │   ├── Orders.jsx       # Order history
│   │   └── Wallet.jsx       # Wallet & transactions
│   └── operator/
│       ├── Dashboard.jsx         # Stats & overview
│       ├── MenuManagement.jsx    # CRUD for menu items
│       └── OrderManagement.jsx   # Order status updates
├── utils/
│   └── auth.js              # Auth helpers & axios config
├── App.jsx                  # Router & protected routes
├── global.css              # Dark theme styles
└── main.jsx                # App entry point
```

## API Proxy

The frontend proxies `/api/*` requests to `http://localhost:3000` (configured in vite.config.js).

## Design

- **Dark Theme**: Modern dark UI optimized for readability
- **Mobile Responsive**: Works on all screen sizes
- **Clean Layout**: Card-based design with intuitive navigation

## Usage

### As a Customer
1. Register/Login as customer
2. Browse menu and add items to cart
3. Place order (requires wallet balance)
4. Add money to wallet if needed
5. Track order status in Orders page

### As an Operator
1. Register/Login as operator
2. Manage menu items (add/edit/delete/toggle availability)
3. Monitor incoming orders on dashboard
4. Update order status: Pending → Confirmed → Ready → Completed

## Authentication

- JWT tokens stored in localStorage
- Auto-attached to all API requests
- Auto-redirect to login on 401 errors
- Role-based route protection

## Environment

No environment variables needed - API endpoint is proxied via Vite config.

## License

MIT
