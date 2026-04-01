import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Package, LogOut, Utensils, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import axios from '../../utils/auth';
import { logout, getUser } from '../../utils/auth';

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    available: true
  });
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
      setMenuItems(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load menu');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingItem) {
        await axios.put(`/menu/${editingItem.id}`, formData);
        setSuccess('Menu item updated successfully!');
      } else {
        await axios.post('/menu', formData);
        setSuccess('Menu item added successfully!');
      }
      
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', price: '', available: true });
      fetchMenu();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      available: item.available
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`/menu/${id}`);
      setSuccess('Menu item deleted successfully!');
      fetchMenu();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await axios.put(`/menu/${item.id}`, {
        ...item,
        available: !item.available
      });
      setSuccess(`Item marked as ${!item.available ? 'available' : 'unavailable'}`);
      fetchMenu();
    } catch (err) {
      setError('Failed to update availability');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ name: '', description: '', price: '', available: true });
    setError('');
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
            <Link to="/operator/menu-management" className="nav-link active">
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
        {success && <div className="message message-success">{success}</div>}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Menu Management</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={fetchMenu} className="btn btn-secondary btn-sm">
                <RefreshCw size={16} />
                Refresh
              </button>
              {!showForm && (
                <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
                  <Plus size={16} />
                  Add Item
                </button>
              )}
            </div>
          </div>

          {showForm && (
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      className="form-input"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleChange}
                    />
                    <span className="form-label" style={{ marginBottom: 0 }}>Available</span>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-success">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button type="button" onClick={cancelForm} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {menuItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <div className="empty-state-text">No menu items yet</div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.description}</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                        ₹{item.price}
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`badge ${item.available ? 'badge-success' : 'badge-danger'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                        >
                          {item.available ? 'Available' : 'Unavailable'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-danger btn-sm"
                          >
                            <Trash2 size={14} />
                          </button>
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

export default MenuManagement;
