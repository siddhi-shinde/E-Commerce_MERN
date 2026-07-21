import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import { getImageUrl } from '../utils/imageUrl';
import { formatCurrency, formatDate, statusLabel } from '../utils/formatCurrency';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';

const ORDER_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const OrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = async () => {
    try {
      const { data } = await axiosInstance.get(`/orders/getOrderById/${id}`);
      setOrder(data.order);
    } catch (err) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await axiosInstance.put(`/orders/cancelOrder/${id}`);
      toast.success('Order cancelled');
      setShowCancel(false);
      await loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader label="Loading order..." minHeight="50vh" />;
  if (!order) {
    return (
      <Container className="py-5 text-center">
        <p className="text-muted">Order not found.</p>
        <Link to="/orders" className="btn btn-primary">Back to orders</Link>
      </Container>
    );
  }

  const canCancel = !['delivered', 'cancelled'].includes(order.orderStatus);
  const stepIndex = ORDER_STEPS.indexOf(order.orderStatus);

  return (
    <Container className="py-4">
      {location.state?.justPlaced && (
        <Alert variant="success">Your order has been placed successfully! A confirmation email is on its way.</Alert>
      )}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h4 className="mb-1">Order #{order._id.slice(-8).toUpperCase()}</h4>
          <span className="text-muted small">Placed on {formatDate(order.createdAt)}</span>
        </div>
        <Badge className={`mk-status-${order.orderStatus}`} pill style={{ fontSize: '0.85rem' }}>
          {statusLabel(order.orderStatus)}
        </Badge>
      </div>

      {order.orderStatus !== 'cancelled' && (
        <div className="d-flex justify-content-between mb-4 bg-white border rounded-4 p-3 overflow-auto">
          {ORDER_STEPS.map((step, idx) => (
            <div key={step} className="text-center flex-fill">
              <div
                className="mx-auto mb-1 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 28,
                  height: 28,
                  background: idx <= stepIndex ? 'var(--mk-primary)' : '#e2e8f0',
                  color: idx <= stepIndex ? '#fff' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {idx + 1}
              </div>
              <div className="small" style={{ whiteSpace: 'nowrap', color: idx <= stepIndex ? 'var(--mk-ink)' : '#94a3b8' }}>
                {statusLabel(step)}
              </div>
            </div>
          ))}
        </div>
      )}

      <Row className="g-4">
        <Col lg={7}>
          <div className="bg-white border rounded-4 p-3 mb-3">
            <h6 className="mb-3">Items</h6>
            {order.products.map((item, idx) => (
              <div key={idx} className="d-flex align-items-center gap-3 py-2 border-bottom">
                <img src={getImageUrl(item.productImage)} alt={item.productName} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '0.5rem' }} />
                <div className="flex-grow-1">
                  <div className="fw-semibold small">{item.productName}</div>
                  <div className="text-muted small">Qty: {item.quantity} &middot; {formatCurrency(item.finalPrice)} each</div>
                </div>
                <div className="fw-semibold small">{formatCurrency(item.finalPrice * item.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border rounded-4 p-3">
            <h6 className="mb-2">Shipping Address</h6>
            <p className="mb-0 text-muted small">
              {order.shippingAddress.name} &middot; {order.shippingAddress.contactNumber}
              <br />
              {order.shippingAddress.houseNumber}, {order.shippingAddress.area}, {order.shippingAddress.city}
              <br />
              {order.shippingAddress.state}, {order.shippingAddress.country} - {order.shippingAddress.pincode}
            </p>
          </div>
        </Col>

        <Col lg={5}>
          <div className="bg-white border rounded-4 p-3">
            <h6 className="mb-3">Payment Summary</h6>
            <div className="d-flex justify-content-between small mb-2">
              <span className="text-muted">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-2">
              <span className="text-muted">Discount</span>
              <span className="text-success">- {formatCurrency(order.discountAmount)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-2">
              <span className="text-muted">Delivery</span>
              <span>{order.deliveryCharge > 0 ? formatCurrency(order.deliveryCharge) : 'Free'}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-semibold mb-3">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="small text-muted mb-3">
              Payment: {statusLabel(order.paymentMethod)} &middot; {statusLabel(order.paymentStatus)}
            </div>
            {canCancel && (
              <Button variant="outline-danger" className="w-100" onClick={() => setShowCancel(true)}>
                Cancel order
              </Button>
            )}
          </div>
        </Col>
      </Row>

      <ConfirmModal
        show={showCancel}
        title="Cancel this order?"
        message="This action cannot be undone. Stock will be restored."
        confirmLabel="Yes, cancel order"
        onConfirm={handleCancel}
        onCancel={() => setShowCancel(false)}
        loading={cancelling}
      />
    </Container>
  );
};

export default OrderDetails;
