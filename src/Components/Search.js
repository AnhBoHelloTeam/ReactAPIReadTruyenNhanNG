import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { getThumbUrl, onImageErrorHide } from '../utils/image';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Button, Badge, Pagination, Form } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';
import ComicCard from './UI/ComicCard';
import SectionTitle from './UI/SectionTitle';
import SkeletonGrid from './UI/SkeletonLoader';
import ErrorState from './UI/ErrorState';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [getdata, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    genres: [],
    status: '',
    sort: 'last_update',
    year: '',
  });
  const [genres, setGenres] = useState([]);
  const itemsPerPage = 24;
  const items = getdata?.data?.items;

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await apiClient.get('/the-loai');
        setGenres(response.data.data.items);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          keyword: query,
          genres: filters.genres.join(','),
          status: filters.status,
          sort: filters.sort,
          page: currentPage,
        };
        if (filters.year) {
          params.year = filters.year;
        }
        const response = await apiClient.get('/tim-kiem', { params });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [query, filters, currentPage]);

  if (loading) {
    return (
      <Container>
        <Menu />
        <Row>
          <Col md={3}>
            <div className="skeleton" style={{ height: '400px', borderRadius: '12px' }}></div>
          </Col>
          <Col md={9}>
            <SkeletonGrid count={6} />
          </Col>
        </Row>
      </Container>
    );
  }
  if (error) {
    return (
      <Container>
        <Menu />
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      </Container>
    );
  }

  const totalItems = getdata?.data?.params?.pagination?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFilters((prev) => ({
        ...prev,
        genres: checked
          ? [...prev.genres, value]
          : prev.genres.filter((genre) => genre !== value),
      }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
    setCurrentPage(1);
  };

  // Hàm lấy trạng thái từ dữ liệu
  const getStatus = (item) => {
    return item.status || (item.updatedAt && 'Đang cập nhật') || 'Chưa rõ';
  };

  return (
    <>
      <Helmet>
        <title>{getdata.data.seoOnPage.titleHead}</title>
        <meta name="description" content={getdata.data.seoOnPage.descriptionHead} />
      </Helmet>
      <Container>
        <Menu />
        <Row>
          <Col md={3}>
            <Card style={{ position: 'sticky', top: 80 }}>
              <Card.Body>
                <SectionTitle style={{ marginTop: 0, fontSize: '1.2rem' }}>Bộ lọc</SectionTitle>
                <Form>
                  <Form.Group style={{ marginBottom: 16 }}>
                    <Form.Label style={{ fontWeight: 600, marginBottom: 8 }}>Thể loại</Form.Label>
                    <div style={{ maxHeight: 300, overflowY: 'auto', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                      {genres.map((genre, index) => (
                        <Form.Check
                          key={index}
                          type="checkbox"
                          label={genre.name}
                          value={genre.slug}
                          onChange={handleFilterChange}
                          checked={filters.genres.includes(genre.slug)}
                          style={{ marginBottom: 6 }}
                        />
                      ))}
                    </div>
                  </Form.Group>
                  <Form.Group style={{ marginBottom: 16 }}>
                    <Form.Label style={{ fontWeight: 600, marginBottom: 8 }}>Trạng thái</Form.Label>
                    <Form.Select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <option value="">Tất cả</option>
                      <option value="dang-phat-hanh">Đang phát hành</option>
                      <option value="hoan-thanh">Hoàn thành</option>
                      <option value="sap-ra-mat">Sắp ra mắt</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group style={{ marginBottom: 16 }}>
                    <Form.Label style={{ fontWeight: 600, marginBottom: 8 }}>Sắp xếp</Form.Label>
                    <Form.Select
                      name="sort"
                      value={filters.sort}
                      onChange={handleFilterChange}
                    >
                      <option value="last_update">Mới cập nhật</option>
                      <option value="views">Lượt xem</option>
                      <option value="name">Tên</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group style={{ marginBottom: 16 }}>
                    <Form.Label style={{ fontWeight: 600, marginBottom: 8 }}>Năm</Form.Label>
                    <Form.Select
                      name="year"
                      value={filters.year || ''}
                      onChange={handleFilterChange}
                    >
                      <option value="">Tất cả</option>
                      {[...Array(10)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </Form.Select>
                  </Form.Group>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setFilters({ genres: [], status: '', sort: 'last_update', year: '' });
                      setCurrentPage(1);
                    }}
                    style={{ width: '100%' }}
                  >
                    Xóa bộ lọc
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={9}>
            <div className="hero-section" style={{ marginBottom: 24 }}>
              <SectionTitle style={{ marginTop: 0 }}>Kết quả tìm kiếm: {query || 'Tất cả'}</SectionTitle>
              <p style={{ color: '#1a1a1a', marginBottom: 0 }}>{getdata.data.seoOnPage.descriptionHead}</p>
            </div>
            <Row>
              {items && items.length > 0 ? (
                items.map((item, index) => {
                  const tooltipText = [
                    `Tên: ${item.name}`,
                    `Thể loại: ${item.category ? item.category.map(cat => cat.name).join(', ') : 'Không có'}`,
                    `Mô tả: ${getdata.data.seoOnPage.descriptionHead || 'Không có'}`,
                    `Trạng thái: ${getStatus(item)}`,
                  ].join('\n');
                  return (
                    <Col md={3} key={index}><ComicCard item={item} /></Col>
                  );
                })
              ) : (
                <Col>
                  <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <p>Không tìm thấy kết quả</p>
                  </div>
                </Col>
              )}
            </Row>
            <Pagination className="pagination-container">
              <Pagination.Prev
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                const rangeStart = Math.floor((currentPage - 1) / 5) * 5 + 1;
                const rangeEnd = Math.min(rangeStart + 4, totalPages);
                if (pageNumber >= rangeStart && pageNumber <= rangeEnd) {
                  return (
                    <Pagination.Item
                      key={pageNumber}
                      active={pageNumber === currentPage}
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                }
                return null;
              })}
              <Pagination.Next
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Search;