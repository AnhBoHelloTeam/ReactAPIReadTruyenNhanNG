import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { getThumbUrl, onImageErrorHide } from '../utils/image';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Button, Badge, Pagination, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

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
            <Card>
              <Card.Body>
                <Card.Title>Bộ lọc</Card.Title>
                <Form>
                  <Form.Group style={{ marginBottom: 10 }}>
                    <Form.Label>Thời gian</Form.Label>
                    <Form.Select value={timeRange} onChange={handleTimeChange}>
                      <option value="day">Hôm nay</option>
                      <option value="week">Tuần</option>
                      <option value="month">Tháng</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group style={{ marginBottom: 10 }}>
                    <Form.Label>Sắp xếp</Form.Label>
                    <Form.Select value={sortBy} onChange={handleSortChange}>
                      <option value="last_update">Mới cập nhật</option>
                      <option value="views">Lượt xem</option>
                      <option value="name">Tên</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Thể loại</Form.Label>
                    <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #eee', padding: 8 }}>
                      {genres.map((g) => (
                        <Form.Check
                          key={g.slug}
                          type="checkbox"
                          label={g.name}
                          checked={selectedGenres.includes(g.slug)}
                          onChange={() => handleGenreToggle(g.slug)}
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={9}>
            <Card>
              <Card.Body>
                <Card.Title>{getdata.data?.data.seoOnPage.titleHead}</Card.Title>
                <Card.Text>{getdata.data?.data.seoOnPage.descriptionHead}</Card.Text>
              </Card.Body>
            </Card>
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
                <Col md={3} key={index}>
                  <Card className="card-equal-height">
                    <LazyLoadImage
                      src={getThumbUrl(item.thumb_url)}
                      alt={item.name}
                      effect="blur"
                      onError={onImageErrorHide}
                      style={{ width: '100%', height: 'auto' }}
                    />
                    <Card.Body>
                      <Card.Title className="card-title-ellipsis" title={tooltipText}>
                        {item.name}
                      </Card.Title>
                      <Card.Text>
                        {item.category && item.category.length > 0 ? (
                          <span className="category-ellipsis" title={item.category.map(cat => cat.name).join(', ')}>
                            {item.category.slice(0, 2).map((cat, i) => (
                              <Badge bg="info" key={i}>{cat.name}</Badge>
                            ))}
                            {item.category.length > 2 && '...'}
                          </span>
                        ) : 'Others'}
                      </Card.Text>
                      <Button
                        variant="primary btn-sm"
                        as={Link}
                        to={`/comics/${item.slug}`}
                      >
                        More Detail
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          ) : (
            <Col>
              <Card.Body>No Content Available</Card.Body>
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