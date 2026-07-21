import { Modal, Button } from 'react-bootstrap';

const ConfirmModal = ({ show, title = 'Are you sure?', message, confirmLabel = 'Delete', variant = 'danger', onConfirm, onCancel, loading }) => (
  <Modal show={show} onHide={onCancel} centered>
    <Modal.Header closeButton>
      <Modal.Title as="h5">{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{message}</Modal.Body>
    <Modal.Footer>
      <Button variant="outline-secondary" onClick={onCancel} disabled={loading}>
        Cancel
      </Button>
      <Button variant={variant} onClick={onConfirm} disabled={loading}>
        {loading ? 'Please wait...' : confirmLabel}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmModal;
