import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const Unauthorized = () => (
  <Container className="py-5 text-center">
    <h1 className="display-4 mb-2" style={{ color: 'var(--mk-danger)' }}>403</h1>
    <p className="text-muted mb-4">You don't have permission to view this page.</p>
    <Link to="/" className="btn btn-primary">Back to shop</Link>
  </Container>
);

export default Unauthorized;
