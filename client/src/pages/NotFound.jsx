import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const NotFound = () => (
  <Container className="py-5 text-center">
    <h1 className="display-4 mb-2" style={{ color: 'var(--mk-primary)' }}>404</h1>
    <p className="text-muted mb-4">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn btn-primary">Back to shop</Link>
  </Container>
);

export default NotFound;
