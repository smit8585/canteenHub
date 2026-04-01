import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Package, LogOut, Utensils, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from '../../utils/auth';
import { logout, getUser } from '../../utils/auth';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, ready, completed, cancelled
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/orders/${orderId}/status`, { status: newStatus });
      setSuccess(`Order #${orderId} marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update order');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', text: 'Pending' },
      confirmed: { class: 'badge-success', text: 'Confirmed' },
      ready: { class: 'badge-success', text: 'Ready' },
      completed: { class: 'badge-secondary', text: 'Completed' },
      cancelled: { class: 'badge-danger', text: 'Cancelled' }
    };
    
    const badge = badges[status] || badges.pending;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getStatusActions = (order) => {
    const actions = [];
    
    if (order.status === 'pending') {
      actions.push(
        <button
          key="confirm"
          onClick={() => handleUpdateStatus(order.id, 'confirmed')}
          className="btn btn-success btn-sm"
        >
          <CheckCircle size={14} />
          Confirm
        </button>
      );
      actions.push(
        <button
          key="cancel"
          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
          className="btn btn-danger btn-sm"
        >
          <XCircle size={14} />
          Cancel
        </button>
      );
    } else if (order.status === 'confirmed') {
      actions.push(
        <button
          key="ready"
          onClick={() => handleUpdateStatus(order.id, 'ready')}
          className="btn btn-success btn-sm"
        >
          <CheckCircle size={14} />
          Mark Ready
        </button>
      );
    } else if (order.status === 'ready') {
      actions.push(
        <button
          key="complete"
          onClick={() => handleUpdateStatus(order.id, 'completed')}
          className="btn btn-success btn-sm"
        >
          <CheckCircle size={14} />
          Complete
        </button>
      );
    }
    
    return actions;
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
            CanteenHub Operator
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Welcome, {user?.name}
          </div>
          <div className="nav-links">
            <Link to="/operator/dashboard" className="nav-link">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link to="/operator/menu-management" className="nav-link">
              <UtensilsCrossed size={18} />
              Menu
            </Link>
            <Link to="/operator/order-management" className="nav-link active">
              <Package size={18} />
              Orders
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

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Order Management</h2>
            <button onClick={fetchOrders} className="btn btn-secondary btn-sm">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'pending', 'confirmed', 'ready', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span style={{ 
                    marginLeft: '0.5rem', 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '0.125rem 0.5rem', 
                    borderRadius: '1rem' 
                  }}>
                    {orders.filter(o => o.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-text">
                {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                            {item.name} × {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                        ₹{order.total_amount}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {new Date(order.created_at).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {getStatusActions(order)}
                        </div>
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

export default OrderManagement;
