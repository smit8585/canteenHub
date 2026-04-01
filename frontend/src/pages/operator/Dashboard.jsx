import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Package, LogOut, Utensils, RefreshCw, TrendingUp, IndianRupee } from 'lucide-react';
import axios from '../../utils/auth';
import { logout, getUser } from '../../utils/auth';

function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    totalMenuItems: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [ordersRes, menuRes] = await Promise.all([
        axios.get('/orders'),
        axios.get('/menu')
      ]);

      const orders = ordersRes.data;
      const menuItems = menuRes.data;

      // Calculate stats
      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');

      setStats({
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
        totalMenuItems: menuItems.length
      });

      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
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
            <Link to="/operator/dashboard" className="nav-link active">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link to="/operator/menu-management" className="nav-link">
              <UtensilsCrossed size={18} />
              Menu
            </Link>
            <Link to="/operator/order-management" className="nav-link">
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Dashboard</h1>
          <button onClick={fetchDashboard} className="btn btn-secondary btn-sm">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>
              {stats.pendingOrders}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              ₹{stats.todayRevenue.toFixed(2)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Menu Items</div>
            <div className="stat-value">{stats.totalMenuItems}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Orders</h2>
            <Link to="/operator/order-management" className="btn btn-primary btn-sm">
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-text">No orders yet</div>
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
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.9rem' }}>
                            {item.name} × {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                        ₹{order.total_amount}
                      </td>
                      <td>
                        <span className={`badge badge-${
                          order.status === 'completed' ? 'secondary' :
                          order.status === 'cancelled' ? 'danger' :
                          order.status === 'ready' ? 'success' :
                          'warning'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {new Date(order.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
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

export default Dashboard;
