import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Button, Badge, Pagination } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';

const Genre = () => {
  const { slug } = useParams();
  const [getdata, setData] = useState([]);
  const itemsPerPage = 24;
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const items = getdata?.data?.data?.items;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://otruyenapi.com/v1/api/the-loai/${slug}?page=${currentPage}`);
        setData(response);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, currentPage]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const totalItems = getdata?.data?.params?.pagination?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Hàm lấy trạng thái từ dữ liệu
  const getStatus = (item) => {
    return item.status || (item.updatedAt && 'Đang cập nhật') || 'Chưa rõ';
  };

  return (
    <>
      <Helmet>
        <title>{getdata.data.data.seoOnPage.titleHead}</title>
      </Helmet>
      <Container>
        <Menu />
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
                <Card.Title>{getdata.data.data.seoOnPage.titleHead}</Card.Title>
                {getdata.data.data.seoOnPage.descriptionHead}
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
                `Mô tả: ${getdata.data.data.seoOnPage.descriptionHead || 'Không có'}`,
                `Trạng thái: ${getStatus(item)}`,
              ].join('\n');
              return (
                <Col md={3} key={index}>
                  <Card className="card-equal-height">
                    <LazyLoadImage
                      src={`https://img.otruyenapi.com/uploads/comics/${item.thumb_url}`}
                      alt={item.name}
                      effect="blur"
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
      </Container>
    </>
  );
};

export default Genre;