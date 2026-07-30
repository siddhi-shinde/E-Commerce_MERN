import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', contactNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
toast.success("Account created successfully! Please login.");
navigate("/login");
    } catch (err) {
      const apiError = err.response?.data;
      setError(apiError?.errors?.[0]?.message || apiError?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="g-0 mk-auth-page">
      <Col lg={5} className="mk-auth-panel d-none d-lg-flex">
        <div className="mk-auth-panel-blob" style={{ width: 220, height: 220, bottom: -60, left: -40 }} />
        <div className="mk-brand mb-4" style={{ color: '#fff', fontSize: '1.6rem' }}>
          Multi<span style={{ color: 'var(--mk-accent)' }}>kart</span>
        </div>
        <h2 className="mb-3" style={{ color: '#fff' }}>
          Join a marketplace built for every role.
        </h2>
        <p className="mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Free to join. Upgrade to a vendor account any time.
        </p>

        {['Instant access to every listed brand', 'Track orders in real time', 'Rate and review what you buy'].map((item) => (
          <div className="mk-auth-feature" key={item}>
            <div className="mk-auth-feature-icon">
              <FaCheckCircle size={15} />
            </div>
            <div className="fw-semibold">{item}</div>
          </div>
        ))}
      </Col>

      <Col lg={7} className="mk-auth-form-side">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h3 className="mb-1">Create your account</h3>
          <p className="text-muted mb-4">New accounts are registered as customers. Vendor/Admin access is granted separately.</p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full name</Form.Label>
              <Form.Control name="name" required value={form.name} onChange={handleChange} placeholder="Rahul Sharma" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact number</Form.Label>
              <Form.Control
                name="contactNumber"
                required
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="9876543210"
                pattern="[0-9]{10}"
                title="Enter a valid 10 digit number"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </Form>

          <p className="text-center text-muted mt-4 mb-0 small">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </Col>
    </Row>
  );
};

export default Register;
