import { apiClient } from '../../api/client';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Nav, Navbar, NavDropdown, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Menu = () => {
  const navigate = useNavigate();
  const [getdata, setData] = useState([]);
  const items = getdata?.data?.items;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/the-loai');
        setData(response.data);
      } catch (error) {}
    };
    fetchData();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('keyword');
    navigate(`/search?query=${query}`);
  };

  return (
    <div>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand as={Link} to="/">NhanNG Truyen React</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/trending/dang-phat-hanh">Đang phát hành</Nav.Link>
              <Nav.Link as={Link} to="/trending/hoan-thanh">Hoàn thành</Nav.Link>
              <Nav.Link as={Link} to="/trending/sap-ra-mat">Sắp ra mắt</Nav.Link>
              <Nav.Link as={Link} to="/history">Lịch sử đọc</Nav.Link> {/* Thêm liên kết */}
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
              <Form inline autoComplete="off" method="get" onSubmit={handleSearch}>
                <Row>
                  <Col xs="auto">
                    <Form.Control
                      type="text"
                      name="keyword"
                      placeholder="Tìm kiếm truyện tranh"
                      className="mr-sm-2"
                    />
                  </Col>
                  <Col xs="auto">
                    <Button type="submit">Search</Button>
                  </Col>
                </Row>
              </Form>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Menu;