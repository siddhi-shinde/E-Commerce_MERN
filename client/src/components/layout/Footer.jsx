import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';

const Footer = () => (
  <footer className="mk-footer mt-5 pt-5 pb-4">
    <div className="container">
      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="mk-brand mb-3" style={{ color: '#fff', fontSize: '1.3rem' }}>
            Multi<span style={{ color: 'var(--mk-accent)' }}>kart</span>
          </div>
          <p className="small mb-3" style={{ color: '#94a3b8', maxWidth: 320 }}>
            A multi-role MERN marketplace demo — real auth, role-based dashboards, and a working
            checkout flow, built for Admins, Vendors, and Customers alike.
          </p>
          <div className="d-flex gap-3 fs-5">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="GitHub"><FaGithub /></a>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <h6 className="mb-3">Shop</h6>
          <div className="d-flex flex-column gap-2">
            <Link to="/">All Products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">My Orders</Link>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <h6 className="mb-3">Account</h6>
          <div className="d-flex flex-column gap-2">
            <Link to="/login">Login</Link>
            <Link to="/register">Sign up</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <h6 className="mb-3">Sell</h6>
          <div className="d-flex flex-column gap-2">
            <Link to="/vendor">Vendor Dashboard</Link>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <h6 className="mb-3">Admin</h6>
          <div className="d-flex flex-column gap-2">
            <Link to="/admin">Admin Panel</Link>
          </div>
        </div>
      </div>

      <div className="mk-footer-bottom pt-3 d-flex flex-wrap justify-content-between gap-2 small">
        <span>&copy; {new Date().getFullYear()} Multikart. Built with the MERN stack.</span>
        <span>Portfolio demo project</span>
      </div>
    </div>
  </footer>
);

export default Footer;
