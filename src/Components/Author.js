import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Button, Badge, Pagination } from 'react-bootstrap';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';
import { apiClient } from '../api/client';
import { getThumbUrl, onImageErrorHide } from '../utils/image';

const Author = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/tim-kiem', {
          params: {
            author: slug,
            page: currentPage,
          },
        });
        setData(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    setError(null);
    fetchData();
  }, [slug, currentPage]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const items = data?.data?.items || [];
  const totalItems = data?.data?.params?.pagination?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const title = data?.seoOnPage?.titleHead || `Tác giả: ${slug}`;
  const desc = data?.seoOnPage?.descriptionHead || '';

  const getStatus = (item) => {
    return item.status || (item.updatedAt && 'Đang cập nhật') || 'Chưa rõ';
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
      </Helmet>
      <Container>
        <Menu />
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>{desc}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          {items && items.length > 0 ? (
            items.map((item, index) => {
              const tooltipText = [
                `Tên: ${item.name}`,
                `Thể loại: ${item.category ? item.category.map(cat => cat.name).join(', ') : 'Không có'}`,
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
                      <Button variant="primary btn-sm" as={Link} to={`/comics/${item.slug}`}>
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
          <Pagination.Prev onClick={() => currentPage > 1 && paginate(currentPage - 1)} disabled={currentPage === 1} />
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            const rangeStart = Math.floor((currentPage - 1) / 5) * 5 + 1;
            const rangeEnd = Math.min(rangeStart + 4, totalPages);
            if (pageNumber >= rangeStart && pageNumber <= rangeEnd) {
              return (
                <Pagination.Item key={pageNumber} active={pageNumber === currentPage} onClick={() => paginate(pageNumber)}>
                  {pageNumber}
                </Pagination.Item>
              );
            }
            return null;
          })}
          <Pagination.Next onClick={() => currentPage < totalPages && paginate(currentPage + 1)} disabled={currentPage === totalPages} />
        </Pagination>
      </Container>
    </>
  );
};

export default Author;


