import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';

const emptyForm = {
  name: '',
  description: '',
  category_id: '',
  brand_id: '',
  price: '',
  discount: '0',
  quantity: '0',
};

const VendorProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axiosInstance.get('/categories/getActiveCategories').then((res) => setCategories(res.data.categories)).catch(() => {});
    axiosInstance.get('/brands/getActiveBrands').then((res) => setBrands(res.data.brands)).catch(() => {});

    if (isEdit) {
      axiosInstance
        .get(`/products/getProductById/${id}`)
        .then(({ data }) => {
          const p = data.product;
          setForm({
            name: p.name,
            description: p.description,
            category_id: p.category_id?._id || '',
            brand_id: p.brand_id?._id || '',
            price: p.price,
            discount: p.discount,
            quantity: p.quantity,
          });
        })
        .catch(() => toast.error('Could not load product'))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !mainImage) {
      toast.error('Please select a main image');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (mainImage) formData.append('mainImage', mainImage);
      productImages.forEach((file) => formData.append('productImages', file));

      if (isEdit) {
        await axiosInstance.put(`/products/updateProduct/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated');
      } else {
        await axiosInstance.post('/products/createProduct', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created');
      }
      navigate('/vendor/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading product..." minHeight="40vh" />;

  return (
    <div>
      <h4 className="mb-4">{isEdit ? 'Edit Product' : 'Add Product'}</h4>
      <Form onSubmit={handleSubmit} className="bg-white border rounded-4 p-4" style={{ maxWidth: 720 }}>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Product name</Form.Label>
          <Form.Control name="name" required value={form.name} onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Description</Form.Label>
          <Form.Control as="textarea" rows={3} name="description" required value={form.description} onChange={handleChange} />
        </Form.Group>

        <Row className="g-3 mb-3">
          <Col md={6}>
            <Form.Label className="small fw-semibold">Category</Form.Label>
            <Form.Select name="category_id" required value={form.category_id} onChange={handleChange}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.categoryName}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label className="small fw-semibold">Brand</Form.Label>
            <Form.Select name="brand_id" required value={form.brand_id} onChange={handleChange}>
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.brandName}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="g-3 mb-3">
          <Col md={4}>
            <Form.Label className="small fw-semibold">Price (Rs.)</Form.Label>
            <Form.Control type="number" name="price" min="0.01" step="0.01" required value={form.price} onChange={handleChange} />
          </Col>
          <Col md={4}>
            <Form.Label className="small fw-semibold">Discount (%)</Form.Label>
            <Form.Control type="number" name="discount" min="0" max="100" value={form.discount} onChange={handleChange} />
          </Col>
          <Col md={4}>
            <Form.Label className="small fw-semibold">Quantity in stock</Form.Label>
            <Form.Control type="number" name="quantity" min="0" required value={form.quantity} onChange={handleChange} />
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Main image {isEdit && '(leave blank to keep current)'}</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files[0])} />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="small fw-semibold">Additional images (optional, up to 8)</Form.Label>
          <Form.Control type="file" accept="image/*" multiple onChange={(e) => setProductImages(Array.from(e.target.files))} />
        </Form.Group>

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update product' : 'Create product'}
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/vendor/products')}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default VendorProductForm;
