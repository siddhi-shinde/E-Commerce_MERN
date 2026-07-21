import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import { FaThLarge, FaBoxOpen, FaTags, FaStore } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/product/ProductCard';
import AppPagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { getImageUrl } from '../utils/imageUrl';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Highest discount' },
  { value: 'rating', label: 'Highest rated' },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('');
  const [filters, setFilters] = useState({ brand: '', minPrice: '', maxPrice: '', rating: '' });
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProductCount, setTotalProductCount] = useState(null);

  const hasActiveFilters = Boolean(activeCategory || filters.brand || filters.minPrice || filters.maxPrice || filters.rating);

  // Load filter option lists + a lightweight total-product count (for the hero stats strip) once
  useEffect(() => {
    axiosInstance.get('/categories/getActiveCategories').then((res) => setCategories(res.data.categories)).catch(() => {});
    axiosInstance.get('/brands/getActiveBrands').then((res) => setBrands(res.data.brands)).catch(() => {});
    axiosInstance
      .get('/products/getAllProducts', { params: { page: 1, limit: 1 } })
      .then((res) => setTotalProductCount(res.data.total))
      .catch(() => {});
  }, []);

  // The backend exposes getAllProducts (paginated), search, and filter as
  // separate endpoints that don't compose. We pick whichever applies, then
  // apply sort client-side on top of whatever set of products came back.
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      let list = [];
      let pages = 1;

      if (searchQuery) {
        const { data } = await axiosInstance.get('/products/search', { params: { query: searchQuery } });
        list = data.products;
      } else if (hasActiveFilters) {
        const { data } = await axiosInstance.get('/products/filter', {
          params: {
            category: activeCategory || undefined,
            brand: filters.brand || undefined,
            minPrice: filters.minPrice || undefined,
            maxPrice: filters.maxPrice || undefined,
            rating: filters.rating || undefined,
          },
        });
        list = data.products;
      } else {
        const { data } = await axiosInstance.get('/products/getAllProducts', { params: { page, limit: 12 } });
        list = data.products;
        pages = data.totalPages || 1;
      }

      setProducts(list);
      setTotalPages(pages);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, hasActiveFilters, activeCategory, filters, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset to page 1 whenever the query changes underneath the paginated view
  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeCategory, filters]);

  const sortedProducts = useMemo(() => {
    if (!sortBy) return products;
    const list = [...products];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => (a.finalPrice ?? a.price) - (b.finalPrice ?? b.price));
      case 'price-desc':
        return list.sort((a, b) => (b.finalPrice ?? b.price) - (a.finalPrice ?? a.price));
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'discount':
        return list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      case 'rating':
        return list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      default:
        return list;
    }
  }, [products, sortBy]);

  const handleCategoryClick = (categoryId) => {
    setActiveCategory((prev) => (prev === categoryId ? '' : categoryId));
    setSearchParams({});
  };

  const clearFilters = () => {
    setActiveCategory('');
    setFilters({ brand: '', minPrice: '', maxPrice: '', rating: '' });
    setSearchParams({});
  };

  return (
    <>
      {/* ---- Hero ---- */}
      <div className="mk-hero py-5">
        <div className="mk-hero-blob" style={{ width: 260, height: 260, top: -80, right: '8%' }} />
        <div className="mk-hero-blob" style={{ width: 180, height: 180, bottom: -60, left: '4%', background: 'var(--mk-accent)' }} />
        <Container className="position-relative">
          <Row className="align-items-center g-4">
            <Col lg={7}>
              <span className="mk-hero-eyebrow mb-3">
                <FaStore size={12} /> Multi-Vendor Marketplace
              </span>
              <h1 className="mk-hero-title mb-3">
                Shop smarter, <br /> sell faster.
              </h1>
              <p className="mb-4" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 480 }}>
                Browse products from independent vendors across every category, with real-time stock,
                verified reviews, and role-based storefronts for admins and sellers alike.
              </p>
              <div className="d-flex gap-4 flex-wrap">
                <div>
                  <div className="mk-hero-stat-value">{totalProductCount ?? '—'}</div>
                  <div className="mk-hero-stat-label d-flex align-items-center gap-1">
                    <FaBoxOpen size={11} /> Products
                  </div>
                </div>
                <div>
                  <div className="mk-hero-stat-value">{brands.length || '—'}</div>
                  <div className="mk-hero-stat-label d-flex align-items-center gap-1">
                    <FaStore size={11} /> Brands
                  </div>
                </div>
                <div>
                  <div className="mk-hero-stat-value">{categories.length || '—'}</div>
                  <div className="mk-hero-stat-label d-flex align-items-center gap-1">
                    <FaTags size={11} /> Categories
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ---- Category rail: the page's wayfinding signature ---- */}
      <div className="border-bottom" style={{ background: '#fff' }}>
        <Container className="py-3">
          <div className="mk-category-rail">
            <button
              className={`mk-category-pill ${!activeCategory ? 'active' : ''}`}
              onClick={() => handleCategoryClick('')}
            >
              <FaThLarge size={13} /> All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`mk-category-pill ${activeCategory === cat._id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat._id)}
              >
                {cat.categoryImage ? (
                  <img src={getImageUrl(cat.categoryImage)} alt="" width={18} height={18} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <FaThLarge size={13} />
                )}
                {cat.categoryName}
              </button>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          {/* ---- Filters sidebar ---- */}
          <Col lg={3} className="mb-4">
            <div className="bg-white border rounded-4 p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Filters</h6>
                {hasActiveFilters && (
                  <button className="btn btn-link btn-sm p-0" onClick={clearFilters}>
                    Clear all
                  </button>
                )}
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Brand</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                >
                  <option value="">All brands</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.brandName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Price range</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    size="sm"
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                  <Form.Control
                    size="sm"
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
              </Form.Group>

              <Form.Group>
                <Form.Label className="small fw-semibold">Minimum rating</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                >
                  <option value="">Any rating</option>
                  {[4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r}+ stars
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </Col>

          {/* ---- Product grid ---- */}
          <Col lg={9}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h5 className="mb-0">
                {searchQuery ? `Results for "${searchQuery}"` : hasActiveFilters ? 'Filtered products' : 'All products'}
                <span className="text-muted fw-normal small ms-2">({sortedProducts.length})</span>
              </h5>
              <Form.Select size="sm" style={{ width: 'auto' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </Form.Select>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: 'var(--mk-primary)' }} />
              </div>
            ) : sortedProducts.length === 0 ? (
              <EmptyState title="No products found" message="Try adjusting your filters or search terms." />
            ) : (
              <>
                <Row xs={1} sm={2} xl={3} className="g-3">
                  {sortedProducts.map((product) => (
                    <Col key={product._id}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
                {!searchQuery && !hasActiveFilters && (
                  <AppPagination page={page} totalPages={totalPages} onPageChange={setPage} />
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
