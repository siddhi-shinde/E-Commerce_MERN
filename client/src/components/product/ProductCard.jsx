import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FaShoppingCart } from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/formatCurrency';
import StarRating from '../common/StarRating';
import { useAuth } from '../../context/AuthContext';
import { addToCart } from '../../store/cartSlice';

const ProductCard = ({ product }) => {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();

  const hasDiscount = product.discount > 0;
  const finalPrice = product.finalPrice ?? product.price;
  const canAddToCart = !isAuthenticated || user?.role === 'customer';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || user?.role !== 'customer') {
      toast.info('Please log in as a customer to add items to your cart');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  return (
    <Link to={`/products/${product._id}`} className="text-decoration-none">
      <div className="mk-product-card position-relative">
        {hasDiscount && (
          <span className="badge mk-discount-badge position-absolute m-2" style={{ zIndex: 1 }}>
            {product.discount}% OFF
          </span>
        )}
        <div className="mk-product-thumb-wrap">
          <img src={getImageUrl(product.mainImage)} alt={product.name} className="mk-product-thumb" />
        </div>
        <div className="p-3">
          <div className="text-uppercase small text-muted mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
            {product.brand_id?.brandName || 'Brand'}
          </div>
          <div className="fw-semibold text-truncate mb-1" style={{ color: 'var(--mk-ink)' }}>
            {product.name}
          </div>
          <StarRating rating={product.averageRating || 0} size={12} count={product.totalReviews} />
          <div className="d-flex align-items-baseline gap-2 mt-2">
            <span className="mk-price-final">{formatCurrency(finalPrice)}</span>
            {hasDiscount && <span className="mk-price-strike">{formatCurrency(product.price)}</span>}
          </div>
          {canAddToCart && (
            <button
              className="btn btn-sm btn-primary w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
            >
              <FaShoppingCart size={13} />
              {product.isAvailable ? 'Add to cart' : 'Out of stock'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
