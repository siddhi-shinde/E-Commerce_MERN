import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { fetchCart } from '../store/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';
import { loadRazorpayScript } from '../utils/loadRazorpay';

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
  const [payingOnline, setPayingOnline] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cart.status !== 'loading' && cart.items && cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const placeCodOrder = async () => {
    const { data } = await axiosInstance.post('/orders/placeOrder', {
      shippingAddress: address,
      paymentMethod: 'cash_on_delivery',
    });
    return data.order;
  };

  const payWithRazorpay = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Could not load Razorpay checkout. Please check your connection and try again.');
    }

    let createData;
    try {
      const res = await axiosInstance.post('/payments/createOrder');
      createData = res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Could not initiate payment');
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: createData.key,
        amount: createData.amount,
        currency: createData.currency,
        order_id: createData.razorpayOrderId,
        name: 'Multikart',
        description: 'Order payment',
        prefill: {
          name: address.name,
          email: user?.email,
          contact: address.contactNumber,
        },
        theme: { color: '#4f46e5' },
        handler: async (response) => {
          try {
            const { data } = await axiosInstance.post('/payments/verifyPayment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: address,
            });
            resolve(data.order);
          } catch (err) {
            reject(new Error(err.response?.data?.message || 'Payment succeeded but order verification failed'));
          }
        },
        modal: {
          ondismiss: () => reject(new Error('CANCELLED')),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => reject(new Error('Payment failed. Please try again.')));
      rzp.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let order;
      if (paymentMethod === 'online') {
        setPayingOnline(true);
        order = await payWithRazorpay();
      } else {
        order = await placeCodOrder();
      }
      await dispatch(fetchCart());
      toast.success('Order placed successfully!');
      navigate(`/orders/${order._id}`, { state: { justPlaced: true } });
    } catch (err) {
      if (err.message !== 'CANCELLED') {
        toast.error(err.message || err.response?.data?.message || 'Could not place order');
      }
    } finally {
      setSubmitting(false);
      setPayingOnline(false);
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
                label="Pay Online (Card / UPI / Netbanking via Razorpay)"
                checked={paymentMethod === 'online'}
                onChange={() => setPaymentMethod('online')}
              />

              {paymentMethod === 'online' && (
                <p className="text-muted small mt-3 mb-0 ps-4">
                  You'll be redirected to Razorpay's secure checkout to complete payment — card, UPI, netbanking and
                  wallet details are handled entirely by Razorpay and never touch our servers.
                </p>
              )}
            </Card>

            <Button type="submit" variant="primary" size="lg" className="w-100" disabled={submitting}>
              {submitting
                ? payingOnline
                  ? 'Waiting for payment...'
                  : 'Placing order...'
                : paymentMethod === 'online'
                ? `Pay ${formatCurrency(cart.finalCartAmount)}`
                : `Place order — ${formatCurrency(cart.finalCartAmount)}`}
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
