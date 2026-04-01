import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Wallet, Package, LogOut, Utensils } from 'lucide-react';
import axios from '../../utils/auth';
import { logout, getUser } from '../../utils/auth';

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get('/menu');
      setMenuItems(response.data.filter(item => item.available));
      setLoading(false);
    } catch (err) {
      setError('Failed to load menu');
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart({
      ...cart,
      [item.id]: {
        ...item,
        quantity: (cart[item.id]?.quantity || 0) + 1
      }
    });
  };

  const removeFromCart = (itemId) => {
    const newCart = { ...cart };
    if (newCart[itemId].quantity > 1) {
      newCart[itemId].quantity -= 1;
    } else {
      delete newCart[itemId];
    }
    setCart(newCart);
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (Object.keys(cart).length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      const items = Object.values(cart).map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }));

      await axios.post('/orders', { items });
      setSuccess('Order placed successfully!');
      setCart({});
      setTimeout(() => {
        setSuccess('');
        navigate('/orders');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  return (
    <div className="page">
      <nav className="nav">
        <div className="nav-content">
          <div className="nav-brand">
            <Utensils size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
            CanteenHub
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Welcome, {user?.name}
          </div>
          <div className="nav-links">
            <Link to="/menu" className="nav-link active">Menu</Link>
            <Link to="/orders" className="nav-link">
              <Package size={18} />
              Orders
            </Link>
            <Link to="/wallet" className="nav-link">
              <Wallet size={18} />
              Wallet
            </Link>
            <button onClick={handleLogout} className="nav-link">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
          <div>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Menu</h2>
            
            {menuItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🍽️</div>
                <div className="empty-state-text">No items available</div>
              </div>
            ) : (
              <div className="grid grid-2">
                {menuItems.map(item => (
                  <div key={item.id} className="menu-item">
                    <div className="menu-item-header">
                      <div className="menu-item-name">{item.name}</div>
                      <div className="menu-item-price">₹{item.price}</div>
                    </div>
                    <div className="menu-item-description">{item.description}</div>
                    <div className="menu-item-footer">
                      <span className="badge badge-success">Available</span>
                      {cart[item.id] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Minus size={16} />
                          </button>
                          <span style={{ fontWeight: 600, minWidth: '2rem', textAlign: 'center' }}>
                            {cart[item.id].quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="btn btn-primary btn-sm"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="btn btn-primary btn-sm"
                        >
                          <Plus size={16} />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cart-summary" style={{ minWidth: '280px' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={20} />
              Cart
            </h3>
            
            {Object.keys(cart).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                Cart is empty
              </div>
            ) : (
              <>
                {Object.values(cart).map(item => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        ₹{item.price} × {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
                
                <div className="cart-total">
                  <span>Total</span>
                  <span style={{ color: 'var(--accent-primary)' }}>₹{getCartTotal()}</span>
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  className="btn btn-success"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  Place Order
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menu;
