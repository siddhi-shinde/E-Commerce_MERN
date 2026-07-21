import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaMinus, FaPlus, FaTrash, FaShoppingBag } from 'react-icons/fa';
import { increaseQuantity, decreaseQuantity, removeFromCart, clearCart } from '../store/cartSlice';
import { getImageUrl } from '../utils/imageUrl';
import { formatCurrency } from '../utils/formatCurrency';
import EmptyState from '../components/common/EmptyState';

const Cart = () => {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const loading = cart.status === 'loading';
  const navigate = useNavigate();

  if (!loading && cart.items.length === 0) {
    return (
      <Container className="py-5">
        <EmptyState
          icon={FaShoppingBag}
          title="Your cart is empty"
          message="Looks like you haven't added anything yet."
          action={<Link to="/" className="btn btn-primary">Start shopping</Link>}
        />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Your Cart ({cart.totalQuantity} items)</h4>
        {cart.items.length > 0 && (
          <Button variant="outline-danger" size="sm" onClick={() => dispatch(clearCart())}>
            Clear cart
          </Button>
        )}
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <div className="d-flex flex-column gap-3">
            {cart.items.map((item) => (
              <div key={item.product_id} className="d-flex align-items-center gap-3 bg-white border rounded-4 p-3">
                <img
                  src={getImageUrl(item.mainImage)}
                  alt={item.name}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '0.6rem' }}
                />
                <div className="flex-grow-1">
                  <Link to={`/products/${item.product_id}`} className="fw-semibold text-decoration-none" style={{ color: 'var(--mk-ink)' }}>
                    {item.name}
                  </Link>
                  <div className="text-muted small">{formatCurrency(item.finalPrice)} each</div>
                </div>
                <div className="d-flex align-items-center border rounded-3">
                  <Button variant="light" size="sm" onClick={() => dispatch(decreaseQuantity(item.product_id))}>
                    <FaMinus size={10} />
                  </Button>
                  <span className="px-3 fw-semibold">{item.quantity}</span>
                  <Button variant="light" size="sm" onClick={() => dispatch(increaseQuantity(item.product_id))}>
                    <FaPlus size={10} />
                  </Button>
                </div>
                <div className="fw-semibold" style={{ minWidth: 90, textAlign: 'right' }}>
                  {formatCurrency(item.lineTotal)}
                </div>
                <Button variant="link" className="text-danger p-0" onClick={() => dispatch(removeFromCart(item.product_id))}>
                  <FaTrash />
                </Button>
              </div>
            ))}
          </div>
        </Col>

        <Col lg={4}>
          <div className="bg-white border rounded-4 p-4 position-sticky" style={{ top: '90px' }}>
            <h6 className="mb-3">Order Summary</h6>
            <div className="d-flex justify-content-between small mb-2">
              <span className="text-muted">Item total</span>
              <span>{formatCurrency(cart.itemTotal)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-2">
              <span className="text-muted">Discount</span>
              <span className="text-success">- {formatCurrency(cart.itemDiscount)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-semibold mb-3">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.finalCartAmount)}</span>
            </div>
            <p className="text-muted small mb-3">Delivery charges are calculated at checkout.</p>
            <Button variant="primary" className="w-100" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
