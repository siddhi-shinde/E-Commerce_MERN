import { useEffect, useState } from 'react';
import { FaBoxOpen, FaClipboardList, FaRupeeSign, FaStar } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { formatCurrency } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="mk-stat-card d-flex align-items-center gap-3">
    <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: 48, height: 48, background: color + '1a', color }}>
      <Icon size={20} />
    </div>
    <div>
      <div className="mk-stat-value">{value}</div>
      <div className="mk-stat-label">{label}</div>
    </div>
  </div>
);

const VendorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          axiosInstance.get('/products/getMyProducts'),
          axiosInstance.get('/orders/getVendorOrders'),
        ]);

        const products = productsRes.data.products;
        const orders = ordersRes.data.orders;

        let revenue = 0;
        let unitsSold = 0;
        orders.forEach((order) => {
          if (order.orderStatus === 'cancelled') return;
          order.products.forEach((item) => {
            const isMine = products.some((p) => p._id === item.product_id);
            if (isMine) {
              revenue += item.finalPrice * item.quantity;
              unitsSold += item.quantity;
            }
          });
        });

        const avgRating =
          products.reduce((sum, p) => sum + (p.averageRating || 0), 0) / (products.filter((p) => p.totalReviews > 0).length || 1);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          revenue,
          unitsSold,
          avgRating: avgRating || 0,
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
      <h4 className="mb-4">Vendor Dashboard</h4>
      <div className="row g-3">
        <div className="col-md-3">
          <StatCard icon={FaBoxOpen} label="My Products" value={stats.totalProducts} color="#4f46e5" />
        </div>
        <div className="col-md-3">
          <StatCard icon={FaClipboardList} label="Orders Containing My Items" value={stats.totalOrders} color="#f59e0b" />
        </div>
        <div className="col-md-3">
          <StatCard icon={FaRupeeSign} label="Revenue" value={formatCurrency(stats.revenue)} color="#16a34a" />
        </div>
        <div className="col-md-3">
          <StatCard icon={FaStar} label="Avg. Rating" value={stats.avgRating.toFixed(1)} color="#dc2626" />
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
