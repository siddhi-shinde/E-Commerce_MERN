import { Routes, Route } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaTags, FaThLarge, FaBoxOpen, FaClipboardList } from 'react-icons/fa';

import AppNavbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBrands from './pages/admin/AdminBrands';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorProductForm from './pages/vendor/VendorProductForm';
import VendorOrders from './pages/vendor/VendorOrders';

const adminLinks = [
  { to: '/admin', end: true, label: 'Dashboard', icon: FaTachometerAlt },
  { to: '/admin/users', label: 'Users', icon: FaUsers },
  { to: '/admin/brands', label: 'Brands', icon: FaTags },
  { to: '/admin/categories', label: 'Categories', icon: FaThLarge },
  { to: '/admin/products', label: 'Products', icon: FaBoxOpen },
  { to: '/admin/orders', label: 'Orders', icon: FaClipboardList },
];

const vendorLinks = [
  { to: '/vendor', end: true, label: 'Dashboard', icon: FaTachometerAlt },
  { to: '/vendor/products', label: 'My Products', icon: FaBoxOpen },
  { to: '/vendor/orders', label: 'Orders', icon: FaClipboardList },
];

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />

      <main className="flex-grow-1">
        <Routes>
          {/* Public / customer-facing */}
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Customer only */}
          <Route element={<ProtectedRoute roles={['customer']} />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout title="Admin Panel" links={adminLinks} />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>
          </Route>

          {/* Vendor only */}
          <Route element={<ProtectedRoute roles={['vendor']} />}>
            <Route path="/vendor" element={<DashboardLayout title="Vendor Panel" links={vendorLinks} />}>
              <Route index element={<VendorDashboard />} />
              <Route path="products" element={<VendorProducts />} />
              <Route path="products/new" element={<VendorProductForm />} />
              <Route path="products/:id/edit" element={<VendorProductForm />} />
              <Route path="orders" element={<VendorOrders />} />
            </Route>
          </Route>

          {/* Admin AND Vendor share order details view via customer route pattern already covers admin/owner check server-side */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
