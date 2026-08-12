import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaBoxOpen, FaShieldAlt, FaStore } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/auth/resetPassword', { token, newPassword: form.newPassword });
      toast.success('Password reset successful. Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password. The link may have expired.');
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
          <h3 className="mb-1">Reset password</h3>
          <p className="text-muted mb-4">Choose a new password for your account.</p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>New password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                required
                minLength={6}
                value={form.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Confirm new password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password'}
            </Button>
          </Form>

          <p className="text-center text-muted mt-4 mb-0 small">
            Remembered your password? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </Col>
    </Row>
  );
};

export default ResetPassword;
