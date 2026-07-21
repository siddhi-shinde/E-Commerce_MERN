import { useEffect, useState } from 'react';
import { Table, Badge } from 'react-bootstrap';
import axiosInstance from '../../api/axiosInstance';
import { formatCurrency, formatDate, statusLabel } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';

const VendorOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await axiosInstance.get('/orders/getVendorOrders');
        setOrders(data.orders);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  if (loading) return <Loader label="Loading orders..." minHeight="40vh" />;

  return (
    <div>
      <h4 className="mb-4">Orders Containing My Products ({orders.length})</h4>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" message="Orders containing your products will appear here." />
      ) : (
        <div className="bg-white border rounded-4 p-3">
          <Table hover responsive className="align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Order ID</th>
                <th>Date</th>
                <th>My Items</th>
                <th>My Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const myItems = order.products.filter((p) => p.vendor_id === user._id);
                const myRevenue = myItems.reduce((sum, i) => sum + i.finalPrice * i.quantity, 0);
                return (
                  <tr key={order._id}>
                    <td className="fw-semibold small">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="small text-muted">{formatDate(order.createdAt)}</td>
                    <td className="small">
                      {myItems.map((i) => `${i.productName} x${i.quantity}`).join(', ')}
                    </td>
                    <td className="small fw-semibold">{formatCurrency(myRevenue)}</td>
                    <td>
                      <Badge className={`mk-status-${order.orderStatus}`} pill>
                        {statusLabel(order.orderStatus)}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
