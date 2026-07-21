import { useState } from 'react';
import { Container, Row, Col, Form, Button, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaUserCircle, FaCamera } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const Profile = () => {
  const { user, updateStoredUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    contactNumber: user?.contactNumber || '',
    houseNumber: user?.houseNumber || '',
    area: user?.area || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || '',
    pincode: user?.pincode || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await axiosInstance.put('/users/updateProfile', profileForm);
      updateStoredUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await axiosInstance.put('/auth/changePassword', passwordForm);
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      const { data } = await axiosInstance.put('/users/uploadProfileImage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateStoredUser(data.user);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: 720 }}>
      <h4 className="mb-4">My Profile</h4>

      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="position-relative">
          {user?.profileImage ? (
            <img src={getImageUrl(user.profileImage)} alt={user.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <FaUserCircle size={72} style={{ color: 'var(--mk-border)' }} />
          )}
          <label
            htmlFor="profileImageInput"
            className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 26, height: 26, cursor: 'pointer' }}
          >
            <FaCamera size={12} />
          </label>
          <Form.Control id="profileImageInput" type="file" accept="image/*" className="d-none" onChange={handleImageChange} disabled={uploadingImage} />
        </div>
        <div>
          <div className="fw-semibold">{user?.name}</div>
          <div className="text-muted small">{user?.email}</div>
          <span className="badge bg-secondary text-capitalize mt-1">{user?.role}</span>
        </div>
      </div>

      <Tabs defaultActiveKey="details" className="mb-3">
        <Tab eventKey="details" title="Profile Details">
          <Form onSubmit={handleProfileSubmit} className="bg-white border rounded-4 p-4 mt-3">
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="small fw-semibold">Full name</Form.Label>
                <Form.Control name="name" value={profileForm.name} onChange={handleProfileChange} required />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">Contact number</Form.Label>
                <Form.Control name="contactNumber" value={profileForm.contactNumber} onChange={handleProfileChange} pattern="[0-9]{10}" />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">House / Flat No.</Form.Label>
                <Form.Control name="houseNumber" value={profileForm.houseNumber} onChange={handleProfileChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">Area</Form.Label>
                <Form.Control name="area" value={profileForm.area} onChange={handleProfileChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">City</Form.Label>
                <Form.Control name="city" value={profileForm.city} onChange={handleProfileChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">State</Form.Label>
                <Form.Control name="state" value={profileForm.state} onChange={handleProfileChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">Country</Form.Label>
                <Form.Control name="country" value={profileForm.country} onChange={handleProfileChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">Pincode</Form.Label>
                <Form.Control name="pincode" value={profileForm.pincode} onChange={handleProfileChange} />
              </Col>
            </Row>
            <Button type="submit" variant="primary" className="mt-4" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save changes'}
            </Button>
          </Form>
        </Tab>

        <Tab eventKey="password" title="Change Password">
          <Form onSubmit={handlePasswordSubmit} className="bg-white border rounded-4 p-4 mt-3" style={{ maxWidth: 420 }}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Current password</Form.Label>
              <Form.Control type="password" name="currentPassword" required value={passwordForm.currentPassword} onChange={handlePasswordChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">New password</Form.Label>
              <Form.Control type="password" name="newPassword" required minLength={6} value={passwordForm.newPassword} onChange={handlePasswordChange} />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Change password'}
            </Button>
          </Form>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Profile;
