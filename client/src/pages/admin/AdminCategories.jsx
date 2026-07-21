import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { getImageUrl } from '../../utils/imageUrl';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';

const emptyForm = { categoryName: '', categoryImage: null };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/categories/getAllCategories');
      setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({ categoryName: category.categoryName, categoryImage: null });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('categoryName', form.categoryName);
      if (form.categoryImage) formData.append('categoryImage', form.categoryImage);

      if (editing) {
        await axiosInstance.put(`/categories/updateCategory/${editing._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category updated');
      } else {
        await axiosInstance.post('/categories/createCategory', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category created');
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save category');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (category) => {
    try {
      await axiosInstance.put(`/categories/updateCategoryStatus/${category._id}`, { isActive: !category.isActive });
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/categories/deleteCategory/${deleteTarget._id}`);
      toast.success('Category deleted');
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete category');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader label="Loading categories..." minHeight="40vh" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Manage Categories ({categories.length})</h4>
        <Button variant="primary" onClick={openCreate} className="d-flex align-items-center gap-2">
          <FaPlus size={12} /> Add Category
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
            {categories.map((category) => (
              <tr key={category._id}>
                <td>
                  <img src={getImageUrl(category.categoryImage)} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                </td>
                <td className="fw-semibold">{category.categoryName}</td>
                <td>
                  <Badge bg={category.isActive ? 'success' : 'secondary'} style={{ cursor: 'pointer' }} onClick={() => handleStatusToggle(category)}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => openEdit(category)}>
                    Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(category)}>
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
            <Modal.Title as="h5">{editing ? 'Edit Category' : 'Add Category'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Category name</Form.Label>
              <Form.Control required value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label className="small fw-semibold">Category image {editing && '(leave blank to keep current)'}</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={(e) => setForm({ ...form, categoryImage: e.target.files[0] })} />
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
        title="Delete category?"
        message={`This will permanently delete "${deleteTarget?.categoryName}".`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default AdminCategories;
