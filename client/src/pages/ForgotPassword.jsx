import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaBoxOpen, FaShieldAlt, FaStore } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/auth/forgotPassword', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="g-0 mk-auth-page">
      <Col lg={5} className="mk-auth-panel d-none d-lg-flex">
        <div className="mk-auth-panel-blob" style={{ width: 220, height: 220, top: -60, right: -40 }} />
        <div className="mk-brand mb-4" style={{ color: '#fff', fontSize: '1.6rem' }}>
          Multi<span style={{ color: 'var(--mk-accent)' }}>kart</span>
        </div>
        <h2 className="mb-3" style={{ color: '#fff' }}>
          Everything you need, from every seller.
        </h2>
        <p className="mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
          One account, three ways to shop it.
        </p>

        <div className="mk-auth-feature">
          <div className="mk-auth-feature-icon">
            <FaBoxOpen size={15} />
          </div>
          <div>
            <div className="fw-semibold">Browse with confidence</div>
            <div className="small" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Real-time stock, verified reviews, order tracking.
            </div>
          </div>
        </div>
        <div className="mk-auth-feature">
          <div className="mk-auth-feature-icon">
            <FaStore size={15} />
          </div>
          <div>
            <div className="fw-semibold">Sell as a vendor</div>
            <div className="small" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Manage your own catalog and fulfil orders.
            </div>
          </div>
        </div>
        <div className="mk-auth-feature">
          <div className="mk-auth-feature-icon">
            <FaShieldAlt size={15} />
          </div>
          <div>
            <div className="fw-semibold">Secure by design</div>
            <div className="small" style={{ color: 'rgba(255,255,255,0.75)' }}>
              JWT auth with role-based access, end to end.
            </div>
          </div>
        </div>
      </Col>

      <Col lg={7} className="mk-auth-form-side">
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h3 className="mb-1">Forgot password?</h3>
          <p className="text-muted mb-4">Enter your email and we&apos;ll send you a reset link.</p>

          {error && <Alert variant="danger">{error}</Alert>}

          {sent ? (
            <Alert variant="success">
              If that email is registered, a password reset link has been sent. It will expire in 30 minutes.
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </Form>
          )}

          <p className="text-center text-muted mt-4 mb-0 small">
            Remembered your password? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </Col>
    </Row>
  );
};

export default ForgotPassword;
