import { useEffect, useState } from 'react';
import { Table, Form, Badge, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = async () => {
    try {
      const { data } = await axiosInstance.get('/users/getAllUsers');
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await axiosInstance.put(`/users/updateRole/${id}`, { role });
      toast.success('Role updated');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update role');
    }
  };

  const handleStatusToggle = async (id, isActive) => {
    try {
      await axiosInstance.put(`/users/updateStatus/${id}`, { isActive: !isActive });
      toast.success('Status updated');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/users/deleteUser/${deleteTarget._id}`);
      toast.success('User deleted');
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader label="Loading users..." minHeight="40vh" />;

  return (
    <div>
      <h4 className="mb-4">Manage Users ({users.length})</h4>
      <div className="bg-white border rounded-4 p-3">
        <Table hover responsive className="align-middle mb-0">
          <thead>
            <tr className="text-muted small text-uppercase">
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="fw-semibold">{u.name}</td>
                <td className="text-muted small">{u.email}</td>
                <td style={{ width: 140 }}>
                  <Form.Select
                    size="sm"
                    value={u.role}
                    disabled={u._id === currentUser._id}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </td>
                <td>
                  <Badge bg={u.isActive ? 'success' : 'secondary'} style={{ cursor: u._id === currentUser._id ? 'default' : 'pointer' }} onClick={() => u._id !== currentUser._id && handleStatusToggle(u._id, u.isActive)}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <Button variant="outline-danger" size="sm" disabled={u._id === currentUser._id} onClick={() => setDeleteTarget(u)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete user?"
        message={`This will permanently delete "${deleteTarget?.name}". This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default AdminUsers;
