import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Wallet, LogOut, Utensils, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from '../../utils/auth';
import { logout, getUser } from '../../utils/auth';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders');
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', icon: Clock, text: 'Pending' },
      confirmed: { class: 'badge-success', icon: CheckCircle, text: 'Confirmed' },
      ready: { class: 'badge-success', icon: CheckCircle, text: 'Ready' },
      completed: { class: 'badge-secondary', icon: CheckCircle, text: 'Completed' },
      cancelled: { class: 'badge-danger', icon: XCircle, text: 'Cancelled' }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`badge ${badge.class}`}>
        <Icon size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
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
            <Link to="/menu" className="nav-link">Menu</Link>
            <Link to="/orders" className="nav-link active">
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
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">My Orders</h2>
            <button onClick={fetchOrders} className="btn btn-secondary btn-sm">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {error && <div className="message message-error">{error}</div>}

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-text">No orders yet</div>
              <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ marginBottom: '0.25rem' }}>
                            {item.name} × {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                        ₹{order.total_amount}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(order.created_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;
