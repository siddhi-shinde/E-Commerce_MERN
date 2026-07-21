import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaBoxOpen, FaShieldAlt, FaStore } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const roleHome = { admin: '/admin', vendor: '/vendor', customer: '/' };

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const redirectTo = location.state?.from?.pathname;
      navigate(redirectTo || roleHome[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
          <h3 className="mb-1">Welcome back</h3>
          <p className="text-muted mb-4">Log in to continue to Multikart.</p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </Form>

          <p className="text-center text-muted mt-4 mb-0 small">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
