import { NavLink, Outlet } from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';

// Shared shell for the Admin and Vendor dashboards: a dark sidebar of nav
// links (passed in as `links`) with the matching page rendered via <Outlet/>.
const DashboardLayout = ({ title, links }) => {
  return (
    <Container fluid className="px-0">
      <Row className="g-0">
        <Col md={2} className="mk-dash-sidebar p-3">
          <div className="text-white fw-bold mb-3 px-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            {title}
          </div>
          <Nav className="flex-column">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
              >
                {link.icon && <link.icon size={15} />}
                {link.label}
              </NavLink>
            ))}
          </Nav>
        </Col>
        <Col md={10} className="p-4">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardLayout;
