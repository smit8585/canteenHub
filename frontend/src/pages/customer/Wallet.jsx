import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet as WalletIcon, Package, LogOut, Utensils, Plus, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import axios from '../../utils/auth';
import { logout, getUser } from '../../utils/auth';

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get('/wallet');
      setBalance(response.data.balance);
      setTransactions(response.data.transactions || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load wallet');
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await axios.post('/wallet/add', { amount: amountNum });
      setSuccess(`₹${amountNum} added successfully!`);
      setAmount('');
      fetchWallet();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add money');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading wallet...</div>;
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
            <Link to="/orders" className="nav-link">
              <Package size={18} />
              Orders
            </Link>
            <Link to="/wallet" className="nav-link active">
              <WalletIcon size={18} />
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Current Balance
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  ₹{balance.toFixed(2)}
                </div>
              </div>
              <WalletIcon size={48} style={{ color: 'var(--accent-primary)', opacity: 0.3 }} />
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Add Money</h3>
            <form onSubmit={handleAddMoney}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                <Plus size={18} />
                Add Money
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Transaction History</h2>
            <button onClick={fetchWallet} className="btn btn-secondary btn-sm">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-text">No transactions yet</div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn, idx) => (
                    <tr key={idx}>
                      <td>
                        {txn.type === 'credit' ? (
                          <span className="badge badge-success">
                            <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                            Credit
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            <TrendingDown size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                            Debit
                          </span>
                        )}
                      </td>
                      <td>{txn.description}</td>
                      <td style={{ 
                        fontWeight: 600,
                        color: txn.type === 'credit' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {txn.type === 'credit' ? '+' : '-'}₹{Math.abs(txn.amount).toFixed(2)}
                      </td>
                      <td>₹{txn.balance_after?.toFixed(2) || '---'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(txn.created_at).toLocaleString('en-IN', {
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

export default Wallet;
