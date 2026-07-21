import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = async () => {
    try {
      const { data } = await axiosInstance.get('/products/getMyProducts');
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

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

  if (loading) return <Loader label="Loading your products..." minHeight="40vh" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">My Products ({products.length})</h4>
        <Button as={Link} to="/vendor/products/new" variant="primary" className="d-flex align-items-center gap-2">
          <FaPlus size={12} /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState title="No products yet" message="Add your first product to start selling." />
      ) : (
        <div className="bg-white border rounded-4 p-3">
          <Table hover responsive className="align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
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
                  <td className="small">{formatCurrency(product.finalPrice ?? product.price)}</td>
                  <td className="small">{product.quantity}</td>
                  <td>
                    <Badge bg={product.isAvailable ? 'success' : 'secondary'}>{product.isAvailable ? 'Available' : 'Out of stock'}</Badge>
                  </td>
                  <td className="d-flex gap-2">
                    <Button as={Link} to={`/vendor/products/${product._id}/edit`} variant="outline-primary" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(product)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

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

export default VendorProducts;
