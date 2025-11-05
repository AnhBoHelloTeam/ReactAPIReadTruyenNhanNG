import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { getThumbUrl, onImageErrorHide } from '../utils/image';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Button, Badge, Pagination, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';
import ComicCard from './UI/ComicCard';
import SectionTitle from './UI/SectionTitle';
import SkeletonGrid from './UI/SkeletonLoader';
import ErrorState from './UI/ErrorState';

const Trending = () => {
  const { slug } = useParams();
  const [getdata, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeRange, setTimeRange] = useState('week');
  const [sortBy, setSortBy] = useState('last_update');
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const items = getdata?.data?.data?.items;
  const itemsPerPage = 24;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(`/danh-sach/${slug}`, {
          params: {
            page: currentPage,
            time: timeRange,
            sort: sortBy,
            genres: selectedGenres.join(','),
          },
        });
        setData(response);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, currentPage, timeRange, sortBy, selectedGenres]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await apiClient.get('/the-loai');
        setGenres(res?.data?.data?.items || []);
      } catch (_) {}
    };
    fetchGenres();
  }, []);

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

  const handleTimeChange = (e) => {
    setTimeRange(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleGenreToggle = (gslug) => {
    setSelectedGenres((prev) => {
      const has = prev.includes(gslug);
      return has ? prev.filter((s) => s !== gslug) : [...prev, gslug];
    });
    setCurrentPage(1);
  };

  // Hàm lấy trạng thái từ dữ liệu
  const getStatus = (item) => {
    return item.status || (item.updatedAt && 'Đang cập nhật') || 'Chưa rõ';
  };

  return (
    <>
      <Helmet>
        <title>{getdata.data?.data.seoOnPage.titleHead}</title>
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
                    <Form.Label style={{ fontWeight: 600, marginBottom: 8 }}>Thời gian</Form.Label>
                    <Form.Select value={timeRange} onChange={handleTimeChange}>
                      <option value="day">Hôm nay</option>
                      <option value="week">Tuần</option>
                      <option value="month">Tháng</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group style={{ marginBottom: 16 }}>
                    <Form.Label style={{ fontWeight: 600, marginBottom: 8 }}>Sắp xếp</Form.Label>
                    <Form.Select value={sortBy} onChange={handleSortChange}>
                      <option value="last_update">Mới cập nhật</option>
                      <option value="views">Lượt xem</option>
                      <option value="name">Tên</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label style={{ fontWeight: 600, marginBottom: 8 }}>Thể loại</Form.Label>
                    <div style={{ maxHeight: 300, overflowY: 'auto', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                      {genres.map((g) => (
                        <Form.Check
                          key={g.slug}
                          type="checkbox"
                          label={g.name}
                          checked={selectedGenres.includes(g.slug)}
                          onChange={() => handleGenreToggle(g.slug)}
                          style={{ marginBottom: 6 }}
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={9}>
            <div className="hero-section" style={{ marginBottom: 24 }}>
              <SectionTitle style={{ marginTop: 0 }}>{getdata.data?.data.seoOnPage.titleHead}</SectionTitle>
              <p style={{ color: '#1a1a1a', marginBottom: 0 }}>{getdata.data?.data.seoOnPage.descriptionHead}</p>
            </div>
            <Row>
          {items && items.length > 0 ? (
            items.map((item, index) => {
              const tooltipText = [
                `Tên: ${item.name}`,
                `Thể loại: ${item.category ? item.category.map(cat => cat.name).join(', ') : 'Không có'}`,
                `Mô tả: ${getdata.data?.data.seoOnPage.descriptionHead || 'Không có'}`,
                `Trạng thái: ${getStatus(item)}`,
              ].join('\n');
              return (
                    <Col md={3} key={index}><ComicCard item={item} /></Col>
              );
            })
              ) : (
                <Col>
                  <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <p>Không có truyện nào</p>
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

export default Trending;