import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Badge, Button } from 'react-bootstrap';
import { FaBoxOpen } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';
import { formatCurrency, formatDate, statusLabel } from '../utils/formatCurrency';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const { data } = await axiosInstance.get('/orders/getMyOrders');
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) return <Loader label="Loading your orders..." minHeight="50vh" />;

  return (
    <Container className="py-4">
      <h4 className="mb-4">My Orders</h4>

      {orders.length === 0 ? (
        <EmptyState
          icon={FaBoxOpen}
          title="No orders yet"
          message="Your placed orders will show up here."
          action={<Link to="/" className="btn btn-primary">Start shopping</Link>}
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border rounded-4 p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <div className="fw-semibold">Order #{order._id.slice(-8).toUpperCase()}</div>
                <div className="text-muted small">
                  {formatDate(order.createdAt)} &middot; {order.products.length} item(s)
                </div>
              </div>
              <div>
                <Badge className={`mk-status-${order.orderStatus}`} pill>
                  {statusLabel(order.orderStatus)}
                </Badge>
              </div>
              <div className="fw-semibold">{formatCurrency(order.totalAmount)}</div>
              <Button as={Link} to={`/orders/${order._id}`} variant="outline-primary" size="sm">
                View details
              </Button>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default MyOrders;
