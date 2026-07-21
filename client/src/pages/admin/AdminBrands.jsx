import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { getImageUrl } from '../../utils/imageUrl';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';

const emptyForm = { brandName: '', brandImage: null };

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadBrands = async () => {
    try {
      const { data } = await axiosInstance.get('/brands/getAllBrands');
      setBrands(data.brands);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (brand) => {
    setEditing(brand);
    setForm({ brandName: brand.brandName, brandImage: null });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('brandName', form.brandName);
      if (form.brandImage) formData.append('brandImage', form.brandImage);

      if (editing) {
        await axiosInstance.put(`/brands/updateBrand/${editing._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Brand updated');
      } else {
        await axiosInstance.post('/brands/createBrand', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Brand created');
      }
      setShowModal(false);
      loadBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save brand');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (brand) => {
    try {
      await axiosInstance.put(`/brands/updateBrandStatus/${brand._id}`, { isActive: !brand.isActive });
      loadBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/brands/deleteBrand/${deleteTarget._id}`);
      toast.success('Brand deleted');
      setDeleteTarget(null);
      loadBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete brand');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader label="Loading brands..." minHeight="40vh" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Manage Brands ({brands.length})</h4>
        <Button variant="primary" onClick={openCreate} className="d-flex align-items-center gap-2">
          <FaPlus size={12} /> Add Brand
        </Button>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <Table hover responsive className="align-middle mb-0">
          <thead>
            <tr className="text-muted small text-uppercase">
              <th>Image</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand._id}>
                <td>
                  <img src={getImageUrl(brand.brandImage)} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                </td>
                <td className="fw-semibold">{brand.brandName}</td>
                <td>
                  <Badge bg={brand.isActive ? 'success' : 'secondary'} style={{ cursor: 'pointer' }} onClick={() => handleStatusToggle(brand)}>
                    {brand.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => openEdit(brand)}>
                    Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(brand)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">{editing ? 'Edit Brand' : 'Add Brand'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Brand name</Form.Label>
              <Form.Control required value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label className="small fw-semibold">Brand image {editing && '(leave blank to keep current)'}</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={(e) => setForm({ ...form, brandImage: e.target.files[0] })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete brand?"
        message={`This will permanently delete "${deleteTarget?.brandName}".`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default AdminBrands;
