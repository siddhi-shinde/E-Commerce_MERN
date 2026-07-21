import { useEffect, useState } from 'react';
import { FaUsers, FaBoxOpen, FaClipboardList, FaRupeeSign } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { formatCurrency } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="mk-stat-card d-flex align-items-center gap-3">
    <div
      className="d-flex align-items-center justify-content-center rounded-3"
      style={{ width: 48, height: 48, background: color + '1a', color }}
    >
      <Icon size={20} />
    </div>
    <div>
      <div className="mk-stat-value">{value}</div>
      <div className="mk-stat-label">{label}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          axiosInstance.get('/users/getAllUsers'),
          axiosInstance.get('/products/getAllProducts', { params: { limit: 1000 } }),
          axiosInstance.get('/orders/getAllOrders'),
        ]);

        const orders = ordersRes.data.orders;
        const revenue = orders
          .filter((o) => o.orderStatus !== 'cancelled')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        setStats({
          totalUsers: usersRes.data.count,
          vendors: usersRes.data.users.filter((u) => u.role === 'vendor').length,
          customers: usersRes.data.users.filter((u) => u.role === 'customer').length,
          totalProducts: productsRes.data.total ?? productsRes.data.count,
          totalOrders: ordersRes.data.count,
          revenue,
        });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <Loader label="Loading dashboard..." minHeight="40vh" />;

  return (
    <div>
      <h4 className="mb-4">Admin Dashboard</h4>
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard icon={FaUsers} label="Total Users" value={stats.totalUsers} color="#4f46e5" />
        </div>
        <div className="col-md-3">
          <StatCard icon={FaBoxOpen} label="Total Products" value={stats.totalProducts} color="#f59e0b" />
        </div>
        <div className="col-md-3">
          <StatCard icon={FaClipboardList} label="Total Orders" value={stats.totalOrders} color="#16a34a" />
        </div>
        <div className="col-md-3">
          <StatCard icon={FaRupeeSign} label="Revenue (non-cancelled)" value={formatCurrency(stats.revenue)} color="#dc2626" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="mk-stat-card">
            <div className="mk-stat-label mb-2">User breakdown</div>
            <div className="d-flex justify-content-between small mb-1">
              <span>Customers</span>
              <strong>{stats.customers}</strong>
            </div>
            <div className="d-flex justify-content-between small mb-1">
              <span>Vendors</span>
              <strong>{stats.vendors}</strong>
            </div>
            <div className="d-flex justify-content-between small">
              <span>Admins</span>
              <strong>{stats.totalUsers - stats.customers - stats.vendors}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
