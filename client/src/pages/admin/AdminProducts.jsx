import { useEffect, useState } from 'react';
import { Table, Button, Badge, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';
import AppPagination from '../../components/common/Pagination';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/products/getAllProducts', { params: { page, limit: 10 } });
      setProducts(data.products);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFeaturedToggle = async (product) => {
    try {
      await axiosInstance.put(`/products/updateProduct/${product._id}`, { isFeatured: !product.isFeatured });
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update product');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/products/deleteProduct/${deleteTarget._id}`);
      toast.success('Product deleted');
      setDeleteTarget(null);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader label="Loading products..." minHeight="40vh" />;

  return (
    <div>
      <h4 className="mb-4">All Products</h4>
      <div className="bg-white border rounded-4 p-3">
        <Table hover responsive className="align-middle mb-0">
          <thead>
            <tr className="text-muted small text-uppercase">
              <th>Product</th>
              <th>Brand / Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img src={getImageUrl(product.mainImage)} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                    <span className="fw-semibold">{product.name}</span>
                  </div>
                </td>
                <td className="small text-muted">
                  {product.brand_id?.brandName} / {product.category_id?.categoryName}
                </td>
                <td className="small">{formatCurrency(product.finalPrice ?? product.price)}</td>
                <td>
                  <Badge bg={product.isAvailable ? 'success' : 'secondary'}>{product.quantity}</Badge>
                </td>
                <td>
                  <Form.Check type="switch" checked={product.isFeatured} onChange={() => handleFeaturedToggle(product)} />
                </td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(product)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <AppPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete product?"
        message={`This will permanently delete "${deleteTarget?.name}".`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default AdminProducts;
