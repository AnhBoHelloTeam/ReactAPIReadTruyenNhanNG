import { apiClient } from '../../api/client';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Nav, Navbar, NavDropdown, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Menu = () => {
  const navigate = useNavigate();
  const [getdata, setData] = useState([]);
  const items = getdata?.data?.items;
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/the-loai');
        setData(response.data);
      } catch (error) {}
    };
    fetchData();
  }, []);

  // debounce suggest
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const kw = query?.trim();
      if (!kw) {
        setSuggestions([]);
        setShowSuggest(false);
        return;
      }
      try {
        setIsFetching(true);
        // fallback dùng /tim-kiem trang 1 làm suggest nhanh
        const res = await apiClient.get('/tim-kiem', {
          params: { keyword: kw, page: 1 },
          signal: controller.signal,
        });
        const items = res?.data?.data?.items || [];
        setSuggestions(items.slice(0, 8));
        setShowSuggest(true);
      } catch (e) {
        if (e.name !== 'CanceledError') {
          setSuggestions([]);
          setShowSuggest(false);
        }
      } finally {
        setIsFetching(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const handleSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const kw = formData.get('keyword');
    setShowSuggest(false);
    navigate(`/search?query=${kw}`);
  };

  const handleSelectSuggest = (slug) => {
    setShowSuggest(false);
    navigate(`/comics/${slug}`);
  };

  return (
    <div>
      <Navbar expand="lg" className="bg-body-tertiary" sticky="top" data-bs-theme="dark">
        <Container>
          <Navbar.Brand as={Link} to="/">NhanNG Truyen</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/trending/dang-phat-hanh">Đang phát hành</Nav.Link>
              <Nav.Link as={Link} to="/trending/hoan-thanh">Hoàn thành</Nav.Link>
              <Nav.Link as={Link} to="/trending/sap-ra-mat">Sắp ra mắt</Nav.Link>
              <Nav.Link as={Link} to="/history">Lịch sử đọc</Nav.Link> {/* Thêm liên kết */}
              <Nav.Link as={Link} to="/favorites">Yêu thích</Nav.Link>
              <Nav.Link as={Link} to="/genres">Thể loại (grid)</Nav.Link>
              <NavDropdown title="Thể loại" id="basic-nav-dropdown">
                {items && items.length > 0 ? (
                  items.map((item, index) => (
                    <NavDropdown.Item as={Link} to={`/genre/${item.slug}`} key={index}>
                      {item.name}
                    </NavDropdown.Item>
                  ))
                ) : (
                  <NavDropdown.Item as={Link} to="/">
                    Newest
                  </NavDropdown.Item>
                )}
              </NavDropdown>
              <div style={{ position: 'relative' }}>
                <Form inline autoComplete="off" method="get" onSubmit={handleSearch}>
                  <Row>
                    <Col xs="auto">
                      <Form.Control
                        type="text"
                        name="keyword"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query && suggestions.length && setShowSuggest(true)}
                        placeholder="Tìm kiếm truyện tranh"
                        className="mr-sm-2"
                      />
                    </Col>
                    <Col xs="auto">
                      <Button type="submit" disabled={isFetching && !suggestions.length}>Search</Button>
                    </Col>
                  </Row>
                </Form>
                {showSuggest && suggestions.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      border: '1px solid #e5e5e5',
                      zIndex: 1100,
                      maxHeight: 400,
                      overflowY: 'auto',
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {suggestions.map((s, idx) => (
                      <div
                        key={idx}
                        style={{ padding: '8px 12px', cursor: 'pointer' }}
                        onClick={() => handleSelectSuggest(s.slug)}
                        title={s.name}
                      >
                        {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Menu;