import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Nav, NavDropdown, Form, InputGroup, Button } from 'react-bootstrap';
import { FaShoppingCart, FaUserCircle, FaSearch, FaStore, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AppNavbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const cart = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/?search=${encodeURIComponent(query.trim())}` : '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="mk-navbar sticky-top">
      <Container className="d-flex align-items-center justify-content-between py-2 gap-3 flex-wrap">
        <Link to="/" className="mk-brand">
          Multi<span>kart</span>
        </Link>

        <Form className="flex-grow-1 mx-lg-4" style={{ maxWidth: '480px' }} onSubmit={handleSearch}>
          <InputGroup>
            <Form.Control
              placeholder="Search products, brands, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" variant="primary">
              <FaSearch />
            </Button>
          </InputGroup>
        </Form>

        <Nav className="align-items-center gap-1">
          <Nav.Link as={Link} to="/" className="fw-semibold">
            Shop
          </Nav.Link>

          {user?.role === 'admin' && (
            <Nav.Link as={Link} to="/admin" className="fw-semibold d-flex align-items-center gap-1">
              <FaUserShield /> Admin
            </Nav.Link>
          )}
          {user?.role === 'vendor' && (
            <Nav.Link as={Link} to="/vendor" className="fw-semibold d-flex align-items-center gap-1">
              <FaStore /> Vendor
            </Nav.Link>
          )}

          {user?.role === 'customer' && (
            <Nav.Link as={Link} to="/cart" className="position-relative fw-semibold">
              <FaShoppingCart size={18} />
              {cart.totalQuantity > 0 && (
                <span className="badge rounded-pill bg-danger mk-cart-badge">{cart.totalQuantity}</span>
              )}
            </Nav.Link>
          )}

          {isAuthenticated ? (
            <NavDropdown
              title={
                <span className="d-inline-flex align-items-center gap-1 fw-semibold">
                  <FaUserCircle size={18} /> {user.name?.split(' ')[0]}
                </span>
              }
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">
                My Profile
              </NavDropdown.Item>
              {user.role === 'customer' && (
                <NavDropdown.Item as={Link} to="/orders">
                  My Orders
                </NavDropdown.Item>
              )}
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          ) : (
            <>
              <Nav.Link as={Link} to="/login" className="fw-semibold">
                Login
              </Nav.Link>
              <Link to="/register" className="btn btn-primary btn-sm ms-1">
                Sign up
              </Link>
            </>
          )}
        </Nav>
      </Container>
    </nav>
  );
};

export default AppNavbar;
