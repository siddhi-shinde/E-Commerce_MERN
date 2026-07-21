import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaMinus, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';
import { getImageUrl } from '../utils/imageUrl';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import StarRating from '../components/common/StarRating';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { addToCart } from '../store/cartSlice';

const ProductDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProduct = async () => {
    try {
      const { data } = await axiosInstance.get(`/products/getProductById/${id}`);
      setProduct(data.product);
      setActiveImage(0);
    } catch (err) {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loader label="Loading product..." minHeight="60vh" />;
  if (!product) {
    return (
      <Container className="py-5">
        <EmptyState title="Product not found" message="It may have been removed by the seller." action={<Link to="/" className="btn btn-primary">Back to shop</Link>} />
      </Container>
    );
  }

  const gallery = [product.mainImage, ...(product.productImages || [])];
  const myReview = product.reviews?.find((r) => r.user_id?._id === user?._id || r.user_id === user?._id);

  const handleAddToCart = () => {
    if (!isAuthenticated || user?.role !== 'customer') {
      toast.info('Please log in as a customer to add items to your cart');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      if (editingReviewId) {
        await axiosInstance.put(`/reviews/updateReview/${product._id}/${editingReviewId}`, reviewForm);
        toast.success('Review updated');
      } else {
        await axiosInstance.post(`/reviews/addReview/${product._id}`, reviewForm);
        toast.success('Review added');
      }
      setReviewForm({ rating: 5, comment: '' });
      setEditingReviewId(null);
      await loadProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({ rating: review.rating, comment: review.comment });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axiosInstance.delete(`/reviews/deleteReview/${product._id}/${reviewId}`);
      toast.success('Review deleted');
      await loadProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete review');
    }
  };

  return (
    <Container className="py-4">
      <Row className="g-4">
        {/* Gallery */}
        <Col md={5}>
          <img
            src={getImageUrl(gallery[activeImage])}
            alt={product.name}
            className="w-100 rounded-4 border mb-2"
            style={{ aspectRatio: '1/1', objectFit: 'cover' }}
          />
          {gallery.length > 1 && (
            <div className="d-flex gap-2">
              {gallery.map((img, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(img)}
                  alt=""
                  onClick={() => setActiveImage(idx)}
                  className="rounded-3 border"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: 'cover',
                    cursor: 'pointer',
                    outline: idx === activeImage ? '2px solid var(--mk-primary)' : 'none',
                  }}
                />
              ))}
            </div>
          )}
        </Col>

        {/* Details */}
        <Col md={7}>
          <div className="text-uppercase small text-muted fw-semibold mb-1">{product.brand_id?.brandName}</div>
          <h2 className="mb-2">{product.name}</h2>
          <StarRating rating={product.averageRating || 0} count={product.totalReviews} size={16} />

          <div className="d-flex align-items-baseline gap-3 my-3">
            <span className="mk-price-final" style={{ fontSize: '1.7rem' }}>
              {formatCurrency(product.finalPrice)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="mk-price-strike" style={{ fontSize: '1.1rem' }}>
                  {formatCurrency(product.price)}
                </span>
                <Badge className="mk-discount-badge">{product.discount}% OFF</Badge>
              </>
            )}
          </div>

          <p className="text-muted">{product.description}</p>

          <div className="d-flex gap-3 small text-muted mb-3">
            <span>Category: <strong>{product.category_id?.categoryName}</strong></span>
            <span>{product.isAvailable ? `In stock (${product.quantity} available)` : 'Out of stock'}</span>
          </div>

          {(!isAuthenticated || user?.role === 'customer') && (
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center border rounded-3">
                <Button variant="light" size="sm" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <FaMinus size={11} />
                </Button>
                <span className="px-3 fw-semibold">{quantity}</span>
                <Button variant="light" size="sm" onClick={() => setQuantity((q) => Math.min(product.quantity || 1, q + 1))}>
                  <FaPlus size={11} />
                </Button>
              </div>
              <Button variant="primary" disabled={!product.isAvailable} onClick={handleAddToCart} className="d-flex align-items-center gap-2">
                <FaShoppingCart /> Add to cart
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Reviews */}
      <Row className="mt-5">
        <Col lg={8}>
          <h5 className="mb-3">Customer reviews ({product.reviews?.length || 0})</h5>
          {(!product.reviews || product.reviews.length === 0) && (
            <p className="text-muted">No reviews yet. Be the first to review this product.</p>
          )}
          <div className="d-flex flex-column gap-3">
            {product.reviews?.map((review) => (
              <div key={review._id} className="border-bottom pb-3">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="fw-semibold">{review.user_id?.name || 'Customer'}</div>
                    <StarRating rating={review.rating} showValue={false} size={13} />
                  </div>
                  <div className="d-flex align-items-start gap-2">
                    <span className="text-muted small">{formatDate(review.createdAt)}</span>
                    {(review.user_id?._id === user?._id || user?.role === 'admin') && (
                      <div className="d-flex gap-2">
                        {review.user_id?._id === user?._id && (
                          <FaEdit size={13} role="button" style={{ cursor: 'pointer' }} onClick={() => startEditReview(review)} />
                        )}
                        <FaTrash size={13} role="button" style={{ cursor: 'pointer', color: 'var(--mk-danger)' }} onClick={() => handleDeleteReview(review._id)} />
                      </div>
                    )}
                  </div>
                </div>
                <p className="mb-0 mt-1">{review.comment}</p>
              </div>
            ))}
          </div>

          {isAuthenticated && user?.role === 'customer' && (!myReview || editingReviewId) && (
            <Form onSubmit={handleReviewSubmit} className="mt-4 p-3 border rounded-4 bg-white">
              <h6 className="mb-3">{editingReviewId ? 'Edit your review' : 'Write a review'}</h6>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Rating</Form.Label>
                <Form.Select
                  style={{ width: 160 }}
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} star{r > 1 ? 's' : ''}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience with this product..."
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : editingReviewId ? 'Update review' : 'Submit review'}
                </Button>
                {editingReviewId && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setEditingReviewId(null);
                      setReviewForm({ rating: 5, comment: '' });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails;
