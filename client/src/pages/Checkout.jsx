import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { fetchCart } from '../store/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';

const Checkout = () => {
  const { user } = useAuth();
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState({
    name: user?.name || '',
    contactNumber: user?.contactNumber || '',
    houseNumber: user?.houseNumber || '',
    area: user?.area || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || 'India',
    pincode: user?.pincode || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  useEffect(() => {
    dispatch(fetchCart());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cart.status !== 'loading' && cart.items && cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post('/orders/placeOrder', {
        shippingAddress: address,
        paymentMethod,
      });
      await dispatch(fetchCart());
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`, { state: { justPlaced: true } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <h4 className="mb-4">Checkout</h4>
      <Row className="g-4">
        <Col lg={7}>
          <Form onSubmit={handleSubmit}>
            <Card className="p-4 mb-3 border rounded-4">
              <h6 className="mb-3">Shipping Address</h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="small fw-semibold">Full name</Form.Label>
                  <Form.Control name="name" required value={address.name} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold">Contact number</Form.Label>
                  <Form.Control name="contactNumber" required pattern="[0-9]{10}" value={address.contactNumber} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold">House / Flat No.</Form.Label>
                  <Form.Control name="houseNumber" required value={address.houseNumber} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold">Area</Form.Label>
                  <Form.Control name="area" required value={address.area} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold">City</Form.Label>
                  <Form.Control name="city" required value={address.city} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold">State</Form.Label>
                  <Form.Control name="state" required value={address.state} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold">Country</Form.Label>
                  <Form.Control name="country" required value={address.country} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold">Pincode</Form.Label>
                  <Form.Control name="pincode" required value={address.pincode} onChange={handleChange} />
                </Col>
              </Row>
            </Card>

            <Card className="p-4 mb-3 border rounded-4">
              <h6 className="mb-3">Payment Method</h6>
              <Form.Check
                type="radio"
                id="cod"
                name="paymentMethod"
                label="Cash on Delivery"
                checked={paymentMethod === 'cash_on_delivery'}
                onChange={() => setPaymentMethod('cash_on_delivery')}
                className="mb-2"
              />
              <Form.Check
                type="radio"
                id="online"
                name="paymentMethod"
                label="Pay Online"
                checked={paymentMethod === 'online'}
                onChange={() => setPaymentMethod('online')}
              />
            </Card>

            <Button type="submit" variant="primary" size="lg" className="w-100" disabled={submitting}>
              {submitting ? 'Placing order...' : `Place order — ${formatCurrency(cart.finalCartAmount)}`}
            </Button>
          </Form>
        </Col>

        <Col lg={5}>
          <Card className="p-4 border rounded-4">
            <h6 className="mb-3">Order Summary</h6>
            {cart.items?.map((item) => (
              <div key={item.product_id} className="d-flex justify-content-between small mb-2">
                <span className="text-muted">
                  {item.name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.lineTotal)}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between small mb-2">
              <span className="text-muted">Subtotal</span>
              <span>{formatCurrency(cart.itemTotal)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-2">
              <span className="text-muted">Discount</span>
              <span className="text-success">- {formatCurrency(cart.itemDiscount)}</span>
            </div>
            <div className="d-flex justify-content-between fw-semibold mt-2">
              <span>Estimated total</span>
              <span>{formatCurrency(cart.finalCartAmount)}</span>
            </div>
            <p className="text-muted small mt-2 mb-0">Final total (including delivery) is confirmed after placing the order.</p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
