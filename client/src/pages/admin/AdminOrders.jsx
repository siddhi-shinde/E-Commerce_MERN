import { useEffect, useState } from 'react';
import { Table, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { formatCurrency, formatDate, statusLabel } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';

const STATUS_OPTIONS = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    try {
      const { data } = await axiosInstance.get('/orders/getAllOrders');
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id, orderStatus) => {
    setUpdatingId(id);
    try {
      await axiosInstance.put(`/orders/updateOrderStatus/${id}`, { orderStatus });
      toast.success('Order status updated');
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader label="Loading orders..." minHeight="40vh" />;

  return (
    <div>
      <h4 className="mb-4">All Orders ({orders.length})</h4>
      <div className="bg-white border rounded-4 p-3">
        <Table hover responsive className="align-middle mb-0">
          <thead>
            <tr className="text-muted small text-uppercase">
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="fw-semibold small">#{order._id.slice(-8).toUpperCase()}</td>
                <td className="small text-muted">{formatDate(order.createdAt)}</td>
                <td className="small">{order.products.length}</td>
                <td className="small fw-semibold">{formatCurrency(order.totalAmount)}</td>
                <td>
                  <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'secondary'}>{statusLabel(order.paymentStatus)}</Badge>
                </td>
                <td style={{ width: 190 }}>
                  <Form.Select
                    size="sm"
                    value={order.orderStatus}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </Form.Select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AdminOrders;
