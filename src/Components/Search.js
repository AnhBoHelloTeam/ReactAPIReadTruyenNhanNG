import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { getThumbUrl, onImageErrorHide } from '../utils/image';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Button, Badge, Pagination, Form } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';

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
        const response = await apiClient.get('/tim-kiem', {
          params: {
            keyword: query,
            genres: filters.genres.join(','),
            status: filters.status,
            sort: filters.sort,
            page: currentPage,
          },
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [query, filters, currentPage]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

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
            <Card>
              <Card.Body>
                <Card.Title>Bộ lọc</Card.Title>
                <Form>
                  <Form.Group>
                    <Form.Label>Thể loại</Form.Label>
                    {genres.map((genre, index) => (
                      <Form.Check
                        key={index}
                        type="checkbox"
                        label={genre.name}
                        value={genre.slug}
                        onChange={handleFilterChange}
                        checked={filters.genres.includes(genre.slug)}
                      />
                    ))}
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Trạng thái</Form.Label>
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
                  <Form.Group>
                    <Form.Label>Sắp xếp</Form.Label>
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
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={9}>
            <Card>
              <Card.Body>
                <Card.Title>Kết quả tìm kiếm: {query}</Card.Title>
                <Card.Text>{getdata.data.seoOnPage.descriptionHead}</Card.Text>
              </Card.Body>
            </Card>
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
                    <Col md={3} key={index}>
                      <Card className="card-equal-height">
                        <LazyLoadImage
                          className="card-img-top"
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

export default Search;