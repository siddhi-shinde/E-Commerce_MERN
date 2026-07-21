import { Spinner } from 'react-bootstrap';

const Loader = ({ label = 'Loading...', minHeight = '40vh' }) => (
  <div className="d-flex flex-column align-items-center justify-content-center gap-2" style={{ minHeight }}>
    <Spinner animation="border" style={{ color: 'var(--mk-primary)' }} />
    <span className="text-muted small">{label}</span>
  </div>
);

export default Loader;
