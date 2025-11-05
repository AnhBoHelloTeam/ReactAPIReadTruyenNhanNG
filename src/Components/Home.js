import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { getThumbUrl, onImageErrorHide } from '../utils/image';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Button, Badge, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';

const Home = () => {
  const [getdata, setData] = useState([]);
  const [hotComics, setHotComics] = useState([]);
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const items = getdata?.data?.data?.items;
  const itemsPerPage = 24;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(
          `https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${currentPage}`
        );
        setData(response);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    const fetchHotComics = async () => {
      try {
        const response = await apiClient.get('/danh-sach/truyen-hot');
        setHotComics(response.data.data.items.slice(0, 4)); // Lấy 4 truyện hot
      } catch (error) {
        console.error('Error fetching hot comics:', error);
      }
    };
    fetchHotComics();
  }, []);

  // Fetch additional home blocks once
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const [ongoingRes, completedRes, upcomingRes, trendingRes] = await Promise.all([
          apiClient.get('/danh-sach/dang-phat-hanh?page=1'),
          apiClient.get('/danh-sach/hoan-thanh?page=1'),
          apiClient.get('/danh-sach/sap-ra-mat?page=1'),
          apiClient.get('/danh-sach/trending?page=1'),
        ]);
        setOngoing((ongoingRes.data?.data?.items || []).slice(0, 8));
        setCompleted((completedRes.data?.data?.items || []).slice(0, 8));
        setUpcoming((upcomingRes.data?.data?.items || []).slice(0, 8));
        setTrending((trendingRes.data?.data?.items || []).slice(0, 8));
      } catch (e) {
        console.error('Error fetching home blocks', e);
      }
    };
    fetchBlocks();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const totalItems = getdata?.data?.params?.pagination?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Helmet>
        <title>{getdata.data?.data?.seoOnPage.titleHead}</title>
        <meta name="description" content={getdata.data?.data?.seoOnPage.descriptionHead} />
      </Helmet>
      <Container>
        <Menu />
        <Row>
          <Col>
            <h3>Truyện Hot</h3>
            <Row>
              {hotComics.length > 0 ? (
                hotComics.map((comic, index) => (
                  <Col md={3} key={index}>
                    <Card className="card-equal-height">
                      <LazyLoadImage
                        src={getThumbUrl(comic.thumb_url)}
                        alt={comic.name}
                        effect="blur"
                        onError={onImageErrorHide}
                        style={{ width: '100%', height: 'auto' }}
                      />
                      <Card.Body>
                        <Card.Title className="card-title-ellipsis" title={comic.name}>
                          {comic.name}
                        </Card.Title>
                        <Button as={Link} to={`/comics/${comic.slug}`}>
                          More Detail
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col>
                  <p>Không có truyện hot</p>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        {/* Ongoing */}
        <Row>
          <Col>
            <h3>Đang phát hành</h3>
            <Row>
              {ongoing.length > 0 ? (
                ongoing.map((item, index) => (
                  <Col md={3} key={`ongoing-${index}`}>
                    <Card className="card-equal-height">
                      <LazyLoadImage
                        src={getThumbUrl(item.thumb_url)}
                        alt={item.name}
                        effect="blur"
                        onError={onImageErrorHide}
                        style={{ width: '100%', height: 'auto' }}
                      />
                      <Card.Body>
                        <Card.Title className="card-title-ellipsis" title={item.name}>
                          {item.name}
                        </Card.Title>
                        <Button as={Link} to={`/comics/${item.slug}`}>
                          More Detail
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col>
                  <p>Không có dữ liệu</p>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        {/* Completed */}
        <Row>
          <Col>
            <h3>Hoàn thành</h3>
            <Row>
              {completed.length > 0 ? (
                completed.map((item, index) => (
                  <Col md={3} key={`completed-${index}`}>
                    <Card className="card-equal-height">
                      <LazyLoadImage
                        src={getThumbUrl(item.thumb_url)}
                        alt={item.name}
                        effect="blur"
                        onError={onImageErrorHide}
                        style={{ width: '100%', height: 'auto' }}
                      />
                      <Card.Body>
                        <Card.Title className="card-title-ellipsis" title={item.name}>
                          {item.name}
                        </Card.Title>
                        <Button as={Link} to={`/comics/${item.slug}`}>
                          More Detail
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col>
                  <p>Không có dữ liệu</p>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        {/* Upcoming */}
        <Row>
          <Col>
            <h3>Sắp ra mắt</h3>
            <Row>
              {upcoming.length > 0 ? (
                upcoming.map((item, index) => (
                  <Col md={3} key={`upcoming-${index}`}>
                    <Card className="card-equal-height">
                      <LazyLoadImage
                        src={getThumbUrl(item.thumb_url)}
                        alt={item.name}
                        effect="blur"
                        onError={onImageErrorHide}
                        style={{ width: '100%', height: 'auto' }}
                      />
                      <Card.Body>
                        <Card.Title className="card-title-ellipsis" title={item.name}>
                          {item.name}
                        </Card.Title>
                        <Button as={Link} to={`/comics/${item.slug}`}>
                          More Detail
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col>
                  <p>Không có dữ liệu</p>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        {/* Trending */}
        <Row>
          <Col>
            <h3>Top Trending</h3>
            <Row>
              {trending.length > 0 ? (
                trending.map((item, index) => (
                  <Col md={3} key={`trending-${index}`}>
                    <Card className="card-equal-height">
                      <LazyLoadImage
                        src={getThumbUrl(item.thumb_url)}
                        alt={item.name}
                        effect="blur"
                        onError={onImageErrorHide}
                        style={{ width: '100%', height: 'auto' }}
                      />
                      <Card.Body>
                        <Card.Title className="card-title-ellipsis" title={item.name}>
                          {item.name}
                        </Card.Title>
                        <Button as={Link} to={`/comics/${item.slug}`}>
                          More Detail
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col>
                  <p>Không có dữ liệu</p>
                </Col>
              )}
            </Row>
          </Col>
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
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>{getdata.data?.data?.seoOnPage.titleHead}</Card.Title>
                <Card.Text>{getdata.data?.data?.seoOnPage.descriptionHead}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          {items && items.length > 0 ? (
            items.map((item, index) => (
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
                    <Card.Title className="card-title-ellipsis" title={item.name}>
                      {item.name}
                    </Card.Title>
                    <Card.Text>{item.updatedAt}</Card.Text>
                    <Card.Text>
                      {item.category && item.category.length > 0
                        ? item.category.map((category, i) => (
                            <Badge bg="info" key={i}>
                              {category.name}
                            </Badge>
                          ))
                        : 'Others'}
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
            ))
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
      </Container>
    </>
  );
};

export default Home;